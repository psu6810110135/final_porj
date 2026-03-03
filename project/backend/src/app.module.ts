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

@Module({
  imports: [
    // 1. โหลด Config จาก .env
    ConfigModule.forRoot({
      isGlobal: true, // ให้ทุก Module เรียกใช้ .env ได้
      envFilePath: '.env',
    }),

    // Scheduler for background jobs
    ScheduleModule.forRoot(),

    // 2. ตั้งค่า Database (รวมร่าง)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // ✅ ใช้ Port 5433 ตามที่ระบุใน docker-compose.yml
        url: configService.get('DATABASE_URL') || 'postgresql://thai_tours:thai_tours_password@localhost:5433/thai_tours',
        entities: [User, Booking, Payment, Tour],
        autoLoadEntities: true,
        synchronize: true, // เปิดไว้สำหรับ dev
        ssl: false, // 👈 ปิด SSL ตามที่เราแก้กันไปคราวที่แล้ว
        extra: {
          ssl: false,
        },
      }),
    }),

    // 3. รวม Modules ทั้งหมดของระบบ
    UsersModule,
    AuthModule, // 👈 ประกอบร่าง AuthModule เข้ามาแล้ว!
    ToursModule,
    AdminModule,
    BookingsModule,
    PaymentsModule,
    TypeOrmModule.forFeature([Booking, Payment, Tour]),
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}