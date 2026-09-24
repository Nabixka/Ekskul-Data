import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AdminService {
    constructor( private databaseService: DatabaseService ) {}

    // Dashboard Admin
    async getDashboardAdmin(req: { nis: number, is_admin: boolean }) {
        if (req.is_admin !== true) throw new ForbiddenException("Anda Tidak Berhak Akses Dashboard Admin")

        const getAllEkskul = await this.databaseService.connection("ekskul").select("name")
        const mappingEkskul = getAllEkskul.map((e) => e.name)

        const getAllMember = await this.databaseService.connection("users").select("name").where({ is_admin: false })
        const mappingMember = getAllMember.map((e) => e.name)

        const getAllKegiatan = await this.databaseService.connection("kegiatan").select("title")
        const mappingKegiatan = getAllKegiatan.map((e) => e.title)

        const getAllDokumentasi = await this.databaseService.connection("list_dokumentasi").select("path")
        const mappingDokumentasi = getAllDokumentasi.map((e) => e.path)

        return {
            message: "Berhasil Mendapatkan Data Untuk Dashboard",
            data: {
                ekskul: mappingEkskul.length,
                member: mappingMember.length,
                kegiatan: mappingKegiatan.length,
                dokumentasi: mappingDokumentasi.length
            }
        }
    }
}