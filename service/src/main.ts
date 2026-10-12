import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { config as loadEnv } from 'dotenv';

async function bootstrap() {
  loadEnv({ path: join(__dirname, '..', '.env') });
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
      prefix: '/uploads/'
  })
  app.enableCors()
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
