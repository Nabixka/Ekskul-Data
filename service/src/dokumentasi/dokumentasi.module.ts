import { Module } from '@nestjs/common';
import { DokumentasiService } from './dokumentasi.service';
import { DokumentasiController } from './dokumentasi.controller';
import { DatabaseModule } from 'src/database/database.module';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [DatabaseModule, RoleModule],
  controllers: [DokumentasiController],
  providers: [DokumentasiService],
})
export class DokumentasiModule {}
