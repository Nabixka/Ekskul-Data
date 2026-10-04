import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { RoleModule } from 'src/role/role.module';
import { KasController } from './kas.controller';
import { KasService } from './kas.service';

@Module({
  imports: [DatabaseModule, RoleModule],
  controllers: [KasController],
  providers: [KasService]
})
export class KasModule {}
