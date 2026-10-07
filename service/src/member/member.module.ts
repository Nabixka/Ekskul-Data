import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { DatabaseModule } from '../database/database.module';
import { KegiatanModule } from '../kegiatan/kegiatan.module';
import { EkskulModule } from '../ekskul/ekskul.module';

@Module({
  imports: [DatabaseModule, KegiatanModule, EkskulModule],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
