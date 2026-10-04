import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RoleService } from 'src/role/role.service';

const DOKUMENTASI_MANAGEMENT_ROLES = ['Ketua', 'Wakil Ketua', 'Humas']

@Injectable()
export class DokumentasiService {
    constructor( 
        private databaseService: DatabaseService,
        private roleService: RoleService
    ) {}

    // Get Dokum By Ekskul
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

    // Get Dokum By Kegiatan
    async getDokumentasiByKegiatan(kegiatan_id){
        const getDokumentasi = await this.databaseService.connection("list_dokumentasi")
        .innerJoin("kegiatan", "kegiatan.id", "list_dokumentasi.kegiatan_id")
        .select({
            id: "list_dokumentasi.id",
            path: "list_dokumentasi.path",
        })
        .where({ kegiatan_id: kegiatan_id})

        return {
            message: "Berhasil Mendapat Dokumentasi",
            data: getDokumentasi
        }
    }

    // Post Dokumentasi
    async postDokumentasi(
        req: { nis: number, is_admin: boolean}, 
        ekskul_id: number, 
        kegiatan_id: number, 
        images: Express.Multer.File[]
    ){
        if (!images?.length) throw new BadRequestException("Minimal unggah satu gambar")
        if (req.is_admin !== false) throw new ForbiddenException("Anda Tidak Berhak")

        const kegiatan = await this.databaseService.connection("kegiatan")
        .select("id")
        .where({id: kegiatan_id, ekskul_id})
        .first()

        if (!kegiatan) throw new NotFoundException("Tidak Menemukan Kegiatan")

        const role = await this.roleService.getRole(req.nis, ekskul_id)
        if(!DOKUMENTASI_MANAGEMENT_ROLES.includes(role)) throw new ForbiddenException("Anda Tidak Berhak")

        const dokumentasi = await this.databaseService.connection("list_dokumentasi")
        .insert(images.map((image) => ({
            path: `/uploads/dokumentasi/${image.filename}`,
            kegiatan_id
        })))
        .returning("*")

        return {
            message: "Berhasil Upload Dokumentasi",
            data: dokumentasi
        }
    }

    // Delete Dokumentasi
    async deleteDokumentasi(
        req: { nis: number, is_admin: boolean}, 
        ekskul_id: number, 
        dokumentasi_id: number
    ){
        if (req.is_admin !== false) throw new ForbiddenException("Anda Tidak Berhak")
        
        const dokumentasi = await this.databaseService.connection("list_dokumentasi")
        .innerJoin("kegiatan", "kegiatan.id", "list_dokumentasi.kegiatan_id")
        .select("list_dokumentasi.id")
        .where({"list_dokumentasi.id": dokumentasi_id, "kegiatan.ekskul_id": ekskul_id})
        .first()

        if (!dokumentasi) throw new NotFoundException("Tidak Menemukan Dokumentasi")
        
        const role = await this.roleService.getRole(req.nis, ekskul_id)
        if(!DOKUMENTASI_MANAGEMENT_ROLES.includes(role)) throw new ForbiddenException("Anda Tidak Berhak")

        const del = await this.databaseService.connection("list_dokumentasi")
        .delete()
        .where({ id: dokumentasi_id })

        return {
            message: "Berhasil Hapus Dokumentasi"
        }
    }
}