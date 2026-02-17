import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TourCategory, TourRegion } from '../entities/tour.entity'; // เช็ค Path ให้ถูก

export class GetToursFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  province?: string;  // ✅ ตัวนี้ที่ Error อยู่

  @IsOptional()
  @IsEnum(TourRegion)
  region?: TourRegion;

  @IsOptional()
  @IsEnum(TourCategory) // ถ้ายังไม่ได้ทำ Enum ให้เปลี่ยนเป็น @IsString() category?: string; ไปก่อน
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
  sort?: 'ASC' | 'DESC'; // ✅ ตัวนี้ที่ Error อยู่
}