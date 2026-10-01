import { Body, Controller, Delete, Get, Param, Post, Put, Request, Res, UseGuards } from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';
import { ValidateKegiatanExist } from 'src/Pipe/ValidateKegiatanExist';
import { ValidateEkskulExist } from 'src/Pipe/validateEkskulExist';
import { AuthGuard } from 'src/auth/AuthGuard';
import type { Response } from 'express';

@Controller('kegiatan')
export class KegiatanController {
  constructor(private readonly kegiatanService: KegiatanService) { }

  // List Kegiatan
  @Get('/ekskul/:ekskul_id')
  @UseGuards(AuthGuard)
  getListKegiatanByEkskul(
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string
  ) {
    return this.kegiatanService.getListKegiatanEkskul(Number(ekskul_id))
  }

  // Detail Kegiatan
  @Get('/:kegiatan_id')
  @UseGuards(AuthGuard)
  getDetailKegiatan(
    @Param('kegiatan_id', ValidateKegiatanExist) kegiatan_id: string
  ) {
    return this.kegiatanService.getDetailKegiatan(Number(kegiatan_id))
  }

  // Create Kegiatan
  @Post('/ekskul/:ekskul_id')
  @UseGuards(AuthGuard)
  createKegiatan(
    @Request() req,
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string,
    @Body() data: { title: string, description: string, location: string, waktu: string }
  ) {
    return this.kegiatanService.createKegiatan(req.user, Number(ekskul_id), data)
  }

  // Update Kegiatan
  @Put('/kegiatan_id/ekskul/:ekskul_id')
  @UseGuards(AuthGuard)
  updateKegiatan(
    @Request() req,
    @Param('kegiatan_id', ValidateKegiatanExist) kegiatan_id: string,
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string,
    @Body() data: { title: string, description: string, location: string, waktu: string }
  ) {
    return this.kegiatanService.updateKegiatan(req.user, Number(ekskul_id), Number(kegiatan_id), data)
  }

  // Delete Kegiatan
  @Delete('/:kegiatan_id/ekskul/:ekskul_id')
  @UseGuards(AuthGuard)
  deleteKegiatan(
    @Request() req,
    @Param('kegiatan_id', ValidateKegiatanExist) kegiatan_id: string,
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string
  ) {
    return this.kegiatanService.deleteKegiatan(req.user, Number(kegiatan_id), Number(ekskul_id))
  }

  @Post('/:kegiatan_id/ekskul/:ekskul_id/absen')
  @UseGuards(AuthGuard)
  absenKegiatan(
    @Request() req,
    @Param('kegiatan_id', ValidateKegiatanExist) kegiatan_id: string,
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string,
    @Body() data: { listMember: string[] }
  ) {
    return this.kegiatanService.absenKegiatan(req.user, Number(ekskul_id), Number(kegiatan_id), data.listMember)
  }

  @Post('/export')
  @UseGuards(AuthGuard)
  async exportKegiatan(
    @Request() req,
    @Res() res: Response,
    @Body() data: string[]
  ) {
    try {
      const buffer = await this.kegiatanService.exportKegiatan(req.user, data)

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      )
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=laporan-kegiatan.docx',
      )

      res.send(buffer)
    }
    catch(error){
      res.status(500).json({
        message: "Gagal Download"
      })
    }

  }
}
