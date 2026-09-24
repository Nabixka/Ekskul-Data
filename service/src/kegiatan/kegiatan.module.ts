import { Module } from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';
import { KegiatanController } from './kegiatan.controller';
import { DatabaseModule } from 'src/database/database.module';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [DatabaseModule, RoleModule],
  controllers: [KegiatanController],
  providers: [KegiatanService],
  exports: [KegiatanService]
})
export class KegiatanModule {}
