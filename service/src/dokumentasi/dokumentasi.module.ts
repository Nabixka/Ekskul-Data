import { Module } from '@nestjs/common';
import { DokumentasiService } from './dokumentasi.service';
import { DokumentasiController } from './dokumentasi.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DokumentasiController],
  providers: [DokumentasiService],
})
export class DokumentasiModule {}
