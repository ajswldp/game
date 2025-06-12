import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('/home/ec2-user/certs/privkey.pem'),
    cert: fs.readFileSync('/home/ec2-user/certs/fullchain.pem'),
  };
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 값 자동 제거
      forbidNonWhitelisted: true, // DTO에 없는 값 있으면 에러
      transform: true, // string → number 같은 변환 자동으로
    }),
  );
  app.enableCors({
    origin: true, // 모든 origin 허용
    methods: '*', // 모든 HTTP 메서드 허용
    allowedHeaders: '*', // 모든 헤더 허용
    credentials: true, // 필요한 경우 함께 사용, 아니면 생략
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
