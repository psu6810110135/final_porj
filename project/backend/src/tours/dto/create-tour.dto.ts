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
import { Type } from 'class-transformer';
import { TourRegion, TourCategory } from '../entities/tour.entity';

// ✨ เพิ่ม Class สำหรับตรวจสอบข้อมูลใน Itinerary Array
class ItineraryItemDto {
  @IsString()
  @IsNotEmpty()
  time!: string;

  @IsString()
  @IsNotEmpty()
  detail!: string;
}

// ✨ เพิ่ม Class สำหรับกำหนด Schedule (วันเปิดทัวร์)
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
  @IsOptional()
  description?: string;

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

  // ✨ เพิ่ม: จำนวนคนสูงสุด
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

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  highlights?: string[];

  // ✨ เพิ่ม: รายการการเตรียมตัว
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preparation?: string[];

  @IsString()
  @IsOptional()
  itinerary?: string; // ข้อความยาวแบบเดิม

  // ✨ เพิ่ม: แผนการเดินทางแบบ JSON (Array ของวัตถุ)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryItemDto)
  @IsOptional()
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

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  // ✨ เพิ่ม: กำหนดวันเปิดทัวร์พร้อมจำนวนที่นั่งแต่ละวัน
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDto)
  @IsOptional()
  schedules?: ScheduleDto[];
}
