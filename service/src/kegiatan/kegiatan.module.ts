import { Module } from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';
import { KegiatanController } from './kegiatan.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ValidateRole } from 'src/Pipe/ValidateRole';

@Module({
  imports: [DatabaseModule],
  controllers: [KegiatanController],
  providers: [KegiatanService, ValidateRole],
})
export class KegiatanModule {}
