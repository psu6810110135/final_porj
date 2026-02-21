import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. ดูที่ป้ายแปะ (Controller) ว่าห้องนี้ใครเข้าได้บ้าง
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // ถ้าไม่มีป้ายแปะ แปลว่าเข้าได้ทุกคน (ผ่านเลย)
    if (!requiredRoles) {
      return true;
    }

    // 2. ดึงข้อมูล User จาก Request (ที่ผ่าน JWT Guard มาแล้ว)
    const { user } = context.switchToHttp().getRequest();

    // 3. เช็คว่า Role ของ User ตรงกับป้ายไหม?
    return requiredRoles.some((role) => user.role === role);
  }
}