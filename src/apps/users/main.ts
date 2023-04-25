import { NestFactory } from '@nestjs/core';
import { AppModule } from './infrastructure/nest/modules/app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
