import { Module } from '@nestjs/common';
import { EkskulModule } from './ekskul/ekskul.module';
import { KegiatanModule } from './kegiatan/kegiatan.module';
import { AuthModule } from './auth/auth.module';
import { DokumentasiModule } from './dokumentasi/dokumentasi.module';
import { AdminModule } from './admin/admin.module';
import { MemberModule } from './member/member.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [EkskulModule, KegiatanModule, AuthModule, DokumentasiModule, AdminModule, MemberModule, RoleModule]
})
export class AppModule {}
