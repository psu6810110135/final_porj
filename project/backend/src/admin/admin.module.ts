import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Tour } from '../tours/entities/tour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Payment, Tour])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}