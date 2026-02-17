import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Booking } from '../bookings/entities/booking.entity'; //
import { Payment } from '../payments/entities/payment.entity'; //
import { Tour } from '../tours/entities/tour.entity'; //

@Module({
  imports: [
    // ต้องมีบรรทัดนี้เพื่อให้ AdminService เรียกใช้ Repository ได้
    TypeOrmModule.forFeature([Booking, Payment, Tour]) 
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}