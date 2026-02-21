import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { UserRole } from './users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const usersService = app.get(UsersService);

  // 1. Enable CORS (Critical for Frontend connection)
  app.enableCors({
    origin: true, // Allows all origins (simplest for development)
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    credentials: true,
  });

  // 2. Validation Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Seed default admin if missing (username: admin, password: admin1234)
  try {
    const existing = await usersService.findOne('admin');
    const hashed = await bcrypt.hash('admin1234', 10);
    if (!existing) {
      await usersService.createUser({
        username: 'admin',
        password: hashed,
        role: UserRole.ADMIN,
      });
      console.log('Seeded default admin: admin/admin1234');
    } else {
      // Ensure role and password match expected demo credentials
      await usersService.update(existing.id, {
        password: hashed,
        role: UserRole.ADMIN,
      });
      console.log('Updated existing admin credentials to admin1234');
    }
  } catch (err) {
    console.error('Admin seed failed:', err);
  }
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
