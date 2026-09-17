import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(
    @Body() data: { nis: number, password: string}
  ){
    return this.authService.login(data)
  }

  @Post('/register')
  register(
    @Body() data: { name: string, nis: number, password: string}
  ){
    return this.authService.register(data)
  }
}
