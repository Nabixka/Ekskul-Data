import { Module } from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';
import { KegiatanController } from './kegiatan.controller';

@Module({
  controllers: [KegiatanController],
  providers: [KegiatanService],
})
export class KegiatanModule {}
