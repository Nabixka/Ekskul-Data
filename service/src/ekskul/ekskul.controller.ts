import { Controller, Param, Post, Request } from '@nestjs/common';
import { EkskulService } from './ekskul.service';
import { ValidateEkskulExist } from 'src/Pipe/validateEkskulExist';

@Controller('ekskul')
export class EkskulController {
  constructor(private readonly ekskulService: EkskulService) {}

  @Post('/:ekskul_id/join')
  joinEkskul(
    @Request() req,
    @Param('ekskul_id', ValidateEkskulExist) ekskul_id: string
  ){
    return this.ekskulService.joinEkskul(req.user, Number(ekskul_id))
  }

}
