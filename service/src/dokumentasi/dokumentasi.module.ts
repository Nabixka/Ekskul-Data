import { Module } from '@nestjs/common';
import { DokumentasiService } from './dokumentasi.service';
import { DokumentasiController } from './dokumentasi.controller';
import { DatabaseModule } from '../database/database.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [DatabaseModule, RoleModule],
  controllers: [DokumentasiController],
  providers: [DokumentasiService],
})
export class DokumentasiModule {}
