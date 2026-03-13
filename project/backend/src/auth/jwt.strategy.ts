import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: (() => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
          throw new Error('JWT_SECRET is not configured');
        }
        return jwtSecret;
      })(),
    });
  }

  async validate(payload: { sub: string; username: string; email?: string; role?: string }) {
    // ใช้ sub (user id) เป็นหลักในการค้นหา user — ไม่ใช้ username เพราะอาจเป็น email ที่ user กรอกตอน login
    const user = await this.usersService.findByIdLite(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }
    if (user.is_active === false) {
      throw new UnauthorizedException('บัญชีนี้ถูกระงับการใช้งาน');
    }
    return user;
  }
}
