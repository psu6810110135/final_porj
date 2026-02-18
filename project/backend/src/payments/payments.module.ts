import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import this
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity'; // Import Payment Entity
import { Booking } from '../bookings/entities/booking.entity'; // Import Booking Entity

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Booking]) // Register both entities here
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}