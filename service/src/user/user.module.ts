import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from 'src/database/database.module';
import { EkskulService } from 'src/ekskul/ekskul.service';
import { EkskulModule } from 'src/ekskul/ekskul.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService, EkskulService],
})
export class UserModule {}
