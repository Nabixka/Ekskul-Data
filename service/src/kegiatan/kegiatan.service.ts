import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RoleService } from 'src/role/role.service';
import { AlignmentType, Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from 'docx';

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

        // Apakah Humas
        const isHumas = await this.roleService.getRole(req.nis, ekskul_id)
        if (isHumas != 'Humas') throw new ForbiddenException("Anda Tidak Berhak")


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
        listMember: string[]
    ) {
        if (req.is_admin !== false) throw new ForbiddenException("Osis Tidak Dapat Membuat Kegiatan")

        const isHumas = await this.roleService.getRole(req.nis, ekskul_id)
        if (isHumas != "Humas") throw new ForbiddenException("Anda Tidak Berhak")

        return {
            message: "Berhasil Absensi",
            data: {
                kegiatan_id: kegiatan_id,
                listMember: listMember
            }
        }

    }

    async exportKegiatan(req: { nis: number, is_admin: boolean }, data: string[]) {

        const headerParagraph = new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: `Laporan Kegiatan Ekstrakulikuler`,
                    bold: true,
                    allCaps: true,
                    font: "Times New Roman",
                    size: 24
                }),
                new TextRun({
                    text: `Bulan Desember 2026`,
                    bold: true,
                    break: 2,
                    allCaps: true,
                    font: "Times New Roman",
                    size: 24
                })
            ]
        })

        const table = new Table({
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            text: "Dokumentasi",
                                            bold: true,
                                            font: "Times New Roman",
                                            size: 24,
                                            allCaps: true
                                        })
                                    ]
                                })
                            ]
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            text: "Hari/Tanggal",
                                            bold: true,
                                            font: "Times New Roman",
                                            size: 24,
                                            allCaps: true
                                        })
                                    ]
                                })
                            ]
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({                                   
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            text: "Kegiatan",
                                            bold: true,
                                            font: "Times New Roman",
                                            size: 24,
                                            allCaps: true
                                        })
                                    ]
                                })
                            ]
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            text: "Tempat",
                                            bold: true,
                                            font: "Times New Roman",
                                            size: 24,
                                            allCaps: true
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        })

        const doc = new Document({
            sections: [
                {
                    children: [
                        headerParagraph,
                        table
                    ]
                }
            ]
        })

        const buffer = await Packer.toBuffer(doc)

        return buffer
    }

}