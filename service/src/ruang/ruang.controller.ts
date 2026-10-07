import { Body, Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { RuangService } from './ruang.service';
import { AuthGuard } from '../auth/AuthGuard';

@Controller('ruang')
export class RuangController {
  constructor(private readonly ruangService: RuangService) {}

  @Get()
  @UseGuards(AuthGuard)
  getAllPeminjamanRuang(
    @Request() req
  ){
    return this.ruangService.getAllPmeminjamanRuangHariIni()
  }

  @Patch()
  @UseGuards(AuthGuard)
  pengajuanPeminjamanRuangHariIni(
    @Request() req,
    @Body() data: { peminjaman_ruang_id: number, status: string, description: string, peminjam: string}
  ){
    return this.ruangService.updatePermintaan(req.user, data)
  }
}
