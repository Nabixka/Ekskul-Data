import { Module } from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';
import { KegiatanController } from './kegiatan.controller';
import { DatabaseModule } from 'src/database/database.module';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [DatabaseModule],
  controllers: [KegiatanController],
  providers: [KegiatanService, UserService],
})
export class KegiatanModule {}
