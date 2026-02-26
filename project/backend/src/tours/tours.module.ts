import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';
import { Tour } from './entities/tour.entity';
import { TourSchedule } from './entities/tour-schedule.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { TourSchedulesService } from './tour-schedules.service';
import { TourSchedulesController } from './tour-schedules.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tour, TourSchedule, Booking])],
  controllers: [ToursController, TourSchedulesController],
  providers: [ToursService, TourSchedulesService],
  exports: [ToursService, TourSchedulesService],
})
export class ToursModule {}
