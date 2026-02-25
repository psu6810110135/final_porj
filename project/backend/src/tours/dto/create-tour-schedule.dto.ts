import {
  IsDateString,
  IsBoolean,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateTourScheduleDto {
  @IsDateString()
  available_date!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_capacity_override?: number;

  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}
