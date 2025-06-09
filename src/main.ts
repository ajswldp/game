import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
  };
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  app.enableCors({
    origin: true,      // 모든 origin 허용
    methods: '*',      // 모든 HTTP 메서드 허용
    allowedHeaders: '*', // 모든 헤더 허용
    credentials: true,   // 필요한 경우 함께 사용, 아니면 생략
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
