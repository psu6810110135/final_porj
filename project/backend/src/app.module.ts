import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// --- Controllers & Services ---
import { AppController } from './app.controller';
import { AppService } from './app.service';

// --- Modules ---
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module'; // 👈 ดึงมาจาก branch login+register
import { ToursModule } from './tours/tours.module';
import { AdminModule } from './admin/admin.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';

// --- Entities ---
import { User } from './users/entities/user.entity';
import { Booking } from './bookings/entities/booking.entity';
import { Payment } from './payments/entities/payment.entity';
import { Tour } from './tours/entities/tour.entity';
import { ReviewsModule } from './reviews/reviews.module';
import { TicketsModule } from './tickets/tickets.module';
import { StorageModule } from './common/storage/storage.module';

const isTruthy = (value: string | undefined, defaultValue: boolean) => {
  if (value === undefined) {
    return defaultValue;
  }

  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

@Module({
  imports: [
    // 1. โหลด Config จาก .env
    ConfigModule.forRoot({
      isGlobal: true, // ให้ทุก Module เรียกใช้ .env ได้
      envFilePath: '.env',
    }),
    StorageModule,

    // Scheduler for background jobs
    ScheduleModule.forRoot(),

    // 2. ตั้งค่า Database (รวมร่าง)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';
        const databaseSsl = isTruthy(
          configService.get<string>('DATABASE_SSL'),
          isProduction,
        );
        const synchronize = isTruthy(
          configService.get<string>('DB_SYNCHRONIZE'),
          !isProduction,
        );
        const sslOptions = databaseSsl ? { rejectUnauthorized: false } : false;

        return {
          type: 'postgres',
          url:
            configService.get('DATABASE_URL') ||
            'postgresql://thai_tours:thai_tours_password@localhost:5433/thai_tours',
          entities: [User, Booking, Payment, Tour],
          autoLoadEntities: true,
          synchronize,
          ssl: sslOptions,
          extra: databaseSsl ? { ssl: sslOptions } : {},
        };
      },
    }),

    // 3. รวม Modules ทั้งหมดของระบบ
    UsersModule,
    AuthModule,
    ToursModule,
    AdminModule,
    BookingsModule,
    PaymentsModule,
    TypeOrmModule.forFeature([Booking, Payment, Tour]),
    ReviewsModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
