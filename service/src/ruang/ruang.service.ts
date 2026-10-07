import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class RuangService {
    constructor(private databaseService: DatabaseService) { }

    @Cron('0 0 ? * MON *', {
        timeZone: 'Asia/Jakarta'
    })

    async createRuangHariIni() {

        const now = new Date()
        const dayofWeek = now.getDay()

        const distanceToMonday = dayofWeek === 0 ? -6 : 1 - dayofWeek
        const monday = new Date(now)
        monday.setDate(now.getDate() + distanceToMonday)

        await this.databaseService.connection("peminjaman_ruang")
        .where('waktu_peminjaman', '<', monday.toISOString().split('T')[0])
        .delete()
        
        const getAllRuang = await this.databaseService.connection("ruang").select("id")
        const mappingRuangId = getAllRuang.map((item) => item.id)

        const weekDates: string[] = []
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday)
            date.setDate(monday.getDate() + i)
            weekDates.push(date.toISOString().split('T')[0])
        }

        for (const ruangId of mappingRuangId) {
            for (const targetDate of weekDates) {
                await this.databaseService.connection("peminjaman_ruang").insert({
                    ruang_id: ruangId,
                    status: 'Kosong',
                    waktu_peminjaman: targetDate
                })
            }
        }

        console.log("Berhasil Membuat Peminjaman Ruang Hari Ini ")
    }



    async getAllPmeminjamanRuangHariIni() {
        const waktuHariIni = new Date().toISOString().split('T')[0]

        const getAllRuang = await this.databaseService.connection("peminjaman_ruang")
            .select("*")
            .whereRaw('DATE(waktu_peminjaman) = ?', [waktuHariIni])

        return {
            message: "Berhasil Mendapat List Peminjaman Ruang",
            data: getAllRuang
        }
    }

    async updatePermintaan(
        req: { name: string, nis: number, is_admin: boolean },
        data: { peminjaman_ruang_id: number, status: string,description?: string, peminjam?: string }
    ) {
        const getPeminjamanRuang = await this.databaseService.connection("peminjaman_ruang")
            .select("*")
            .where({ id: data.peminjaman_ruang_id })
            .first()

        if (getPeminjamanRuang.status != "Kosong") throw new ConflictException("Ruang Sedang diajukan atau sudah di Pinjam")

        if(req.is_admin == false && data.status != "Diajukan") throw new ConflictException("Hanya Admin yang bisa mengubah status selain Diajukan")

        let dataPeminjam = data.peminjam
        if (data.peminjam == "Pribadi") dataPeminjam = req.name

        if (!getPeminjamanRuang) throw new NotFoundException("Maaf Tidak Menemukan Ruangan Yang Anda Cari")

        const updatePeminjamanRuang = await this.databaseService.connection("peminjaman_ruang")
            .update({
                status: data.status,
                description: data.description || getPeminjamanRuang.description,
                peminjam: dataPeminjam || getPeminjamanRuang.peminjam
            })
            .where({ id: data.peminjaman_ruang_id })

        const getNewPeminjamanRuang = await this.databaseService.connection("peminjaman_ruang")
            .select("*")
            .where({ id: data.peminjaman_ruang_id })
            .first()

        return {
            message: "Berhasil",
            data: getNewPeminjamanRuang
        }
    }
}