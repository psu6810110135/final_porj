import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TourRegion, TourCategory } from '../entities/tour.entity';

export class CreateTourDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsEnum(TourRegion)
  @IsNotEmpty()
  region: TourRegion;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsEnum(TourCategory)
  @IsNotEmpty()
  category: TourCategory;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  child_price?: number;

  // 👇 ADDED @IsOptional() HERE
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

  @IsString()
  @IsOptional()
  itinerary?: string;

  @IsString()
  @IsOptional()
  included?: string;

  @IsString()
  @IsOptional()
  excluded?: string;

  @IsString()
  @IsOptional()
  conditions?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}