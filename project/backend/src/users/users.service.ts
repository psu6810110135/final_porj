import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 1. แก้ Return Type เป็น User | null
  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    // สร้าง User พร้อม Profile ว่างๆ
    const user = this.usersRepository.create({
      ...userData,
      profile: new UserProfile(), 
    });

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      // 2. แก้เรื่อง type ของ error (แปลงเป็น any ก่อนเพื่อดึง code)
      const dbError = error as any;
      
      if (dbError.code === '23505' || dbError.errno === 1062) {
        throw new ConflictException('Username already exists');
      } else {
        console.error(dbError); // ควร log error จริงไว้ดูด้วยเผื่อเป็นเรื่องอื่น
        throw new InternalServerErrorException();
      }
    }
  }
}