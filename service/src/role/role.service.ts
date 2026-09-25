import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class RoleService {
    constructor(private databaseService: DatabaseService) {}

    // Get Role
    async getRole(nis_user: number, ekskul_id: number){
        const get = await this.databaseService.connection("member_ekskul")
        .select("role")
        .where({nis_user: nis_user, ekskul_id: ekskul_id})
        .first()

        return get.role
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