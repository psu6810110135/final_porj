import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking } from './entities/booking.entity';
import { Tour } from '../tours/entities/tour.entity';
import { TourSchedule } from '../tours/entities/tour-schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Tour, TourSchedule])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
