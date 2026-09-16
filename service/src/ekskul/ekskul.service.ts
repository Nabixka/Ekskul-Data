import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class EkskulService {
    constructor(private readonly databaseService: DatabaseService) {}

    // Get All Ekskul
    async getAllEkskul(){
        const get = await this.databaseService.connection("ekskul").select("*")

        return{
            message: "Berhasil Mendapatkan List Ekskul",
            data: get
        }
    }

    // Get One Ekskul
    async getOneEkskul(id: number){
        const get = await this.databaseService.connection("ekskul").select("*").where({id: id}).first()

        if(!get) throw new NotFoundException("Ekskul Tidak Ada")

        return {
            message: "Berhasil Mendapatkan Detail Ekskul",
            data: get
        }
    }

    // Create Ekskul
    async createEkskul(name: string, logo: Express.Multer.File){
        if(!name || !logo) throw new BadRequestException("Lengkapi Data yang dibutuhkan")
        const path = `/uploads/ekskul/logo/${logo.filename}`
        const create = await this.databaseService.connection("ekskul").insert({ name: name, logo: path}).returning("*")

        return {
            message: "Berhasil Membuat Ekskul",
            data: create
        }
    }

    // Delete Ekskul
    async deleteEKskul(id: number){
        const del = await this.databaseService.connection("ekskul").delete().where({id: id})

        return {
            message: "Berhasil Menghapus Ekskul"
        }
    }

    // Join Ekskul
    async joinEkskul(req: { id: number}, ekskul_id: number){
        const join = await this.databaseService.connection("member_ekskul")
        .insert({ user_id: req.id, ekskul_id: ekskul_id, role: 'member'})
        return {
            message: "Berhasil Join Ekskul"
        }
    }

}