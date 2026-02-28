import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDateString,
  IsInt,
} from 'class-validator';
import { Type, Transform } from 'class-transformer'; // ✨ Added Transform
import { TourRegion, TourCategory } from '../entities/tour.entity';

class ItineraryItemDto {
  @IsString()
  @IsNotEmpty()
  time!: string;

  @IsString()
  @IsNotEmpty()
  detail!: string;
}

class ScheduleDto {
  @IsDateString()
  date!: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;
}

export class CreateTourDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @IsString()
  @IsNotEmpty()
  province!: string;

  @IsEnum(TourRegion)
  @IsNotEmpty()
  region!: TourRegion;

  @IsString()
  @IsNotEmpty()
  duration!: string;

  @IsEnum(TourCategory)
  @IsNotEmpty()
  category!: TourCategory;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  max_group_size?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  child_price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  rating?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  review_count?: number;

  @IsString()
  @IsOptional()
  image_cover?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  // ✨ Transform single strings into arrays if necessary
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  })
  highlights?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  })
  preparation?: string[];

  @IsString()
  @IsOptional()
  itinerary?: string;

  // ✨ Parse JSON string from FormData back into an Array of Objects
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryItemDto)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch (e) { return value; }
    }
    return value;
  })
  itinerary_data?: ItineraryItemDto[];

  @IsString()
  @IsOptional()
  included?: string;

  @IsString()
  @IsOptional()
  excluded?: string;

  @IsString()
  @IsOptional()
  conditions?: string;

  // ✨ Convert FormData string "true"/"false" to actual boolean
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  is_active?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  is_recommended?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDto)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch (e) { return value; }
    }
    return value;
  })
  schedules?: ScheduleDto[];
}