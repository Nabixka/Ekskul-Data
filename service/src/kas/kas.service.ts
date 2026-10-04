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
      pembina: members.find((member) => member.role === 'Pembina')?.name || '-',
      ketua: members.find((member) => member.role === 'Ketua')?.name || '-',
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

  async exportKasReport(req: KasRequestUser, ekskulId: number, month?: string, year?: string) {
    await this.assertManager(req, ekskulId)
    const report = await this.getReportData(ekskulId, month, year)
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Sistem Data Ekstrakurikuler'
    workbook.created = new Date()
    const monthName = MONTH_NAMES[report.period.month - 1]
    const schoolYearStart = report.period.month >= 7 ? report.period.year : report.period.year - 1
    const schoolYear = `${schoolYearStart}/${schoolYearStart + 1}`
    const blackBorder = {
      top: { style: 'thin' as const, color: { argb: 'FF000000' } },
      bottom: { style: 'thin' as const, color: { argb: 'FF000000' } },
      left: { style: 'thin' as const, color: { argb: 'FF000000' } },
      right: { style: 'thin' as const, color: { argb: 'FF000000' } }
    }

    const roster = workbook.addWorksheet('Laporan Kas')
    roster.columns = [{ width: 8 }, { width: 36 }, { width: 18 }]
    roster.mergeCells('A1:C1')
    roster.mergeCells('A2:C2')
    roster.mergeCells('A3:C3')
    roster.getCell('A1').value = `LAPORAN KAS EKSTRAKURIKULER [${report.ekskulName}]`
    roster.getCell('A2').value = 'SMK NEGERI 10 JAKARTA'
    roster.getCell('A3').value = `TAHUN AJARAN ${schoolYear}`
    for (const rowNumber of [1, 2, 3]) {
      const cell = roster.getCell(`A${rowNumber}`)
      cell.font = { name: 'Times New Roman', bold: true, size: rowNumber === 1 ? 12 : 11 }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    }
    roster.getRow(1).height = 22
    roster.getRow(2).height = 18
    roster.getRow(3).height = 18
    roster.getCell('A5').value = 'Pembina'
    roster.getCell('B5').value = `: ${report.pembina}`
    roster.mergeCells('B5:C5')
    roster.getCell('A6').value = 'Ketua Ekstrakurikuler'
    roster.getCell('B6').value = `: ${report.ketua}`
    roster.mergeCells('B6:C6')
    for (const rowNumber of [5, 6]) {
      roster.getCell(`A${rowNumber}`).font = { name: 'Times New Roman', bold: true, size: 11 }
      roster.getCell(`B${rowNumber}`).font = { name: 'Times New Roman', bold: true, size: 11 }
    }
    const rosterHeader = roster.addRow([])
    rosterHeader.getCell(1).value = 'NO'
    rosterHeader.getCell(2).value = 'NAMA'
    rosterHeader.getCell(3).value = monthName.toLocaleUpperCase('id-ID')
    rosterHeader.height = 24
    rosterHeader.eachCell((cell) => {
      cell.font = { name: 'Times New Roman', bold: true, size: 11 }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = blackBorder
    })
    report.members.filter((member) => member.role !== 'Pembina').forEach((member, index) => {
      const row = roster.addRow([index + 1, member.name, member.paidAmount > 0 ? 'P' : '-'])
      row.font = { name: 'Times New Roman', size: 11 }
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
      row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' }
      row.eachCell((cell) => { cell.border = blackBorder })
    })

    const ledger = workbook.addWorksheet('Rincian Kas', { views: [{ state: 'frozen', ySplit: 3 }] })
    ledger.columns = [
      { width: 8 }, { width: 18 }, { width: 42 },
      { width: 20 }, { width: 20 }, { width: 20 }
    ]
    ledger.mergeCells('A1:F1')
    ledger.getCell('A1').value =
      `RINCIAN KAS ${monthName.toLocaleUpperCase('id-ID')} ${report.period.year}`
    ledger.getCell('A1').font = { name: 'Times New Roman', bold: true, size: 12 }
    ledger.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
    ledger.getRow(1).height = 24
    const ledgerHeader = ledger.addRow(['No', 'Tanggal', 'Keterangan', 'Pemasukan', 'Pengeluaran', 'Saldo'])
    ledgerHeader.font = { name: 'Times New Roman', bold: true, size: 11 }
    ledgerHeader.alignment = { horizontal: 'center', vertical: 'middle' }
    ledgerHeader.eachCell((cell) => { cell.border = blackBorder })

    let balance = report.summary.openingBalance
    const openingRow = ledger.addRow([1, null, 'Saldo Awal', null, null, balance])
    openingRow.font = { name: 'Times New Roman', size: 11 }
    openingRow.getCell(1).alignment = { horizontal: 'center' }
    openingRow.getCell(6).alignment = { horizontal: 'right' }
    openingRow.eachCell((cell) => { cell.border = blackBorder })
    ;[...report.transactions].reverse().forEach((transaction, index) => {
      const income = transaction.jenis === 'masuk' ? transaction.amount : 0
      const expense = transaction.jenis === 'keluar' ? transaction.amount : 0
      balance += income - expense
      const description = transaction.member_name
        ? `${transaction.member_name} - ${transaction.keterangan}`
        : transaction.keterangan
      const row = ledger.addRow([
        index + 2,
        new Date(transaction.waktu),
        description,
        income || null,
        expense || null,
        balance
      ])
      row.font = { name: 'Times New Roman', size: 11 }
      row.getCell(1).alignment = { horizontal: 'center' }
      row.getCell(2).numFmt = 'd/m/yyyy'
      for (const column of [4, 5, 6]) {
        row.getCell(column).numFmt = '"Rp" #,##0;[Red]-"Rp" #,##0'
        row.getCell(column).alignment = { horizontal: 'right' }
      }
      row.eachCell((cell) => { cell.border = blackBorder })
    })

    const summaryRows = [
      ['TOTAL PEMASUKAN', report.summary.totalIncome],
      ['TOTAL PENGELUARAN', report.summary.totalExpense],
      ['SALDO AKHIR', report.summary.closingBalance]
    ]
    for (const [label, amount] of summaryRows) {
      const row = ledger.addRow([label, null, null, null, null, amount])
      ledger.mergeCells(`A${row.number}:E${row.number}`)
      row.font = { name: 'Times New Roman', bold: true, size: 11 }
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
      row.getCell(6).numFmt = '"Rp" #,##0;[Red]-"Rp" #,##0'
      row.getCell(6).alignment = { horizontal: 'right' }
      row.eachCell((cell) => { cell.border = blackBorder })
    }

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer())
    return { buffer, filename: `laporan-kas-${monthName.toLowerCase()}-${report.period.year}.xlsx` }
  }
}
