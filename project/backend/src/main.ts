import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { UserRole } from './users/entities/user.entity';
import { StorageService } from './common/storage/storage.service';
import * as bcrypt from 'bcrypt';

import { NestExpressApplication } from '@nestjs/platform-express';

const isTruthy = (value: string | undefined, defaultValue: boolean) => {
  if (value === undefined) {
    return defaultValue;
  }

  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

const readOptional = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

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

  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const shouldSeedAdmin = isTruthy(
    configService.get<string>('SEED_ADMIN_ON_BOOT'),
    !isProduction,
  );
  const shouldUpdateExistingAdmin = isTruthy(
    configService.get<string>('SEED_ADMIN_UPDATE_EXISTING'),
    false,
  );
  const adminUsername =
    readOptional(configService.get<string>('SEED_ADMIN_USERNAME')) ?? 'admin';
  const adminPassword = readOptional(
    configService.get<string>('SEED_ADMIN_PASSWORD'),
  );
  const adminEmail = readOptional(
    configService.get<string>('SEED_ADMIN_EMAIL'),
  );
  const adminFirstName = readOptional(
    configService.get<string>('SEED_ADMIN_FIRST_NAME'),
  );
  const adminLastName = readOptional(
    configService.get<string>('SEED_ADMIN_LAST_NAME'),
  );
  const derivedAdminFullName = [adminFirstName, adminLastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  const adminFullName =
    readOptional(configService.get<string>('SEED_ADMIN_FULL_NAME')) ??
    (derivedAdminFullName || undefined);
  const adminPhone = readOptional(
    configService.get<string>('SEED_ADMIN_PHONE'),
  );
  const adminIsActive = isTruthy(
    configService.get<string>('SEED_ADMIN_IS_ACTIVE'),
    true,
  );

  // Seed admin account based on environment configuration.
  try {
    if (shouldSeedAdmin) {
      const existing = await usersService.findOne(adminUsername);
      const hashedPassword = adminPassword
        ? await bcrypt.hash(adminPassword, 10)
        : undefined;

      if (!existing) {
        if (!hashedPassword) {
          console.warn(
            `Skipped admin seed: SEED_ADMIN_PASSWORD is required to create '${adminUsername}'.`,
          );
        } else {
          await usersService.createUser({
            username: adminUsername,
            password: hashedPassword,
            email: adminEmail,
            first_name: adminFirstName,
            last_name: adminLastName,
            full_name: adminFullName,
            phone: adminPhone,
            role: UserRole.ADMIN,
            is_active: adminIsActive,
            provider: 'local',
          });
          console.log(`Seeded admin account '${adminUsername}'.`);
        }
      } else if (shouldUpdateExistingAdmin) {
        await usersService.update(existing.id, {
          ...(hashedPassword ? { password: hashedPassword } : {}),
          ...(adminEmail ? { email: adminEmail } : {}),
          ...(adminFirstName ? { first_name: adminFirstName } : {}),
          ...(adminLastName ? { last_name: adminLastName } : {}),
          ...(adminFullName ? { full_name: adminFullName } : {}),
          ...(adminPhone ? { phone: adminPhone } : {}),
          role: UserRole.ADMIN,
          is_active: adminIsActive,
        });
        console.log(`Updated admin account '${adminUsername}' from env.`);
      } else {
        await usersService.update(existing.id, {
          role: UserRole.ADMIN,
          is_active: adminIsActive,
        });
        console.log(
          `Admin account '${adminUsername}' exists. Set SEED_ADMIN_UPDATE_EXISTING=true to sync profile/password from env.`,
        );
      }
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
