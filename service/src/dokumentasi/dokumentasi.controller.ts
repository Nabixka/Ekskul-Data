import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Request, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { DokumentasiService } from './dokumentasi.service';
import { AuthGuard } from '../auth/AuthGuard';
import { ValidateEkskulExist } from '../Pipe/validateEkskulExist';
import { ValidateKegiatanExist } from '../Pipe/ValidateKegiatanExist';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('dokumentasi')
export class DokumentasiController {
  constructor(private readonly dokumentasiService: DokumentasiService) {}

  // Get Dokum By Ekskul
  @Get('/ekskul/:ekskul_id')
  @UseGuards(AuthGuard)
  getDokumentasiByEkskul(
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string
  ){
    return this.dokumentasiService.getDokumentasiByEkskul(Number(ekskul_id))
  }

  // Get Dokum By Kegiatan
  @Get('/kegiatan/:kegiatan_id')
  @UseGuards(AuthGuard)
  getDokumentasiByKegiatan(
    @Param('kegiatan_id', ValidateKegiatanExist) kegiatan_id: string
  ){
    return this.dokumentasiService.getDokumentasiByKegiatan(Number(kegiatan_id))
  }

  // Post Dokum
  @Post('/ekskul/:ekskul_id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('image', 20, {
    storage: diskStorage({
      destination: './uploads/dokumentasi',
      filename: (_req, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        callback(null, `${uniqueSuffix}${extname(file.originalname)}`)
      }
    }),
    fileFilter: (_req, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        return callback(new BadRequestException('File harus berupa gambar'), false)
      }
      callback(null, true)
    }
  }))
  createDokumentasi(
    @Request() req,
    @Param('ekskul_id', ValidateEkskulExist) ekskulId: number,
    @Body('kegiatan_id', ValidateKegiatanExist) kegiatanId: number,
    @UploadedFiles() images: Express.Multer.File[]
  ){
    return this.dokumentasiService.postDokumentasi(req.user, ekskulId, kegiatanId, images)
  }

  // Delete Dokum
  @Delete('/ekskul/:ekskul_id/dokumentasi/:dokumentasi_id')
  @UseGuards(AuthGuard)
  deleteDokumentasi(
    @Request() req,
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: number,
    @Param('dokumentasi_id') dokumentasi_id: number
  ){
    return this.dokumentasiService.deleteDokumentasi(req.user, ekskul_id, dokumentasi_id)
  }
}
