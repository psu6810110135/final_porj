// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // ฟังก์ชันสมัครสมาชิก
  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    // สั่งเซฟลง DB ตรงนี้
    return { message: 'Register Success', user: data.username };
  }

  // ฟังก์ชันตรวจสอบ User ตอน Login
  async validateUser(username: string, pass: string) {
    // 1. หา User ใน DB
    // 2. เทียบ Password ด้วย bcrypt.compare()
    return { id: 1, username: username }; // คืนค่าถ้าผ่าน
  }
}