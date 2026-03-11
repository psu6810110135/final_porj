import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { UserRole } from './users/entities/user.entity';
import { StorageService } from './common/storage/storage.service';
import * as bcrypt from 'bcrypt';

import { NestExpressApplication } from '@nestjs/platform-express';

const getAllowedOrigins = (configService: ConfigService) => {
  const rawOrigins = [
    configService.get<string>('FRONTEND_URL'),
    configService.get<string>('FRONTEND_URLS'),
  ]
    .filter(Boolean)
    .flatMap((value) => value!.split(','))
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(new Set([...rawOrigins, 'http://localhost:5173']));
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const usersService = app.get(UsersService);
  const storageService = app.get(StorageService);
  const allowedOrigins = getAllowedOrigins(configService);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  if (storageService.usesLocalUploads()) {
    app.useStaticAssets(storageService.getLocalUploadsRoot(), {
      prefix: '/uploads/',
    });
  }

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

  const port = Number(
    configService.get<string>('PORT') ?? process.env.PORT ?? 3000,
  );
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port ${port}`);
}
bootstrap();
