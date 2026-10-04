import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RoleService } from 'src/role/role.service';
import { AlignmentType, Document, HeightRule, ImageRun, Packer, Paragraph, Table, TableCell, TableRow, TextRun, VerticalAlign } from 'docx';
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
                                    children: [new TextRun({ text: 'Tidak ada dokumentasi', font: 'Times New Roman', size: 20,  })]
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

}