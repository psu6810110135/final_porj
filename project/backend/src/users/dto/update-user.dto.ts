import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // เพิ่มฟิลด์ role เข้าไป
  username?: string;
  password?: string;
  role?: UserRole;
}