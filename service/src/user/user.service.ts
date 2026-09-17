import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
    constructor(private databaseService: DatabaseService) {}

    async getRole(user_id: number, ekskul_id){
        const get = await this.databaseService.connection("member_ekskul")
        .select("role")
        .where({user_id: user_id, ekskul_id: ekskul_id})
        .first()

        return get.role
    }
}
