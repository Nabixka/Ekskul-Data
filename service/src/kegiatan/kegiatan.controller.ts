import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';
import { ValidateKegiatanExist } from 'src/Pipe/ValidateKegiatanExist';
import { ValidateEkskulExist } from 'src/Pipe/validateEkskulExist';
import { AuthGuard } from 'src/auth/AuthGuard';

@Controller('kegiatan')
export class KegiatanController {
  constructor(private readonly kegiatanService: KegiatanService) {}

  // List Kegiatan
  @Get('/ekskul/:ekskul_id')
  @UseGuards(AuthGuard)
  getListKegiatanByEkskul(
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string
  ){
    return this.kegiatanService.getListKegiatanEkskul(Number(ekskul_id))
  }

  // Detail Kegiatan
  @Get('/:kegiatan_id')
  @UseGuards(AuthGuard)
  getDetailKegiatan(
    @Param('kegiatan_id', ValidateKegiatanExist) kegiatan_id: string
  ){
    return this.kegiatanService.getDetailKegiatan(Number(kegiatan_id))
  }

  // Create Kegiatan
  @Post('/ekskul/:ekskul_id')
  @UseGuards(AuthGuard)
  createKegiatan(
    @Request() req,
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string,
    @Body() data: { title: string, description: string, location: string, waktu: string}
  ){
    return this.kegiatanService.createKegiatan(req.user, Number(ekskul_id), data)
  }

  // Update Kegiatan
  @Put('/kegiatan_id/ekskul/:ekskul_id')
  @UseGuards(AuthGuard)
  updateKegiatan(
    @Request() req,
    @Param('kegiatan_id', ValidateKegiatanExist) kegiatan_id: string,
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string,
    @Body() data: { title: string, description: string, location: string, waktu: string}
  ){
    return this.kegiatanService.updateKegiatan(req.user, Number(ekskul_id), Number(kegiatan_id), data)
  }

  // Delete Kegiatan
  @Delete('/:kegiatan_id/ekskul/:ekskul_id')
  @UseGuards(AuthGuard)
  deleteKegiatan(
    @Request() req,
    @Param('kegiatan_id', ValidateKegiatanExist) kegiatan_id: string,
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string
  ){
    return this.kegiatanService.deleteKegiatan(req.user, Number(kegiatan_id), Number(ekskul_id))
  }

}
