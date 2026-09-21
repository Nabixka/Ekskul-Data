import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ProfilMapping } from 'src/Mapping/ProfilMapping';

@Injectable()
export class UserService {
    constructor(private databaseService: DatabaseService) {}

    // Helper Get Role
    async getRole(nis_user: number, ekskul_id){
        const get = await this.databaseService.connection("member_ekskul")
        .select("role")
        .where({nis_user: nis_user, ekskul_id: ekskul_id})
        .first()

        return get
    }

    // Get My Profil
    async getProfil(req: { id: number, name: string, nis: number, is_admin: boolean}){
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

        return {
            message: "Berhasil Mendapatkan Profil",
            data: {
                name: req.name,
                is_admin: req.is_admin,
                ekskul: getMyEkskul.map(ProfilMapping)
            }
        }
    }

    // Change Role Member EKskul
    async changeRoleUser(req: { nis: number, is_admin: boolean}, data: { ekskul: number, nis: number, incomingRole: string } ){
        const isCorrectEkskul = await this.getRole(data.nis, data.ekskul)

        const updateRole = await this.databaseService.connection("member_ekskul")
        .update({ role: data.incomingRole })
        .where({ nis_user: data.nis, ekskul_id: data.ekskul })

        return {
            message: "Berhasil Update Role"
        }
    }
}
