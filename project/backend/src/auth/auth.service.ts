// src/auth/auth.service.ts
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
    let user = await this.usersService.findOne(email);

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10);
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await this.usersService.createUser({
        username: email,
        email: email,
        password: hashedPassword,
        full_name: `${firstName} ${lastName}`,
      });
    }

    const payload = { username: user.username, role: user.role, sub: user.id };
    const accessToken = await this.jwtService.sign(payload);
    return { accessToken };
  }

  // ── signUp: รับ fields ครบจาก frontend ──
  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password, email, full_name, profile } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.usersService.createUserWithProfile(
      {
        username,
        password: hashedPassword,
        ...(email     && { email }),
        ...(full_name && { full_name }),
      },
      profile,
    );
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto;

    const user = await this.usersService.findOne(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { username, role: user.role, sub: user.id };
      const accessToken = await this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }
}