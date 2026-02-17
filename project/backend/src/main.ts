import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // --- เพิ่มบรรทัดปลดล็อก CORS ตรงนี้ครับ ---
  app.enableCors({
    origin: 'http://localhost:5173', // พอร์ตของ Vite/React
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    credentials: true,
  });
  // --------------------------------------

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Environment: ${configService.get('NODE_ENV') || 'development'}`);
}
bootstrap();