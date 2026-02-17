import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile])], // จดทะเบียนตาราง
  providers: [UsersService],
  exports: [UsersService], // *** ส่งออก Service ให้ Auth เอาไปใช้ ***
})
export class UsersModule {}