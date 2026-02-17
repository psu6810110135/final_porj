import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ToursModule } from './tours/tours.module'; // Import Tours ที่มีอยู่แล้ว
import { User } from './users/entities/user.entity';
import { AdminModule } from './admin/admin.module';
import { Booking } from './bookings/entities/booking.entity';
import { Payment } from './payments/entities/payment.entity';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // ตั้งค่า Database Connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'), // อ่านจาก .env
        entities: [User, Booking, Payment], // ใส่ Entity User ที่เพิ่งสร้าง (และ Tour ด้วยถ้ามี)
        autoLoadEntities: true,
        synchronize: true, // true = auto create table (ใช้เฉพาะ dev mode)
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ToursModule,
    AdminModule,
    BookingsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}