import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ToursModule } from './tours/tours.module';
import { AdminModule } from './admin/admin.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';

import { User } from './users/entities/user.entity';
import { Booking } from './bookings/entities/booking.entity';
import { Payment } from './payments/entities/payment.entity';
import { Tour } from './tours/entities/tour.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [User, Booking, Payment, Tour],
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    // FIX: Register the repositories so AppService can use them
    TypeOrmModule.forFeature([Booking, Payment, Tour]), 
    
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