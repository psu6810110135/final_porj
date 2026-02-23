import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  IsObject,
} from 'class-validator';

export class CalculateBookingDto {
  @IsUUID()
  tourId!: string;

  @IsUUID()
  @IsOptional()
  tourScheduleId?: string;

  @IsDateString()
  @IsOptional()
  travelDate?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @Min(1)
  pax!: number;

  @IsOptional()
  @IsObject()
  selectedOptions?: Record<string, any>;
}
