import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { UserRole } from './users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const userService = app.get(UsersService);

  // 1. ตั้งค่า Global Pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 2. เปิดใช้งาน CORS (ต้องทำก่อน app.listen)
  app.enableCors();

  // 3. กำหนด Port และเริ่มรัน Server (เหลือที่เดียวพอครับ)
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Environment: ${configService.get('NODE_ENV') || 'development'}`);
}
bootstrap();
