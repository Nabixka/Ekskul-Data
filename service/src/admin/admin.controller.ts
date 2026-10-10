import { BadRequestException, Controller, Get, Post, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/AuthGuard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // Dashboard Admin
  @Get('/dashboard')
  @UseGuards(AuthGuard)
  getDashboardAdmin(
    @Request() req,
  ) {
    return this.adminService.getDashboardAdmin(req.user)
  }

  @Get('/data-siswa')
  @UseGuards(AuthGuard)
  getListEkskulSiswa(
    @Request() req
  ){
    return this.adminService.getListEkskulSiswaByKelas(req.user)
  }

  @Post('/data-siswa')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async insertDataSiswa(
    @Request() req,
    @UploadedFile() file: Express.Multer.File
  ){
    if(!file) throw new BadRequestException("Mana File nya")
    return this.adminService.insertDataSiswa(req.user, file)
  }
}
