import { Module } from '@nestjs/common';
import { RuangService } from './ruang.service';
import { RuangController } from './ruang.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RuangController],
  providers: [RuangService],
})
export class RuangModule {}
