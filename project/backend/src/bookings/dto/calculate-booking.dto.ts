import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  IsObject,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CalculateBookingDto {
  @IsUUID('4')
  tourId!: string;

  @IsUUID('4')
  tourScheduleId!: string;

  @Transform(({ value, obj }) =>
    value === undefined ? obj?.numberOfTravelers : value,
  )
  @Type(() => Number)
  @ValidateIf((o) => o.pax !== undefined || o.numberOfTravelers === undefined)
  @IsInt()
  @Min(1)
  pax?: number;

  @Type(() => Number)
  @ValidateIf((o) => o.numberOfTravelers !== undefined || o.pax === undefined)
  @IsInt()
  @Min(1)
  numberOfTravelers?: number; // legacy alias for tests

  @IsOptional()
  @IsObject()
  selectedOptions?: Record<string, any>;
}
