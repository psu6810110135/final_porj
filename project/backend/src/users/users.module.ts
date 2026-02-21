import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile])], // จดทะเบียนตาราง (จากฝั่ง login+register)
  controllers: [UsersController], // เก็บ Controller ไว้ (จากฝั่ง HEAD)
  providers: [UsersService],
  exports: [UsersService], // *** ส่งออก Service ให้ Auth เอาไปใช้ *** (จากฝั่ง login+register)
})
export class UsersModule {}