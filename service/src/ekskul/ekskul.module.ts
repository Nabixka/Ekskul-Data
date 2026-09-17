import { Module } from '@nestjs/common';
import { EkskulService } from './ekskul.service';
import { EkskulController } from './ekskul.controller';
import { DatabaseModule } from 'src/database/database.module';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [DatabaseModule],
  controllers: [EkskulController],
  providers: [EkskulService, UserService],
})
export class EkskulModule {}
