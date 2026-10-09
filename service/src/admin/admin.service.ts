import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { listEkskulSiswa } from 'src/Mapping/ListEkskulSiswa';

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

    // Get List Siswa Dan Ekskul Nya Berdasarkan Kelas
    async getListEkskulSiswaByKelas(req: {is_admin: boolean}){
        if(req.is_admin !== true) throw new ForbiddenException("Anda Tidak Berhak")

        const getData = await this.databaseService.connection("member_ekskul")
        .innerJoin("ekskul", "ekskul.id", "member_ekskul.ekskul_id")
        .innerJoin("users", "users.nis", "member_ekskul.nis_user")
        .select({
            nis: "users.nis",
            murid_name: "users.name",
            kelas: "users.kelas",
            jurusan: "users.jurusan",

            ekskul_name: "ekskul.name",
        })
        .orderByRaw(`
            CASE users.kelas
                WHEN 'X' THEN 1
                WHEN 'XI' THEN 2
                WHEN 'XII' THEN 3
                WHEN 'XIII' THEN 4
                ELSE 5
            END ASC
        `)

        return {
            message: "Berhasil Mendapat Data Ekskul Siswa",
            data: listEkskulSiswa(getData)
        }
    }
}