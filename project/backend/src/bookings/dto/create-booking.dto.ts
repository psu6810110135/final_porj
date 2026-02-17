export class CreateBookingDto {}
import {
  IsString,
  IsDateString,
  IsInt,
  Min,
  IsObject,
  IsEmail,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ContactInfoDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;
}

export class CreateBookingDto {
  @IsString()
  tourId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  @Min(1)
  numberOfTravelers: number;

  @IsObject()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo: ContactInfoDto;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}
