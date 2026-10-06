import { Controller } from '@nestjs/common';
import { RuangService } from './ruang.service';

@Controller('ruang')
export class RuangController {
  constructor(private readonly ruangService: RuangService) {}
}
