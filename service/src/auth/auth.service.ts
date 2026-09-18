import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        private databaseService: DatabaseService,
        private jwtService: JwtService
    ) {}

    async jwtHelper(data: {id: number, name: string, nis: number, is_admin: boolean }){
        const payload = { id: data.id, name: data.name, nis: data.nis, is_admin: data.is_admin }
        return await this.jwtService.signAsync(payload)
    }

    async login(data: { nis: number, password: string}){
        if(!data.nis || !data.password) throw new BadRequestException("Harap Isi Semua Data")
        if(isNaN(data.nis)) throw new BadRequestException("NIS Harus Angka")
        
        const exist = await this.databaseService.connection("users")
        .select("*")
        .where({nis: data.nis})
        .first()

        if(!exist) throw new NotFoundException("Akun Belum Terdaftar")
        const comparePassword = await bcrypt.compare(data.password, exist.password)
        if(!comparePassword) throw new BadRequestException("Password Salah")
        
        return {
            access_token: await this.jwtHelper(exist)
        }
    }

    async register(data: {name: string, nis: number, password: string} ){
        if(!data.name || !data.nis || !data.password) throw new BadRequestException("Harap Isi Semua Data")
        if(isNaN(data.nis)) throw new BadRequestException("NIS Harus Angka")
        
        const exist = await this.databaseService.connection("users")
        .select("nis")
        .where({nis: data.nis})
        .first()
        if(exist) throw new ConflictException("User Sudah Ada")
        
        const hashPassword = await bcrypt.hash(data.password, 10)
        const [register] = await this.databaseService.connection("users")
        .insert({name: data.name, nis: data.nis, password: hashPassword, is_admin: false})
        .returning(["id", "name", "nis", "is_admin"])

        return {
            access_token: await this.jwtHelper(register)
        }
    }
}