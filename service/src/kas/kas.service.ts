import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { DatabaseService } from 'src/database/database.service';
import { RoleService } from 'src/role/role.service';

const TABLE = 'kas_transcation'
const MANAGE_ROLES = ['Bendahara', 'Ketua', 'Wakil Ketua']
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

type KasRequestUser = { nis: number, is_admin: boolean }
type KasInput = {
  amount: number,
  jenis: 'masuk' | 'keluar',
  keterangan: string,
  waktu: string,
  member_ekskul_id?: number | string | null
}
type KasPeriod = { month: number, year: number, start: Date, end: Date }
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000

@Injectable()
export class KasService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly roleService: RoleService
  ) {}

  private async assertMember(req: KasRequestUser, ekskulId: number) {
    if (req.is_admin !== false) throw new ForbiddenException('Anda Tidak Berhak')
    const role = await this.roleService.getRole(req.nis, ekskulId)
    if (!role) throw new ForbiddenException('Anda bukan anggota ekstrakurikuler ini')
    return role as string
  }

  private async assertManager(req: KasRequestUser, ekskulId: number) {
    const role = await this.assertMember(req, ekskulId)
    if (!MANAGE_ROLES.includes(role)) throw new ForbiddenException('Hanya Bendahara, Ketua, atau Wakil Ketua yang dapat mengelola kas')
  }

  private parsePeriod(monthValue?: string, yearValue?: string): KasPeriod {
    const currentDate = new Date()
    const month = monthValue === undefined ? currentDate.getUTCMonth() + 1 : Number(monthValue)
    const year = yearValue === undefined ? currentDate.getUTCFullYear() : Number(yearValue)
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new BadRequestException('Bulan harus bernilai antara 1 dan 12')
    }
    if (!Number.isInteger(year) || year < 2000 || year > 2200) {
      throw new BadRequestException('Tahun laporan tidak valid')
    }
    return {
      month,
      year,
      start: new Date(Date.UTC(year, month - 1, 1) - JAKARTA_OFFSET_MS),
      end: new Date(Date.UTC(year, month, 1) - JAKARTA_OFFSET_MS)
    }
  }

  private validateInput(input: KasInput) {
    const amount = Number(input?.amount)
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new BadRequestException('Jumlah transaksi harus berupa bilangan bulat lebih dari 0')
    }
    if (input?.jenis !== 'masuk' && input?.jenis !== 'keluar') {
      throw new BadRequestException('Jenis transaksi harus pemasukan atau pengeluaran')
    }
    const keterangan = input?.keterangan?.trim()
    if (!keterangan) throw new BadRequestException('Keterangan transaksi wajib diisi')
    const waktu = new Date(input?.waktu)
    if (!input?.waktu || Number.isNaN(waktu.getTime())) {
      throw new BadRequestException('Tanggal transaksi tidak valid')
    }
    const rawMemberId = input.member_ekskul_id
    const member_ekskul_id = rawMemberId === '' || rawMemberId === undefined || rawMemberId === null
      ? null
      : Number(rawMemberId)
    if (member_ekskul_id !== null && (!Number.isInteger(member_ekskul_id) || member_ekskul_id <= 0)) {
      throw new BadRequestException('Anggota transaksi tidak valid')
    }
    if (input.jenis === 'keluar' && member_ekskul_id !== null) {
      throw new BadRequestException('Pengeluaran tidak dapat dikaitkan dengan anggota pembayar')
    }
    return { amount, jenis: input.jenis, keterangan, waktu: waktu.toISOString(), member_ekskul_id }
  }

  private async validateMemberForEkskul(ekskulId: number, memberId: number | null) {
    if (memberId === null) return
    const member = await this.databaseService.connection('member_ekskul')
      .select('id')
      .where({ id: memberId, ekskul_id: ekskulId })
      .first()
    if (!member) throw new BadRequestException('Anggota tidak ditemukan di ekstrakurikuler ini')
  }

  private async getReportData(ekskulId: number, monthValue?: string, yearValue?: string) {
    const period = this.parsePeriod(monthValue, yearValue)
    const ekskul = await this.databaseService.connection('ekskul')
      .select('name')
      .where({ id: ekskulId })
      .first()
    if (!ekskul) throw new NotFoundException('Ekskul tidak ditemukan')

    const [transactions, members, openingTotals, allTimeTotals, monthTotals] = await Promise.all([
      this.databaseService.connection(`${TABLE} as kas`)
        .leftJoin('member_ekskul as member', 'member.id', 'kas.member_ekskul_id')
        .leftJoin('users', 'users.nis', 'member.nis_user')
        .select({
          id: 'kas.id',
          amount: 'kas.amount',
          jenis: 'kas.jenis',
          keterangan: 'kas.keterangan',
          waktu: 'kas.waktu',
          member_ekskul_id: 'kas.member_ekskul_id',
          member_name: 'users.name'
        })
        .where('kas.ekskul_id', ekskulId)
        .andWhere('kas.waktu', '>=', period.start)
        .andWhere('kas.waktu', '<', period.end)
        .orderBy('kas.waktu', 'desc')
        .orderBy('kas.id', 'desc'),
      this.databaseService.connection('member_ekskul')
        .innerJoin('users', 'users.nis', 'member_ekskul.nis_user')
        .select({
          id: 'member_ekskul.id',
          nis: 'users.nis',
          name: 'users.name',
          role: 'member_ekskul.role'
        })
        .where('member_ekskul.ekskul_id', ekskulId)
        .orderBy('users.name'),
      this.databaseService.connection(TABLE).where({ ekskul_id: ekskulId })
        .andWhere('waktu', '<', period.start)
        .sum({ masuk: this.databaseService.connection.raw("case when jenis = 'masuk' then amount else 0 end") })
        .sum({ keluar: this.databaseService.connection.raw("case when jenis = 'keluar' then amount else 0 end") })
        .first(),
      this.databaseService.connection(TABLE).where({ ekskul_id: ekskulId })
        .sum({ masuk: this.databaseService.connection.raw("case when jenis = 'masuk' then amount else 0 end") })
        .sum({ keluar: this.databaseService.connection.raw("case when jenis = 'keluar' then amount else 0 end") })
        .first(),
      this.databaseService.connection(TABLE).where({ ekskul_id: ekskulId })
        .andWhere('waktu', '>=', period.start)
        .andWhere('waktu', '<', period.end)
        .sum({ masuk: this.databaseService.connection.raw("case when jenis = 'masuk' then amount else 0 end") })
        .sum({ keluar: this.databaseService.connection.raw("case when jenis = 'keluar' then amount else 0 end") })
        .first()
    ])

    const openingBalance = Number(openingTotals?.masuk || 0) - Number(openingTotals?.keluar || 0)
    const totalIncome = Number(monthTotals?.masuk || 0)
    const totalExpense = Number(monthTotals?.keluar || 0)
    const lifetimeIncome = Number(allTimeTotals?.masuk || 0)
    const lifetimeExpense = Number(allTimeTotals?.keluar || 0)
    const memberPaid = new Map<number, number>()
    for (const transaction of transactions) {
      if (transaction.jenis === 'masuk' && transaction.member_ekskul_id) {
        const memberId = Number(transaction.member_ekskul_id)
        memberPaid.set(memberId, (memberPaid.get(memberId) || 0) + Number(transaction.amount))
      }
    }

    return {
      ekskulName: ekskul.name as string,
      period,
      transactions: transactions.map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount),
        member_ekskul_id: transaction.member_ekskul_id === null ? null : Number(transaction.member_ekskul_id)
      })),
      members: members.map((member) => ({
        ...member,
        id: Number(member.id),
        nis: Number(member.nis),
        paidAmount: memberPaid.get(Number(member.id)) || 0
      })),
      summary: {
        openingBalance,
        totalIncome,
        totalExpense,
        closingBalance: openingBalance + totalIncome - totalExpense,
        currentBalance: lifetimeIncome - lifetimeExpense
      }
    }
  }

  async getKas(req: KasRequestUser, ekskulId: number, month?: string, year?: string) {
    await this.assertMember(req, ekskulId)
    const report = await this.getReportData(ekskulId, month, year)
    return {
      message: 'Berhasil Mendapatkan Laporan Kas',
      data: {
        transactions: report.transactions,
        members: report.members,
        month: report.period.month,
        year: report.period.year,
        summary: report.summary
      }
    }
  }

  async createTransaction(req: KasRequestUser, ekskulId: number, input: KasInput) {
    await this.assertManager(req, ekskulId)
    const transaction = this.validateInput(input)
    await this.validateMemberForEkskul(ekskulId, transaction.member_ekskul_id)
    const [created] = await this.databaseService.connection(TABLE)
      .insert({ ...transaction, ekskul_id: ekskulId })
      .returning('*')
    return { message: 'Transaksi kas berhasil ditambahkan', data: created }
  }

  async updateTransaction(req: KasRequestUser, ekskulId: number, transactionId: number, input: KasInput) {
    await this.assertManager(req, ekskulId)
    const transaction = this.validateInput(input)
    await this.validateMemberForEkskul(ekskulId, transaction.member_ekskul_id)
    const updated = await this.databaseService.connection(TABLE)
      .where({ id: transactionId, ekskul_id: ekskulId })
      .update(transaction)
    if (!updated) throw new NotFoundException('Transaksi kas tidak ditemukan')
    const data = await this.databaseService.connection(TABLE)
      .select('*')
      .where({ id: transactionId, ekskul_id: ekskulId })
      .first()
    return { message: 'Transaksi kas berhasil diperbarui', data }
  }

  async deleteTransaction(req: KasRequestUser, ekskulId: number, transactionId: number) {
    await this.assertManager(req, ekskulId)
    const deleted = await this.databaseService.connection(TABLE)
      .where({ id: transactionId, ekskul_id: ekskulId })
      .delete()
    if (!deleted) throw new NotFoundException('Transaksi kas tidak ditemukan')
    return { message: 'Transaksi kas berhasil dihapus' }
  }

  async exportMemberPayments(req: KasRequestUser, ekskulId: number, month?: string, year?: string) {
    await this.assertManager(req, ekskulId)
    const report = await this.getReportData(ekskulId, month, year)
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Sistem Data Ekstrakurikuler'
    workbook.created = new Date()
    const worksheet = workbook.addWorksheet('Laporan Kas')
    const monthName = MONTH_NAMES[report.period.month - 1]
    worksheet.columns = [{ width: 8 }, { width: 36 }, { width: 20 }]
    worksheet.mergeCells('A1:C1')
    worksheet.getCell('A1').value = `LAPORAN KAS EKSTRAKURIKULER [${report.ekskulName}]`
    worksheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } }
    worksheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBE123C' } }
    worksheet.getCell('A1').alignment = { horizontal: 'center' }
    worksheet.mergeCells('A2:C2')
    worksheet.getCell('A2').value = `Periode: ${monthName} ${report.period.year}`
    worksheet.getCell('A2').font = { bold: true, size: 12 }
    worksheet.getCell('A2').alignment = { horizontal: 'center' }
    worksheet.addRow([])
    const header = worksheet.addRow(['NO', 'NAMA', monthName.toLocaleUpperCase('id-ID')])
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }
    header.alignment = { horizontal: 'center' }
    report.members.forEach((member, index) => {
      worksheet.addRow([index + 1, member.name, member.paidAmount > 0 ? 'P' : '-'])
    })
    worksheet.addRow([])
    worksheet.addRow(['', 'Total pemasukan tercatat', report.summary.totalIncome])
    worksheet.getColumn(3).alignment = { horizontal: 'center' }
    worksheet.getCell(`C${worksheet.rowCount}`).numFmt = '"Rp" #,##0'
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        }
      })
    })
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer())
    return { buffer, filename: `laporan-kas-${monthName.toLowerCase()}-${report.period.year}.xlsx` }
  }

  async exportLedger(req: KasRequestUser, ekskulId: number, month?: string, year?: string) {
    await this.assertManager(req, ekskulId)
    const report = await this.getReportData(ekskulId, month, year)
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Sistem Data Ekstrakurikuler'
    workbook.created = new Date()
    const worksheet = workbook.addWorksheet('Rincian Kas', { views: [{ state: 'frozen', ySplit: 5 }] })
    const monthName = MONTH_NAMES[report.period.month - 1]
    worksheet.columns = [
      { width: 8 }, { width: 20 }, { width: 48 },
      { width: 20 }, { width: 20 }, { width: 22 }
    ]
    worksheet.mergeCells('A1:F1')
    worksheet.getCell('A1').value = `RINCIAN KAS ${report.ekskulName.toLocaleUpperCase('id-ID')} - ${monthName.toLocaleUpperCase('id-ID')} ${report.period.year}`
    worksheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } }
    worksheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBE123C' } }
    worksheet.getCell('A1').alignment = { horizontal: 'center' }
    worksheet.mergeCells('A2:F2')
    worksheet.getCell('A2').value = `Saldo Awal: Rp ${report.summary.openingBalance.toLocaleString('id-ID')}`
    worksheet.getCell('A2').font = { bold: true }
    worksheet.addRow([])
    const header = worksheet.addRow(['NO', 'TANGGAL', 'KETERANGAN', 'PEMASUKAN', 'PENGELUARAN', 'SALDO'])
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }
    header.alignment = { horizontal: 'center' }

    let balance = report.summary.openingBalance
    const chronologicalTransactions = [...report.transactions].reverse()
    chronologicalTransactions.forEach((transaction, index) => {
      const income = transaction.jenis === 'masuk' ? transaction.amount : 0
      const expense = transaction.jenis === 'keluar' ? transaction.amount : 0
      balance += income - expense
      const description = transaction.member_name
        ? `${transaction.member_name} - ${transaction.keterangan}`
        : transaction.keterangan
      worksheet.addRow([
        index + 1,
        new Date(transaction.waktu),
        description,
        income || null,
        expense || null,
        balance
      ])
    })
    const summaryRows = [
      ['TOTAL PEMASUKAN', null, null, report.summary.totalIncome, null, null],
      ['TOTAL PENGELUARAN', null, null, null, report.summary.totalExpense, null],
      ['SALDO AKHIR PERIODE', null, null, null, null, report.summary.closingBalance]
    ]
    worksheet.addRow([])
    summaryRows.forEach((summary) => {
      const row = worksheet.addRow(summary)
      row.font = { bold: true }
      row.getCell(1).font = { bold: true, color: { argb: 'FF881337' } }
    })
    worksheet.getColumn(2).numFmt = 'dd mmmm yyyy'
    for (const column of [4, 5, 6]) worksheet.getColumn(column).numFmt = '"Rp" #,##0;[Red]-"Rp" #,##0'
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        }
      })
    })
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer())
    return { buffer, filename: `rincian-kas-${monthName.toLowerCase()}-${report.period.year}.xlsx` }
  }
}
