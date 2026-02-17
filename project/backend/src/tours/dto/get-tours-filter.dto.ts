import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { TourRegion } from '../entities/tour.entity';

export class GetToursFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TourRegion)
  region?: TourRegion; // กรองภาค (North, South...)

  @IsOptional()
  @IsString()
  duration?: string; // กรองระยะเวลา (รับเป็น String ไปก่อนเพื่อให้ง่ายกับ Checkbox)

  @IsOptional()
  @IsString()
  category?: string; // กรองประเภท (ทะเล, ภูเขา)

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;
  
  // วันที่เดินทาง (Frontend ส่งมา แต่ Backend อาจจะยังไม่ใช้กรองจริงจังในเฟสแรก 
  // หรือใช้เช็คกับตารางรอบทัวร์ ถ้ามี)
  @IsOptional()
  @IsString()
  travelDate?: string; 
}