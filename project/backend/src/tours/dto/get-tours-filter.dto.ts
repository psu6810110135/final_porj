import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TourCategory, TourRegion } from '../entities/tour.entity';

export class GetToursFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsEnum(TourRegion)
  region?: TourRegion;

  @IsOptional()
  @IsEnum(TourCategory)
  category?: TourCategory;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  sort?: 'ASC' | 'DESC';

  // 👇 ADD THIS FIELD
  @IsOptional()
  @IsString()
  show_all?: string; // Pass 'true' to see inactive tours
}