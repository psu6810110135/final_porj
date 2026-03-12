// src/auth/dto/auth-credentials.dto.ts
import { IsString, MinLength, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @MinLength(4)
  username: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  // ── fields เพิ่มเติมสำหรับ signup (optional เพราะ signin ไม่ส่งมา) ──
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  full_name?: string;

  @IsOptional()
  profile?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;   // undefined แทน null
  };
}