import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ProfilMapping } from 'src/Mapping/ProfilMapping';

@Injectable()
export class UserService {
    constructor(
        private databaseService: DatabaseService
    ) {}

    // Helper Get Role
    async getRole(nis_user: number, ekskul_id){
        const get = await this.databaseService.connection("member_ekskul")
        .select("role")
        .where({nis_user: nis_user, ekskul_id: ekskul_id})
        .first()

        return get
    }

    // Get My Profil
    async getDashboardMember(req: { id: number, name: string, nis: number, is_admin: boolean}){
        if(req.is_admin == true) throw new ForbiddenException("Anda Tidak Berhak Akses Dashboard Member")
        const getMyEkskul = await this.databaseService.connection("member_ekskul")
        .innerJoin("ekskul", "ekskul.id", "member_ekskul.ekskul_id")
        .select({
            ekskul_id: "ekskul.id",
            ekskul_name: "ekskul.name",
            ekskul_banner: "ekskul.banner",
            ekskul_bidang: "ekskul.bidang",
            role: "member_ekskul.role"
        })
        .where({
            nis_user: req.nis
        })

        const mappingEkskul = getMyEkskul.map((e) => e.ekskul_id)

        const getRecentKegiatan = await this.databaseService.connection("kegiatan")
        .select("*")
        .limit(3)
        .orderBy("waktu", 'desc')
        .whereIn("ekskul_id", mappingEkskul)

        return {
            message: "Berhasil Mendapatkan Profil",
            data: {
                name: req.name,
                is_admin: req.is_admin,
                ekskul: getMyEkskul.map(ProfilMapping),
                kegiatan: getRecentKegiatan
            }
        }
    }

    // Dashboard Admin
    async getDashboardAdmin(req: { nis: number, is_admin: boolean}){
        if(req.is_admin !== true) throw new ForbiddenException("Anda Tidak Berhak Akses Dashboard Admin")
        
        const getAllEkskul = await this.databaseService.connection("ekskul").select("name")
        const mappingEkskul = getAllEkskul.map((e) => e.name) 

        const getAllMember = await this.databaseService.connection("users").select("name").where({is_admin: false})
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

    // Change Role Member EKskul
    async changeRoleUser(req: { nis: number, is_admin: boolean}, data: { ekskul: number, nis: number, incomingRole: string } ){

        const updateRole = await this.databaseService.connection("member_ekskul")
        .update({ role: data.incomingRole })
        .where({ nis_user: data.nis, ekskul_id: data.ekskul })

        return {
            message: "Berhasil Update Role"
        }
    }
}
