import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RoleService } from '../role/role.service';
import { AlignmentType, Document, HeightRule, ImageRun, Packer, Paragraph, Table, TableCell, TableRow, TextRun, VerticalAlign } from 'docx';
import ExcelJS from 'exceljs';
import { readFile } from 'fs/promises';
import { isAbsolute, relative, resolve, sep } from 'path';

type ExportKegiatanInput = {
    id: number;
}

type ExportKegiatanRecord = {
    id: number;
    title: string;
    location: string;
    waktu: Date | string | null;
    ekskul_id: number;
}

type DokumentasiImage = {
    kegiatan_id: number;
    data: Buffer;
    type: 'jpg' | 'png' | 'gif' | 'bmp';
}

const KEGIATAN_MANAGEMENT_ROLES = ['Ketua', 'Wakil Ketua', 'Humas']
const ABSENSI_ROLES = ['Sekretaris', 'Ketua', 'Wakil Ketua']
const ABSENSI_MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000

@Injectable()
export class KegiatanService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly roleService: RoleService
    ) { }

    // Get List Kegiatan
    async getListKegiatanEkskul(ekskul_id: number) {
        const getKegiatan = await this.databaseService.connection("kegiatan")
            .select("id", "title", "description", "location", "waktu")
            .where("ekskul_id", ekskul_id)
            .orderBy("waktu", "desc")

        return {
            message: "Berhasil Mendapatkan List Kegiatan Ekskul",
            data: getKegiatan
        }
    }

    // Get Detail Kegiatan
    async getDetailKegiatan(kegiatan_id: number) {
        const getDetail = await this.databaseService.connection("kegiatan")
            .select("id", "title", "description", "location", "waktu")
            .where({ id: kegiatan_id })
            .first()

        const finalPayload = {
            id: getDetail.id,
            title: getDetail.title,
            description: getDetail.description,
            location: getDetail.location,
            waktu: getDetail.waktu
        }

        return {
            message: "Berhasil Mendapatkan Detail Kegiatan",
            data: finalPayload
        }
    }

    // Create Kegiatan
    async createKegiatan(
        req: { nis: number, is_admin: boolean },
        ekskul_id: number,
        data: { title: string, description: string, location: string, waktu: string }
    ) {
        if (req.is_admin !== false) throw new ForbiddenException("Osis Tidak Dapat Membuat Kegiatan")
        if (!data.title || !data.description || !data.location || !data.waktu) throw new BadRequestException("Isi Form Kegiatan Yang Sesuai")

        const role = await this.roleService.getRole(req.nis, ekskul_id)
        if (!KEGIATAN_MANAGEMENT_ROLES.includes(role)) throw new ForbiddenException("Anda Tidak Berhak")


        const date = new Date(data.waktu)
        const isoDate = date.toISOString()

        const [insertKegiatan] = await this.databaseService.connection("kegiatan")
            .insert({ ekskul_id: ekskul_id, title: data.title, description: data.description, location: data.location, waktu: isoDate })
            .returning(["id", "title", "description", "location", "waktu"])

        return {
            message: "Berhasil Membuat Kegiatan",
            data: insertKegiatan
        }
    }

    // Update Kegiatan
    async updateKegiatan(
        req: { id: number, is_admin: boolean },
        ekskul_id: number,
        kegiatan_id: number,
        data: { title: string, description: string, location: string, waktu: string }
    ) {
        if (req.is_admin !== false) throw new ForbiddenException("Osis Tidak Dapat Membuat Kegiatan")
        if (!data.title || !data.description || !data.location || !data.waktu) throw new BadRequestException("Isi Form Kegiatan Yang Sesuai")

        // Apakah Humas
        const isHumas = await this.roleService.getRole(req.id, ekskul_id)
        console.log(isHumas)
        if (isHumas != 'Humas') throw new ForbiddenException("Anda Tidak Berhak")

        const date = new Date(Number(data.waktu) * 1000)
        const isoDate = date.toISOString()

        const updateKegiatan = await this.databaseService.connection("kegiatan")
            .update({ title: data.title, description: data.description, location: data.location, waktu: isoDate })
            .where({ id: kegiatan_id })

        const getUpdate = await this.databaseService.connection("kegiatan")
            .select("id", "title", "description", "location", "waktu")
            .where({ id: kegiatan_id })
            .first()

        return {
            message: "Berhasil Update Kegiatan",
            data: getUpdate
        }
    }

    // Delete Kegiatan
    async deleteKegiatan(
        req: { id: number },
        id: number,
        ekskul_id: number
    ) {
        // Apakah Humas
        const isHumas = await this.roleService.getRole(req.id, ekskul_id)
        if (isHumas != 'Humas') throw new ForbiddenException("Anda Tidak Berhak")

        const deleteKegiatan = await this.databaseService.connection("kegiatan").delete().where("id", id)

        return {
            message: "Berhasil Menghapus Kegiatan"
        }
    }

    // Absen
    async absenKegiatan(
        req: { nis: number, is_admin: boolean },
        ekskul_id: number,
        kegiatan_id: number,
        listMember: { nis: number | string, keterangan: string }[]
    ) {
        if (req.is_admin !== false) throw new ForbiddenException("Osis Tidak Dapat Membuat Kegiatan")

        const role = await this.roleService.getRole(req.nis, ekskul_id)
        if (!ABSENSI_ROLES.includes(role)) throw new ForbiddenException("Anda Tidak Berhak")

        if (!Array.isArray(listMember) || listMember.length === 0) {
            throw new BadRequestException("Pilih minimal satu status kehadiran untuk disimpan")
        }

        const kegiatan = await this.databaseService.connection("kegiatan")
            .select("id")
            .where({ id: kegiatan_id, ekskul_id })
            .first()
        if (!kegiatan) throw new NotFoundException("Kegiatan tidak ditemukan di ekstrakurikuler ini")

        const allowedKeterangan = ["hadir", "alpha", "sakit", "izin"]
        const normalizedMembers = listMember.map((member) => {
            const nis = Number(member?.nis)
            if (!Number.isInteger(nis) || nis <= 0 || !allowedKeterangan.includes(member?.keterangan)) {
                throw new BadRequestException("Data kehadiran tidak valid")
            }
            return { nis, keterangan: member.keterangan }
        })
        const memberNis = normalizedMembers.map((member) => member.nis)
        if (new Set(memberNis).size !== memberNis.length) {
            throw new BadRequestException("Anggota tidak boleh dikirim lebih dari satu kali")
        }

        const members = await this.databaseService.connection("member_ekskul")
            .select("id", "nis_user")
            .where({ ekskul_id })
            .whereIn("nis_user", memberNis)
        if (members.length !== normalizedMembers.length) {
            throw new BadRequestException("Satu atau lebih anggota bukan bagian dari ekstrakurikuler ini")
        }

        const memberIdByNis = new Map(members.map((member) => [Number(member.nis_user), Number(member.id)]))
        await this.databaseService.connection.transaction(async (transaction) => {
            for (const member of normalizedMembers) {
                const member_ekskul_id = memberIdByNis.get(member.nis)
                if (!member_ekskul_id) throw new BadRequestException("Anggota tidak ditemukan")

                const existing = await transaction("absen")
                    .select("id")
                    .where({ kegiatan_id, member_ekskul_id })
                    .first()

                if (existing) {
                    await transaction("absen")
                        .where({ id: existing.id })
                        .update({ keterangan: member.keterangan })
                } else {
                    await transaction("absen").insert({
                        kegiatan_id,
                        member_ekskul_id,
                        keterangan: member.keterangan
                    })
                }
            }
        })

        return {
            message: "Berhasil Absensi",
            data: {
                kegiatan_id: kegiatan_id,
                listMember: normalizedMembers
            }
        }

    }

    async getAbsenKegiatan(ekskul_id: number, kegiatan_id: number) {
        const kegiatan = await this.databaseService.connection("kegiatan")
            .select("id")
            .where({ id: kegiatan_id, ekskul_id })
            .first()
        if (!kegiatan) throw new NotFoundException("Kegiatan tidak ditemukan di ekstrakurikuler ini")

        const attendance = await this.databaseService.connection("absen")
            .innerJoin("member_ekskul", "member_ekskul.id", "absen.member_ekskul_id")
            .innerJoin("users", "users.nis", "member_ekskul.nis_user")
            .select({
                nis: "users.nis",
                member_name: "users.name",
                keterangan: "absen.keterangan"
            })
            .where({
                "absen.kegiatan_id": kegiatan_id,
                "member_ekskul.ekskul_id": ekskul_id
            })

        return {
            message: "Berhasil Mendapatkan Data Absensi",
            data: attendance
        }
    }

    // Export Kegiatan
    async exportKegiatan(req: { nis: number, is_admin: boolean }, data: ExportKegiatanInput[]) {
        if (req.is_admin !== false) throw new ForbiddenException("Anda Tidak Berhak")
        if (!Array.isArray(data) || data.length === 0) {
            throw new BadRequestException("Pilih minimal satu kegiatan untuk diekspor")
        }

        const kegiatanIds = data.map((item) => {
            if (!item || !Number.isInteger(Number(item.id)) || Number(item.id) <= 0) {
                throw new BadRequestException("Data kegiatan tidak valid")
            }
            return Number(item.id)
        })
        const uniqueKegiatanIds = [...new Set(kegiatanIds)]

        const kegiatan = await this.databaseService.connection("kegiatan")
            .select("id", "title", "location", "waktu", "ekskul_id")
            .whereIn("id", uniqueKegiatanIds)

        if (kegiatan.length !== uniqueKegiatanIds.length) {
            throw new NotFoundException("Satu atau lebih kegiatan tidak ditemukan")
        }

        const ekskulIds = [...new Set<number>(kegiatan.map((item) => Number(item.ekskul_id)))]
        const roles = await Promise.all(
            ekskulIds.map((ekskulId) => this.roleService.getRole(req.nis, ekskulId))
        )
        if (roles.some((role) => !KEGIATAN_MANAGEMENT_ROLES.includes(role))) {
            throw new ForbiddenException("Anda Tidak Berhak")
        }

        const kegiatanById = new Map<number, ExportKegiatanRecord>(
            kegiatan.map((item): [number, ExportKegiatanRecord] => [Number(item.id), item])
        )
        const orderedKegiatan = uniqueKegiatanIds.map((id) => {
            const item = kegiatanById.get(id)
            if (!item) throw new NotFoundException("Satu atau lebih kegiatan tidak ditemukan")
            return item
        })
        const dokumentasi = await this.databaseService.connection("list_dokumentasi")
            .select("kegiatan_id", "path")
            .whereIn("kegiatan_id", uniqueKegiatanIds)
            .orderBy("id")

        const uploadsDirectory = resolve(__dirname, '..', '..', 'uploads')
        const images: DokumentasiImage[] = await Promise.all(dokumentasi.map(async (item) => {
            if (!item.path) {
                throw new InternalServerErrorException("Path dokumentasi tidak tersedia")
            }

            const path = String(item.path).replace(/\\/g, '/')
            const relativePath = path.replace(/^\/?uploads\//, '')
            if (relativePath === path || !relativePath) {
                throw new InternalServerErrorException("Path dokumentasi tidak valid")
            }

            const imagePath = resolve(uploadsDirectory, relativePath)
            const pathFromUploads = relative(uploadsDirectory, imagePath)
            if (
                pathFromUploads === '..' ||
                pathFromUploads.startsWith(`..${sep}`) ||
                isAbsolute(pathFromUploads)
            ) {
                throw new InternalServerErrorException("Path dokumentasi tidak valid")
            }

            let imageData: Buffer
            try {
                imageData = await readFile(imagePath)
            } catch {
                throw new InternalServerErrorException(`File dokumentasi tidak dapat dibaca: ${item.path}`)
            }

            let type: DokumentasiImage['type']
            if (imageData.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
                type = 'png'
            } else if (imageData[0] === 0xff && imageData[1] === 0xd8 && imageData[2] === 0xff) {
                type = 'jpg'
            } else if (imageData.toString('ascii', 0, 3) === 'GIF') {
                type = 'gif'
            } else if (imageData.toString('ascii', 0, 2) === 'BM') {
                type = 'bmp'
            } else {
                throw new InternalServerErrorException(`Format gambar dokumentasi tidak didukung: ${item.path}`)
            }

            return {
                kegiatan_id: item.kegiatan_id,
                data: imageData,
                type
            }
        }))

        const imagesByKegiatan = new Map<number, DokumentasiImage[]>()
        for (const image of images) {
            const kegiatanImages = imagesByKegiatan.get(image.kegiatan_id) ?? []
            kegiatanImages.push(image)
            imagesByKegiatan.set(image.kegiatan_id, kegiatanImages)
        }

        const dateFormatter = new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Jakarta'
        })
        const monthFormatter = new Intl.DateTimeFormat('id-ID', {
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Jakarta'
        })
        const validActivityDates = orderedKegiatan
            .map((item) => item.waktu)
            .filter((waktu): waktu is Date | string => {
                if (!waktu) return false
                return !Number.isNaN(new Date(waktu).getTime())
            })
        const months = new Set(
            validActivityDates.map((waktu) => monthFormatter.format(new Date(waktu)))
        )
        const period = months.size === 1 ? `BULAN ${[...months][0].toUpperCase()}` : 'Periode Kegiatan'

        const makeTextCell = (text: string) => new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            children: [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text, font: 'Times New Roman', size: 20 })]
                })
            ]
        })
        const headerCell = (text: string) => new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            children: [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text,
                            bold: true,
                            allCaps: true,
                            font: 'Times New Roman',
                            size: 24
                        })
                    ]
                })
            ]
        })
        const rows = [
            new TableRow({
                tableHeader: true,
                children: [
                    headerCell('Dokumentasi'),
                    headerCell('Hari/Tanggal'),
                    headerCell('Kegiatan'),
                    headerCell('Tempat')
                ]
            }),
            ...orderedKegiatan.map((item) => {
                const eventDate = item.waktu && !Number.isNaN(new Date(item.waktu).getTime())
                    ? dateFormatter.format(new Date(item.waktu))
                    : '-'
                const imageParagraphs = (imagesByKegiatan.get(item.id) ?? []).map((image) =>
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new ImageRun({
                                data: image.data,
                                type: image.type,
                                transformation: { width: 120, height: 90 }
                            })
                        ]
                    })
                )

                return new TableRow({
                    height: { value: 2400, rule: HeightRule.ATLEAST },
                    cantSplit: true,
                    children: [
                        new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            children: imageParagraphs.length > 0
                                ? imageParagraphs
                                : [new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [new TextRun({ text: 'Tidak ada dokumentasi', font: 'Times New Roman', size: 20, })]
                                })]
                        }),
                        makeTextCell(eventDate),
                        makeTextCell(item.title),
                        makeTextCell(item.location)
                    ]
                })
            })
        ]
        const table = new Table({ rows })
        const headerParagraph = new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: 'LAPORAN KEGIATAN EKSTRAKURIKULER',
                    bold: true,
                    font: 'Times New Roman',
                    size: 24
                }),
                new TextRun({
                    text: period,
                    bold: true,
                    break: 1,
                    font: 'Times New Roman',
                    size: 24
                })
            ]
        })
        const doc = new Document({
            sections: [{
                children: [headerParagraph, new Paragraph({ text: '' }), table]
            }]
        })

        return Packer.toBuffer(doc)
    }

    async exportAbsensi(
        req: { nis: number, is_admin: boolean },
        ekskulId: number,
        monthValue?: string,
        yearValue?: string
    ) {
        if (req.is_admin !== false) throw new ForbiddenException("Anda Tidak Berhak")

        const role = await this.roleService.getRole(req.nis, ekskulId)
        if (!ABSENSI_ROLES.includes(role)) throw new ForbiddenException("Anda Tidak Berhak")

        const nowInJakarta = new Date(Date.now() + JAKARTA_OFFSET_MS)
        const month = monthValue === undefined ? nowInJakarta.getUTCMonth() + 1 : Number(monthValue)
        const year = yearValue === undefined ? nowInJakarta.getUTCFullYear() : Number(yearValue)
        if (!Number.isInteger(month) || month < 1 || month > 12) {
            throw new BadRequestException("Bulan laporan harus bernilai antara 1 dan 12")
        }
        if (!Number.isInteger(year) || year < 2000 || year > 2200) {
            throw new BadRequestException("Tahun laporan tidak valid")
        }

        const periodStart = new Date(Date.UTC(year, month - 1, 1) - JAKARTA_OFFSET_MS)
        const periodEnd = new Date(Date.UTC(year, month, 1) - JAKARTA_OFFSET_MS)
        const [ekskul, members, activities] = await Promise.all([
            this.databaseService.connection("ekskul")
                .select("name")
                .where({ id: ekskulId })
                .first(),
            this.databaseService.connection("member_ekskul")
                .innerJoin("users", "users.nis", "member_ekskul.nis_user")
                .select({
                    id: "member_ekskul.id",
                    nis: "users.nis",
                    name: "users.name",
                    kelas: "users.kelas",
                    jurusan: "users.jurusan",
                    role: "member_ekskul.role"
                })
                .where("member_ekskul.ekskul_id", ekskulId),
            this.databaseService.connection("kegiatan")
                .select("id", "title", "description", "waktu")
                .where("ekskul_id", ekskulId)
                .andWhere("waktu", ">=", periodStart)
                .andWhere("waktu", "<", periodEnd)
                .orderBy("waktu", "asc")
                .orderBy("id", "asc")
        ])
        if (!ekskul) throw new NotFoundException("Ekskul tidak ditemukan")

        const attendance = activities.length > 0
            ? await this.databaseService.connection("absen as attendance")
                .innerJoin("kegiatan as activity", "activity.id", "attendance.kegiatan_id")
                .innerJoin("member_ekskul as member", "member.id", "attendance.member_ekskul_id")
                .select({
                    memberId: "attendance.member_ekskul_id",
                    activityId: "attendance.kegiatan_id",
                    keterangan: "attendance.keterangan"
                })
                .where("activity.ekskul_id", ekskulId)
                .andWhere("activity.waktu", ">=", periodStart)
                .andWhere("activity.waktu", "<", periodEnd)
            : []

        const roster = members
            .filter((member) => member.kelas && member.role !== "Pembina")
            .sort((a, b) => {
                const gradeOrder: Record<string, number> = { X: 10, XI: 11, XII: 12 }
                const gradeDifference = (gradeOrder[String(b.kelas)] ?? 0) - (gradeOrder[String(a.kelas)] ?? 0)
                if (gradeDifference !== 0) return gradeDifference
                const classDifference = String(a.jurusan ?? "").localeCompare(String(b.jurusan ?? ""), "id")
                return classDifference || String(a.name ?? "").localeCompare(String(b.name ?? ""), "id")
            })
        const staffName = (staffRole: string) =>
            members.find((member) => member.role === staffRole)?.name || "-"

        const statusColors: Record<string, string> = {
            hadir: "FF34A853", 
            izin: "FFFFFF00", 
            sakit: "FF3C78D8", 
            alpha: "FFFF0000" 
        }

        const attendanceByMemberAndActivity = new Map<string, string>()
        for (const record of attendance) {
            const colorCode = statusColors[String(record.keterangan).toLowerCase()]
            if (colorCode) {
                attendanceByMemberAndActivity.set(
                    `${Number(record.memberId)}:${Number(record.activityId)}`,
                    colorCode
                )
            }
        }

        const workbook = new ExcelJS.Workbook()
        workbook.creator = "Ekskul Data"
        workbook.subject = "Laporan absensi ekstrakurikuler"
        const worksheet = workbook.addWorksheet(`Absensi ${ABSENSI_MONTH_NAMES[month - 1]}`)
        worksheet.properties.defaultRowHeight = 20
        
        worksheet.columns = [
            { width: 4 },
            { key: "no", width: 10 },
            { key: "name", width: 42 },
            { key: "kelas", width: 22 },
            { key: "nis", width: 18 },
            ...activities.map((_, index) => ({ key: `activity${index + 1}`, width: 12 }))
        ]
        const firstColumn = 2
        const attendanceColumn = 6
        const lastColumn = Math.max(attendanceColumn, 5 + activities.length)
        const endColumnLetter = worksheet.getColumn(lastColumn).letter
        const thinBorder = {
            top: { style: "thin" as const },
            left: { style: "thin" as const },
            bottom: { style: "thin" as const },
            right: { style: "thin" as const }
        }

        for (const rowNumber of [2, 3, 4]) {
            worksheet.mergeCells(rowNumber, firstColumn, rowNumber, lastColumn)
            const cell = worksheet.getCell(rowNumber, firstColumn)
            cell.alignment = { horizontal: "center", vertical: "middle" }
            cell.font = { name: "Times New Roman", bold: true, size: 12 }
        }
        worksheet.getCell("B2").value = `DAFTAR HADIR EKSTRAKURIKULER ${String(ekskul.name).toLocaleUpperCase("id-ID")}`
        worksheet.getCell("B3").value = "SMK NEGERI 10 JAKARTA"
        const academicYearStart = month >= 7 ? year : year - 1
        worksheet.getCell("B4").value = `TAHUN AJARAN ${academicYearStart}/${academicYearStart + 1}`

        for (const [rowNumber, label, value] of [
            [6, "Pembina", staffName("Pembina")],
            [7, "Ketua Ekstrakurikuler", staffName("Ketua")],
            [8, "Pelatih", "-"]
        ] as const) {
            worksheet.mergeCells(rowNumber, 2, rowNumber, 3)
            worksheet.mergeCells(rowNumber, 4, rowNumber, 5)

            const labelCell = worksheet.getCell(rowNumber, 2)
            const valueCell = worksheet.getCell(rowNumber, 4)

            labelCell.value = label
            labelCell.font = { name: "Times New Roman", size: 12 }

            valueCell.value = `: ${value}`
            valueCell.font = { name: "Times New Roman", size: 12 }
        }

        for (let column = firstColumn; column <= lastColumn; column++) {
            const header = worksheet.getCell(10, column)
            header.font = { name: "Times New Roman", bold: true, size: 12 }
            header.alignment = { horizontal: "center", vertical: "middle" }
            header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF" } }
            header.border = thinBorder
        }
        for (const column of [2, 3, 4, 5]) {
            worksheet.mergeCells(10, column, 11, column)
        }
        worksheet.getCell("B10").value = "NO"
        worksheet.getCell("C10").value = "NAMA"
        worksheet.getCell("D10").value = "KELAS"
        worksheet.getCell("E10").value = "NIS"

        if (activities.length > 1) worksheet.mergeCells(10, attendanceColumn, 10, lastColumn)
        const monthCell = worksheet.getCell(10, attendanceColumn)
        monthCell.value = new Date(Date.UTC(year, month - 1, 1))
        monthCell.numFmt = "mmmm yyyy"
        monthCell.font = { name: "Times New Roman", bold: true, size: 12 }
        monthCell.alignment = { horizontal: "center", vertical: "middle" }
        monthCell.border = thinBorder

        const getJakartaDay = (value: Date | string) => {
            const parts = new Intl.DateTimeFormat("en-US", {
                day: "numeric",
                timeZone: "Asia/Jakarta"
            }).formatToParts(new Date(value))
            return Number(parts.find((part) => part.type === "day")?.value)
        }
        activities.forEach((activity, index) => {
            const cell = worksheet.getCell(11, attendanceColumn + index)
            cell.value = activity.waktu ? getJakartaDay(activity.waktu) : ""
            cell.font = { name: "Times New Roman", bold: true, size: 12 }
            cell.alignment = { horizontal: "center", vertical: "middle" }
            cell.border = thinBorder
        })

        let rowNumber = 12
        let memberNumber = 0
        const membersByGrade = new Map<string, typeof roster>()
        for (const member of roster) {
            const grade = String(member.kelas)
            const group = membersByGrade.get(grade) ?? []
            group.push(member)
            membersByGrade.set(grade, group)
        }
        for (const [grade, gradeMembers] of membersByGrade) {
            worksheet.mergeCells(rowNumber, firstColumn, rowNumber, lastColumn)
            const gradeCell = worksheet.getCell(rowNumber, firstColumn)
            gradeCell.value = `KELAS ${grade}`
            gradeCell.font = { name: "Times New Roman", bold: true, size: 12 }
            gradeCell.alignment = { horizontal: "center", vertical: "middle" }
            gradeCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF" } }
            
            for (let column = firstColumn; column <= lastColumn; column++) {
                worksheet.getCell(rowNumber, column).border = thinBorder
            }
            rowNumber++

            for (const member of gradeMembers) {
                memberNumber++
                const row = worksheet.getRow(rowNumber)
                row.getCell(2).value = memberNumber
                row.getCell(3).value = String(member.name ?? "").toLocaleUpperCase("id-ID")
                row.getCell(4).value = [member.kelas, member.jurusan].filter(Boolean).join(" ")
                
                const nisCell = row.getCell(5)
                nisCell.value = member.nis === null ? "" : String(member.nis)
                nisCell.alignment = { horizontal: "center", vertical: "middle" }

                row.alignment = { vertical: "middle" }

                for (let column = firstColumn; column <= lastColumn; column++) {
                    const cell = row.getCell(column)
                    cell.font = { name: "Times New Roman", size: 12 }
                    cell.border = thinBorder
                    
                    if (column === 2 || column === 4 || column === 5) {
                        cell.alignment = { horizontal: "center", vertical: "middle" }
                    }

                    if (column >= attendanceColumn) {
                        const activity = activities[column - attendanceColumn]
                        cell.alignment = { horizontal: "center", vertical: "middle" }
                        if (activity) {
                            const colorCode = attendanceByMemberAndActivity.get(`${Number(member.id)}:${Number(activity.id)}`)
                            if (colorCode) {
                                cell.value = ""
                                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colorCode } }
                            } else {
                                cell.value = ""
                            }
                        } else {
                            cell.value = ""
                        }
                    }
                }
                rowNumber++
            }
        }

        rowNumber++
        const legendItems = [
            { label: "HADIR", color: "FF34A853" },
            { label: "IZIN", color: "FFFFFF00" },
            { label: "SAKIT", color: "FF3C78D8" },
            { label: "ALPA", color: "FFFF0000" }
        ]
        for (const item of legendItems) {
            worksheet.mergeCells(rowNumber, firstColumn, rowNumber, 4)
            const legend = worksheet.getCell(rowNumber, firstColumn)
            legend.value = item.label
            legend.font = { name: "Times New Roman", bold: true, size: 12, color: { argb: "FF000000"} }
            legend.alignment = { horizontal: "center", vertical: "middle" }
            legend.fill = { type: "pattern", pattern: "solid", fgColor: { argb: item.color } }
            
            for (let c = firstColumn; c <= 4; c++) {
                worksheet.getCell(rowNumber, c).border = thinBorder
            }
            rowNumber++
        }

        rowNumber += 2
        worksheet.mergeCells(rowNumber, 3, rowNumber, 5)
        worksheet.getCell(rowNumber, 2).value = "TANGGAL"
        worksheet.getCell(rowNumber, 3).value = "KETERANGAN"
        for (let column = 2; column <= 5; column++) {
            const cell = worksheet.getCell(rowNumber, column)
            cell.font = { name: "Times New Roman", bold: true, size: 12 }
            cell.alignment = { horizontal: "center", vertical: "middle" }
            cell.border = thinBorder
        }
        rowNumber++

        for (const activity of activities) {
            worksheet.mergeCells(rowNumber, 3, rowNumber, 5)
            worksheet.getCell(rowNumber, 2).value = activity.waktu ? getJakartaDay(activity.waktu) : ""
            worksheet.getCell(rowNumber, 3).value = String(activity.description ?? "")
            worksheet.getCell(rowNumber, 2).alignment = { horizontal: "center", vertical: "middle" }
            worksheet.getCell(rowNumber, 3).alignment = { vertical: "middle" }
            for (let column = 2; column <= 5; column++) {
                const cell = worksheet.getCell(rowNumber, column)
                cell.font = { name: "Times New Roman", size: 12 }
                cell.border = thinBorder
            }
            rowNumber++
        }

        worksheet.views = []

        worksheet.pageSetup = {
            orientation: "landscape",
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            printArea: `B2:${endColumnLetter}${rowNumber}`,
            printTitlesRow: "10:11",
            margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 }
        }

        const buffer = Buffer.from(await workbook.xlsx.writeBuffer())
        return {
            buffer,
            filename: `laporan-absensi-${ABSENSI_MONTH_NAMES[month - 1].toLowerCase()}-${year}.xlsx`
        }
    }

}