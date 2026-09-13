import { ArgumentMetadata, Injectable, NotFoundException, PipeTransform } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class ValidateEkskulExist implements PipeTransform{
    constructor(private databaseService: DatabaseService) {}

    async transform(value: any, metadata: ArgumentMetadata) {
        const id = Number(value)
        
        const isExist = await this.databaseService.connection("ekskul").select("id").where({id: id}).first()
        if(!isExist) throw new NotFoundException("Ekskul Tidak Ada")

        return id
    }
}