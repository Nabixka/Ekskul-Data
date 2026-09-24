import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { AuthGuard } from 'src/auth/AuthGuard';
import { ValidateEkskulExist } from 'src/Pipe/validateEkskulExist';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) { }

  // Dashboard Member
  @Get('/dashboard')
  @UseGuards(AuthGuard)
  getProfile(
    @Request() req
  ) {
    return this.memberService.getDashboardMember(req.user)
  }

  // Get My Ekskul
  @Get('/ekskul')
  @UseGuards(AuthGuard)
  getMyEkskul(
    @Request() req
  ) {
    return this.memberService.getMyEkskul(req.user)
  }

  // Get My Ekskul Detail
  @Get('/ekskul/:ekskul_id')
  @UseGuards(AuthGuard)
  getMyEkskulDetail(
    @Request() req,
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string
  ){
    return this.memberService.getMyEkskulDetail(req.user, Number(ekskul_id))
  }
}
