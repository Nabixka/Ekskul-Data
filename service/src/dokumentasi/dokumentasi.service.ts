import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class DokumentasiService {
    constructor( private databaseService: DatabaseService ) {}

    async getDokumentasiByEkskul(ekskul_id: number){
        const getListKegiatanId = await this.databaseService.connection("kegiatan")
        .select("id")
        .where({ekskul_id: ekskul_id})

        const mappingKegiatanId = getListKegiatanId.map((e) => e.id)

        const getDokumentasi = await this.databaseService.connection("list_dokumentasi")
        .innerJoin("kegiatan", "kegiatan.id", "list_dokumentasi.kegiatan_id")
        .select({
            id: "list_dokumentasi.id",
            path: "list_dokumentasi.path",

            title: "kegiatan.title",
            waktu: "kegiatan.waktu"
        })
        .whereIn("list_dokumentasi.kegiatan_id", mappingKegiatanId)

        return {
            message: "Berhasil Mendapatkan Dokumentasi",
            data: getDokumentasi
        }
    }
}