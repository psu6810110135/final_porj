import { IsEnum } from 'class-validator';
import { BookingStatus } from '../../bookings/entities/booking.entity';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status!: BookingStatus;
}
