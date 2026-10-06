import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class RuangService {
    constructor(private databaseService: DatabaseService) {}

    @Cron('0 0 * * *', {
        timeZone: 'Asia/Jakarta'
    })
    async createRuangHariIni(){
        const getAllRuang = await this.databaseService.connection("ruang").select("id")
        const mappingRuangId = getAllRuang.map((item) => item.id)

        for(const ruangId of mappingRuangId){
            await this.databaseService.connection("peminjaman_ruang").insert({
                ruang_id: ruangId,
                status: 'Kosong',
                waktu_peminjaman: new Date()
            })
        }

        console.log("Berhasil Membuat Peminjaman Ruang Hari Ini ")
    }

    async getAllPmeminjamanRuangHariIni() {
        const waktuHariIni = new Date().toISOString().split('T')[0];

        const getAllRuang = await this.databaseService.connection("peminjaman_ruang")
            .select("*")
            .whereRaw('DATE(waktu_peminjaman) = ?', [waktuHariIni]);

        return {
            message: "Berhasil Mendapat List Peminjaman Ruang",
            data: getAllRuang
        };
    }

    async pengajuanPeminjamanRuangHariIni(
        req: { nis: number, is_admin: boolean}, 
        data: { peminjaman_ruang_id: number, description: string, peminjam: string }
    ){
        const getPeminjamanRuang = await this.databaseService.connection("peminjaman_ruang")
        .select("id")
        .where({id: data.peminjaman_ruang_id})
        .first()

        if(!getPeminjamanRuang) throw new NotFoundException("Maaf Tidak Menemukan Ruangan Yang Anda Cari")
        const updatePeminjamanRuang = await this.databaseService.connection("peminjaman_ruang")
        .update({
            status: 'Pengajuan',
            description: data.description,
            peminjam: data.peminjam
        })
        .where({ id: data.peminjaman_ruang_id})

        const getNewPeminjamanRuang = await this.databaseService.connection("peminjaman_ruang")
        .select("*")
        .where({id: data.peminjaman_ruang_id})
        .first()

        return {
            message: "Berhasil Mengajukan Ruang",
            data: getNewPeminjamanRuang
        }
    }
}