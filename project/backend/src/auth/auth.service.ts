// src/auth/auth.service.ts
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async googleLogin(req: any): Promise<{ accessToken: string } | { conflict: true }> {
    if (!req.user) {
      throw new UnauthorizedException('ไม่พบข้อมูลจาก Google');
    }

    const { email, firstName, lastName } = req.user;

    // ค้นหาด้วย email column โดยตรง (ไม่ใช่ username)
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // ยังไม่มีบัญชี → สร้างใหม่เป็น google account
      const randomPassword = Math.random().toString(36).slice(-10);
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await this.usersService.createUser({
        username: email,
        email: email,
        password: hashedPassword,
        provider: 'google',
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
      });
    } else if (user.provider === 'local') {
      // ❌ มีบัญชีปกติอยู่แล้ว → แจ้งเตือน conflict ห้าม overwrite provider
      return { conflict: true };
    }
    // provider === 'google' → login ปกติ ไม่ต้องทำอะไรเพิ่ม

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email || user.username,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    // ✅ รับครบทุก field ที่ frontend ส่งมา
    const { username, password, email, full_name, profile } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.usersService.createUserWithProfile(
      {
        username,
        password: hashedPassword,
        ...(email && { email }),
        ...(full_name && { full_name }),
      },
      profile,  // ✅ ส่ง profile { firstName, lastName, phoneNumber } ต่อให้ usersService
    );
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    const { username, password, rememberMe } = authCredentialsDto;

    // ค้นหาด้วย username หรือ email ก็ได้
    const user = await this.usersService.findByUsernameOrEmail(username);

    if (!user) {
      throw new UnauthorizedException('Please check your login credentials');
    }

    // ถ้า user ลงทะเบียนผ่าน Google → ห้าม login ด้วย password
    if (user.provider === 'google') {
      throw new BadRequestException('GOOGLE_ACCOUNT');
    }

    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        sub: user.id,
        username: user.username,
        email: user.email || user.username,
        role: user.role,
      };
      const accessToken = rememberMe 
        ? this.jwtService.sign(payload, { expiresIn: '30d' }) 
        : this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 1. ฟังก์ชันส่ง OTP ไปที่อีเมล
  async forgotPassword(email: string) {
    // ค้นหาด้วย email column โดยตรง (รองรับทั้ง manual user และ Gmail user)
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new Error('ไม่พบอีเมลนี้ในระบบ');
    }

    // Gmail user ไม่มีรหัสผ่านในระบบ — ให้ใช้ Google Login แทน
    if (user.provider === 'google') {
      throw new Error('GOOGLE_ACCOUNT');
    }

    // สร้าง OTP 6 หลัก และตั้งเวลาหมดอายุ 10 นาที
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);

    await this.usersService.updateResetData(user.id, {
      resetPasswordOtp: otp,
      resetPasswordOtpExpires: expires,
      resetPasswordToken: null,
    });

    await this.transporter.sendMail({
      from: `"Thai Tour Service Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'รหัส OTP สำหรับตั้งรหัสผ่านใหม่ 🔐',
      html: `<h2>รหัส OTP ของคุณคือ: <b>${otp}</b></h2><p>รหัสนี้จะหมดอายุในอีก 10 นาทีครับ</p>`,
    });

    return { message: 'ส่ง OTP สำเร็จ' };
  }

  // 2. ฟังก์ชันตรวจสอบรหัส OTP
  async verifyOtp(email: string, otp: string) {
    // ต้องใช้ findByEmail เหมือน forgotPassword เพื่อให้ค้นหา user เจอตัวเดียวกัน
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new Error('ไม่พบผู้ใช้งาน');

    if (user.resetPasswordOtp !== otp) {
      throw new Error('รหัส OTP ไม่ถูกต้อง');
    }

    if (user.resetPasswordOtpExpires < new Date()) {
      throw new Error('รหัส OTP หมดอายุแล้ว');
    }

    // ถ้า OTP ถูกต้อง สร้าง Token ลับส่งกลับไปให้หน้าบ้าน
    const resetToken = crypto.randomBytes(32).toString('hex');

    await this.usersService.updateResetData(user.id, {
      resetPasswordOtp: null, // ล้าง OTP ทิ้ง
      resetPasswordOtpExpires: null,
      resetPasswordToken: resetToken, // เซฟ Token แทน
    });

    return { resetToken };
  }

  // 3. ฟังก์ชันบันทึกรหัสผ่านใหม่
  async resetPasswordWithToken(email: string, resetToken: string, newPassword: string) {
    // ต้องใช้ findByEmail เช่นกัน ไม่เช่นนั้นหา user ไม่เจอเพราะค้นด้วย username
    const user = await this.usersService.findByEmail(email);

    // ✅ ป้องกัน: token ต้องมีค่า, user ต้องมี token, และต้องตรงกัน
    if (!user || !resetToken || !user.resetPasswordToken || user.resetPasswordToken !== resetToken) {
      throw new Error('Token ไม่ถูกต้องหรือหมดอายุ');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.usersService.updatePasswordAndClearToken(user.id, hashedPassword);

    return { message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
  }
}