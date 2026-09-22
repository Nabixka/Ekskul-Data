import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DokumentasiService } from './dokumentasi.service';
import { AuthGuard } from 'src/auth/AuthGuard';
import { ValidateEkskulExist } from 'src/Pipe/validateEkskulExist';

@Controller('dokumentasi')
export class DokumentasiController {
  constructor(private readonly dokumentasiService: DokumentasiService) {}

  @Get('/ekskul/:ekskul_id')
  @UseGuards(AuthGuard)
  getDokumentasiByEkskul(
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string
  ){
    return this.dokumentasiService.getDokumentasiByEkskul(Number(ekskul_id))
  }
}
