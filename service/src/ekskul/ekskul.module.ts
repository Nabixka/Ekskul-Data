import { Module } from '@nestjs/common';
import { EkskulService } from './ekskul.service';
import { EkskulController } from './ekskul.controller';
import { DatabaseModule } from 'src/database/database.module';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [DatabaseModule, RoleModule],
  controllers: [EkskulController],
  providers: [EkskulService],
  exports: [EkskulService]
})
export class EkskulModule {}
