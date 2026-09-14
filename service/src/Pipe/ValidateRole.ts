import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class ValidateRole{
    constructor(private databaseService: DatabaseService) {}

    async checkRole(member_id: number, ekskul_id: number){
        if(!member_id || !ekskul_id) throw new BadRequestException("Wajib Isi")

        const getRole = await this.databaseService.connection("member_ekskul")
        .select("role")
        .where({member_id: member_id, ekskul_id: ekskul_id})
        .first()

        if(!getRole) throw new NotFoundException("Anda Tidak Terdaftar Sebagai Anggota Ekskul")

        return getRole
    }
}