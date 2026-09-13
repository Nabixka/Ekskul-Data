import { Controller, Get, Param } from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';

@Controller('kegiatan')
export class KegiatanController {
  constructor(private readonly kegiatanService: KegiatanService) {}

  @Get('/ekskul/:ekskul_id')
  getAllKegiatanByEkskul(
    @Param('ekskul_id') ekskul_id: string
  ){
    return this.kegiatanService.getListKegiatanEkskul(Number(ekskul_id))
  }
}
