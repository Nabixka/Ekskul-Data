import { Body, Controller, Delete, Get, Param, Post, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { EkskulService } from './ekskul.service';
import { ValidateEkskulExist } from 'src/Pipe/validateEkskulExist';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'
import { extname } from 'path';
import { AuthGuard } from 'src/auth/AuthGuard';


@Controller('ekskul')
export class EkskulController {
  constructor(private readonly ekskulService: EkskulService) { }

  // Get All Ekskul
  @Get()
  @UseGuards(AuthGuard)
  getAllEkskul() {
    return this.ekskulService.getAllEkskul()
  }

  // Get One Ekskul
  @Get('/:ekskul_id')
  @UseGuards(AuthGuard)
  getDetailEkskul(
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string
  ) {
    return this.ekskulService.getDetailEKskul(Number(ekskul_id))
  }

  // Create Ekskul
  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('banner', {
      storage: diskStorage({
        destination: './uploads/ekskul/banner',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
          const ext = extname(file.originalname)
          cb(null, `${file.filename}-${uniqueSuffix}${ext}`)
        }
      })
    })
  )
  createEkskul(
    @Request() req,
    @Body('name') name: string ,
    @Body('bidang') bidang: string,
    @UploadedFile() banner: Express.Multer.File,
  ) {
    return this.ekskulService.createEkskul(req.user, name, banner, bidang)
  }

  // Delete Ekskul
  @Delete('/:ekskul_id')
  @UseGuards(AuthGuard)
  deleteEkskul(
    @Request() req,
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string
  ) {
    return this.ekskulService.deleteEkskul(req.user, Number(ekskul_id))
  }

  // Join Ekskul
  @Post('/:ekskul_id/join')
  @UseGuards(AuthGuard)
  joinEkskul(
    @Request() req,
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string
  ) {
    return this.ekskulService.joinEkskul(req.user, Number(ekskul_id))
  }

}
