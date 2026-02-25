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
  @IsUUID()
  tourId!: string;

  @IsUUID()
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
