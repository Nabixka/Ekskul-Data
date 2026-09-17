import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';
import { ValidateKegiatanExist } from 'src/Pipe/ValidateKegiatanExist';
import { ValidateEkskulExist } from 'src/Pipe/validateEkskulExist';

@Controller('kegiatan')
export class KegiatanController {
  constructor(private readonly kegiatanService: KegiatanService) {}

  // List Kegiatan
  @Get('/ekskul/:ekskul_id')
  getListKegiatanByEkskul(
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string
  ){
    return this.kegiatanService.getListKegiatanEkskul(Number(ekskul_id))
  }

  // Detail Kegiatan
  @Get('/:kegiatan_id')
  getDetailKegiatan(
    @Param('kegiatan_id', ValidateKegiatanExist) kegiatan_id: string
  ){
    return this.kegiatanService.getDetailKegiatan(Number(kegiatan_id))
  }

  // Create Kegiatan
  @Post('/ekskul/:ekskul_id')
  createKegiatan(
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string,
    @Body() data: { title: string, description: string, location: string, waktu: string}
  ){
    return this.kegiatanService.createKegiatan(Number(ekskul_id), data)
  }

  // Update Kegiatan
  @Put('/kegiatan_id')
  updateKegiatan(
    @Param('kegiatan_id', ValidateKegiatanExist) kegiatan_id: string,
    @Body() data: { title: string, description: string, location: string, waktu: string}
  ){
    return this.kegiatanService.updateKegiatan(Number(kegiatan_id), data)
  }

  // Delete Kegiatan
  @Delete('/:kegiatan_id')
  deleteKegiatan(
    @Param('kegiatan_id', ValidateKegiatanExist) kegiatan_id: string
  ){
    return this.kegiatanService.deleteKegiatan(Number(kegiatan_id))
  }

}
