import {
  IsString,
  IsDateString,
  IsInt,
  Min,
  IsObject,
  IsEmail,
  IsOptional,
  ValidateNested,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

class ContactInfoDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;
}

export class CreateBookingDto {
  @IsUUID('4')
  tourId!: string;

  @IsUUID('4')
  @IsOptional()
  tourScheduleId?: string;

  @IsDateString()
  @IsOptional()
  travelDate?: string; // one-day

  @IsDateString()
  @IsOptional()
  startDate?: string; // multi-day start

  @IsDateString()
  @IsOptional()
  endDate?: string; // multi-day end

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

  @IsObject()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo!: ContactInfoDto;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsOptional()
  @IsObject()
  selectedOptions?: Record<string, any>;
}
