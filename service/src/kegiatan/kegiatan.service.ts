import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ValidateRole } from 'src/Pipe/ValidateRole';

@Injectable()
export class KegiatanService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly validateRole: ValidateRole
    ) {}

    // All Member Of That Ekskul 

    // Get List Kegiatan
    async getListKegiatanEkskul(ekskul_id: number){
        const getKegiatan = await this.databaseService.connection("kegiatan")
        .select("id", "description", "location", "waktu")
        .where("ekskul.id", ekskul_id)


        return{
            message: "Berhasil Mendapatkan List Kegiatan Ekskul",
            data: getKegiatan
        }
    }

    // Delete Kegiatan
    async deleteKegiatan(id: number, req: { id: number }){
        const isCorrectRole = await this.validateRole
        if(isCorrectRole != "Humas") throw new ForbiddenException("Maaf Anda Bukan Humas")
        
        const deleteKegiatan = await this.databaseService.connection("kegiatan").delete().where("id", id)

        return {
            message: "Berhasil Menghapus Kegiatan"
        }
    }
}