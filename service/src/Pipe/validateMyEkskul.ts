import { ArgumentMetadata, Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class validateMyEkskul{
    constructor( private databaseService: DatabaseService ) {}

    async validateMyEkskul(nis: number, ekskul_id: number){

        const getMyEkskul = await this.databaseService.connection("member_ekskul")
        .select("*")
        .where({nis_user: nis, ekskul_id: ekskul_id})

        return getMyEkskul
    }
}