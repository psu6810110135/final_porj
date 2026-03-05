import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateReviewByAdminDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsBoolean()
  is_recommended?: boolean;
}
