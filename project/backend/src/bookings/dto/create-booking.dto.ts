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
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class ContactInfoDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;
}

export class CreateBookingDto {
  @IsUUID()
  tourId!: string;

  @IsUUID()
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

  @IsInt()
  @Min(1)
  pax!: number;

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
