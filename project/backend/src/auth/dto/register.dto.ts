// src/auth/dto/register.dto.ts
export class RegisterDto {
  username: string; // ตรงตามหน้า Register
  password: string;
  confirmPassword: string; // เอาไว้เช็กที่ Frontend หรือ Backend ก็ได้
}