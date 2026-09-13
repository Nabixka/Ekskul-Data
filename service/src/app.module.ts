import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { EkskulModule } from './ekskul/ekskul.module';
import { KegiatanModule } from './kegiatan/kegiatan.module';

@Module({
  imports: [UserModule, EkskulModule, KegiatanModule]
})
export class AppModule {}
