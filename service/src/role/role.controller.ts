import { Body, Controller, Put, Request, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { AuthGuard } from 'src/auth/AuthGuard';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Put('/change-role')
  @UseGuards(AuthGuard)
  changeRole(
    @Request() req,
    @Body() data: { ekskul: number, nis: number, incomingRole: string }
  ) {
    return this.roleService.changeRoleUser(req.user, data)
  }
}
