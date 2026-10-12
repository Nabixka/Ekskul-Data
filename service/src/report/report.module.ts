import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RoleModule } from '../role/role.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [DatabaseModule, RoleModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
