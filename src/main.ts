import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParse from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: ['http://localhost:5173'], credentials: true });
  app.setGlobalPrefix('api/v1');
  app.use(cookieParse());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
