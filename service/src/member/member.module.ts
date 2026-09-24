import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { DatabaseModule } from 'src/database/database.module';
import { KegiatanModule } from 'src/kegiatan/kegiatan.module';
import { EkskulModule } from 'src/ekskul/ekskul.module';

@Module({
  imports: [DatabaseModule, KegiatanModule, EkskulModule],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
