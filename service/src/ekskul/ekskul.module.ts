import { Module } from '@nestjs/common';
import { EkskulService } from './ekskul.service';
import { EkskulController } from './ekskul.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EkskulController],
  providers: [EkskulService],
})
export class EkskulModule {}
