import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class EkskulService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly userService: UserService
    ) {}

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
        const getEkskul = await this.databaseService.connection("ekskul")
        .select("*")
        .where({id: id})
        .first()
        
        const getListMember = await this.databaseService.connection("member_ekskul")
        .innerJoin("users", "users.id", "member_ekskul.user_id")
        .select({
            name: "users.name",
            nis: "users.nis",
            role: "member_ekskul.role"
        })
        .where({ekskul_id: id})
    

        if(!getEkskul) throw new NotFoundException("Ekskul Tidak Ada")

        return {
            message: "Berhasil Mendapatkan Detail Ekskul",
            data: {
                ekskul: getEkskul,
                member: getListMember
            }
        }
    }

    // Create Ekskul
    async createEkskul(req: { id: number, is_admin: boolean }, name: string, banner: Express.Multer.File){
        if(req.is_admin !== true) throw new ForbiddenException("Hanya Osis Yang Dapat Melakukannya")

        if(!name || !banner) throw new BadRequestException("Lengkapi Data yang dibutuhkan")

        const path = `/uploads/ekskul/banner/${banner.filename}`
        const [create] = await this.databaseService.connection("ekskul").insert({ name: name, banner: path}).returning("*")

        return {
            message: "Berhasil Membuat Ekskul",
            data: create
        }
    }

    // Delete Ekskul
    async deleteEkskul(req: { id: number, is_admin: boolean }, id: number){
        if(req.is_admin !== true) throw new ForbiddenException("Hanya Osis Yang Dapat Melakukannya")

        const del = await this.databaseService.connection("ekskul").delete().where({id: id})

        return {
            message: "Berhasil Menghapus Ekskul"
        }
    }

    // Join Ekskul
    async joinEkskul(req: { id: number, is_admin: boolean}, ekskul_id: number){
        if(req.is_admin !== false) throw new ForbiddenException("Osis Mana Boleh Join Pake Akun Ini")
            
        // Apakah Sudah Join
        const isAlreadyJoin = await this.userService.getRole(req.id, ekskul_id)
        if(isAlreadyJoin) throw new ConflictException("Anda Sudah Menjadi Anggota")

        // Join
        const join = await this.databaseService.connection("member_ekskul")
        .insert({ user_id: req.id, ekskul_id: ekskul_id, role: 'Member'})


        return {
            message: "Berhasil Join Ekskul"
        }
    }

}