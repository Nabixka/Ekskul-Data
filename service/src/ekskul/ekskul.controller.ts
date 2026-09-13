import { Controller } from '@nestjs/common';
import { EkskulService } from './ekskul.service';

@Controller('ekskul')
export class EkskulController {
  constructor(private readonly ekskulService: EkskulService) {}
}
