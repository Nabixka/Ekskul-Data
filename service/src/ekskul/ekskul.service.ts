import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class EkskulService {
    constructor(private readonly databaseService: DatabaseService) {}

    async getAllEkskul(){
        const get = await this.databaseService.connection("ekskul").select("*")

        return{
            message: "Berhasil Mendapatkan List Ekskul",
            data: get
        }
    }

    async getOneEkskul(id: number){
        const get = await this.databaseService.connection("ekskul").select("*").where({id: id}).first()

        if(!get) throw new NotFoundException("Ekskul Tidak Ada")

        return {
            message: "Berhasil Mendapatkan Detail Ekskul",
            data: get
        }
    }
}