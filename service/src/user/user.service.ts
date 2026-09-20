import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ProfilMapping } from 'src/Mapping/ProfilMapping';

@Injectable()
export class UserService {
    constructor(private databaseService: DatabaseService) {}

    async getRole(user_id: number, ekskul_id){
        const get = await this.databaseService.connection("member_ekskul")
        .select("role")
        .where({user_id: user_id, ekskul_id: ekskul_id})
        .first()

        return get
    }

    async getProfil(req: { id: number, name: string, nis: number, is_admin: boolean}){
        const getMyEkskul = await this.databaseService.connection("member_ekskul")
        .innerJoin("ekskul", "ekskul.id", "member_ekskul.ekskul_id")
        .select({
            ekskul_id: "ekskul.id",
            ekskul_name: "ekskul.name",
            ekskul_banner: "ekskul.banner",
            ekskul_bidang: "ekskul.bidang"
        })
        .where({
            user_id: req.id
        })

        return {
            message: "Berhasil Mendapatkan Profil",
            data: {
                ekskul: getMyEkskul.map(ProfilMapping)
            }
        }
    }
}
