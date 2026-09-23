import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/AuthGuard';
import { ValidateEkskulExist } from 'src/Pipe/validateEkskulExist';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('/member/dashboard')
  getProfile(
    @Request() req
  ){
    return this.userService.getDashboardMember(req.user)
  }

  @Put('/change-role')
  @UseGuards(AuthGuard)
  changeRole(
    @Request() req,
    @Body() data: { ekskul: number, nis: number, incomingRole: string }
  ){
    return this.userService.changeRoleUser(req.user, data)
  }

  // Dashboard Admin
  @Get('/admin/dashboard')
  @UseGuards(AuthGuard)
  getDashboardAdmin(
    @Request() req,
  ){
    return this.userService.getDashboardAdmin(req.user)
  }
}
