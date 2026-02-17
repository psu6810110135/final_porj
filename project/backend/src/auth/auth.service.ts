import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService, // เรียกใช้ Service ของ Users
    private jwtService: JwtService,
  ) {}

  // สมัครสมาชิก
  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;
    
    // Hash รหัสผ่านที่นี่
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // ส่งข้อมูลที่ Hash แล้วไปให้ UsersService บันทึก
    await this.usersService.createUser({
      username,
      password: hashedPassword,
    });
  }

  // เข้าสู่ระบบ
  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto;
    
    // ถาม UsersService ว่ามีคนนี้ไหม
    const user = await this.usersService.findOne(username);

    // เช็ครหัสผ่าน
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { username };
      const accessToken = await this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }
}