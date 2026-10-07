import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RoleModule } from '../role/role.module';
import { KasController } from './kas.controller';
import { KasService } from './kas.service';

@Module({
  imports: [DatabaseModule, RoleModule],
  controllers: [KasController],
  providers: [KasService]
})
export class KasModule {}
