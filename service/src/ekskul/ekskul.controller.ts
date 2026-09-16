import { Body, Controller, Delete, Get, Param, Post, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { EkskulService } from './ekskul.service';
import { ValidateEkskulExist } from 'src/Pipe/validateEkskulExist';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'
import { extname } from 'path';


@Controller('ekskul')
export class EkskulController {
  constructor(private readonly ekskulService: EkskulService) { }

  // Get All Ekskul
  @Get()
  getAllEkskul() {
    return this.ekskulService.getAllEkskul()
  }

  // Get One Ekskul
  @Get('/:ekskul_id')
  getOneEkskul(
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string
  ) {
    return this.ekskulService.getOneEkskul(Number(ekskul_id))
  }

  // Create Ekskul
  @Post()
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/ekskul/logo',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
          const ext = extname(file.originalname)
          cb(null, `${file.filename}-${uniqueSuffix}${ext}`)
        }
      })
    })
  )
  createEkskul(
    @Body('name') name: string ,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    return this.ekskulService.createEkskul(name, logo)
  }

  // Delete Ekskul
  @Delete('/:ekskul_id')
  deleteEkskul(
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string
  ) {
    return this.ekskulService.deleteEKskul(Number(ekskul_id))
  }

  // Join Ekskul
  @Post('/:ekskul_id/join')
  joinEkskul(
    @Request() req,
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string
  ) {
    return this.ekskulService.joinEkskul(req.user, Number(ekskul_id))
  }

}
