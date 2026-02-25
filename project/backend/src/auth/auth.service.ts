import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async googleLogin(req: any): Promise<{ accessToken: string }> {
    if (!req.user) {
      throw new UnauthorizedException('ไม่พบข้อมูลจาก Google');
    }
    
    const { email, firstName, lastName } = req.user;
    
    // 1. ลองหา User ในระบบ (เพื่อความชัวร์ไม่ซ้ำ เราจะใช้อีเมลเป็น username ไปเลย)
    let user = await this.usersService.findOne(email);

    if (!user) {
      // 2. ถ้าไม่เคยมีไอดี -> สมัครสมาชิกให้ใหม่ทันที!
      // สุ่มรหัสผ่านให้ไปก่อน เพราะเขา Login ผ่าน Google
      const randomPassword = Math.random().toString(36).slice(-10); 
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await this.usersService.createUser({
        username: email, // 👈 ใช้อีเมลเป็น Username
        email: email,
        password: hashedPassword,
        full_name: `${firstName} ${lastName}`, // เอาชื่อ-นามสกุลมาต่อกัน
      });
    }

    // 3. สร้าง Token ส่งกลับไปให้หน้าบ้าน (เหมือนตอน Login ปกติเป๊ะ)
    const payload = { username: user.username, role: user.role, sub: user.id };
    const accessToken = await this.jwtService.sign(payload);

    return { accessToken };
  }
  // สมัครสมาชิก (เหมือนเดิม)
  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;
    
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.usersService.createUser({
      username,
      password: hashedPassword,
    });
  }

  // เข้าสู่ระบบ (จุดที่ต้องแก้!)
  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto;
    
    // 1. หา User จาก Database
    const user = await this.usersService.findOne(username);

    // 2. เช็ครหัสผ่าน
    if (user && (await bcrypt.compare(password, user.password))) {
      
      // 👇👇 จุดสำคัญ: ยัด Role ลงไปใน Payload ตรงนี้ครับ 👇👇
      const payload = { 
        username, 
        role: user.role, // <--- เพิ่มบรรทัดนี้! หน้าบ้านจะได้รู้ว่าเป็น Admin
        sub: user.id     // (แถม) ปกติควรใส่ ID ด้วย
      };
      
      const accessToken = await this.jwtService.sign(payload);
      return { accessToken };

    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }
}