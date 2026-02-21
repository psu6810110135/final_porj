import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'YOUR_SECRET_KEY', // ต้องตรงกับ AuthModule
    });
  }

  async validate(payload: { username: string }) {
    const { username } = payload;
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}