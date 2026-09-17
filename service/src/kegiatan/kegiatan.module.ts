import { Module } from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';
import { KegiatanController } from './kegiatan.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [KegiatanController],
  providers: [KegiatanService],
})
export class KegiatanModule {}
