import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from 'src/auth/AuthGuard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // Dashboard Admin
  @Get('/dashboard')
  @UseGuards(AuthGuard)
  getDashboardAdmin(
    @Request() req,
  ) {
    return this.adminService.getDashboardAdmin(req.user)
  }
}
