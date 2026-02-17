import { IsString, IsDateString, IsInt, Min } from 'class-validator';

export class CalculateBookingDto {
  @IsString()
  tourId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  @Min(1)
  numberOfTravelers: number;
}
