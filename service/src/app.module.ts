import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { EkskulModule } from './ekskul/ekskul.module';

@Module({
  imports: [UserModule, EkskulModule]
})
export class AppModule {}
