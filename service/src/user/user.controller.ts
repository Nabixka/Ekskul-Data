import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/AuthGuard';
import { ValidateEkskulExist } from 'src/Pipe/validateEkskulExist';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(
    @Request() req
  ){
    return this.userService.getProfil(req.user)
  }

  @Put('/change-role')
  @UseGuards(AuthGuard)
  changeRole(
    @Request() req,
    @Body() data: { ekskul: number, nis: number, incomingRole: string }
  ){
    return this.userService.changeRoleUser(req.user, data)
  }
}
