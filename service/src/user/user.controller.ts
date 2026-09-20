import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/AuthGuard';

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
}
