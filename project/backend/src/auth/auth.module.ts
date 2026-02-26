import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Import เพื่อนบ้าน
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
@Module({
  imports: [
    UsersModule, // เรียกใช้ความสามารถของ Users
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'YOUR_SECRET_KEY', // ควรเก็บใน .env
      signOptions: { expiresIn: '3d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy,GoogleStrategy],
  exports: [GoogleStrategy, JwtStrategy, PassportModule],
})
export class AuthModule {}