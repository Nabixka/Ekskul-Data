import { Module } from '@nestjs/common';
import { EkskulService } from './ekskul.service';
import { EkskulController } from './ekskul.controller';

@Module({
  controllers: [EkskulController],
  providers: [EkskulService],
})
export class EkskulModule {}
