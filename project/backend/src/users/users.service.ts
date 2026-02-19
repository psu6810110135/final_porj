import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // ==========================================
  // 🟢 ส่วนของระบบ Auth (จาก branch login+register)
  // ==========================================

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
      const dbError = error as any;
      
      if (dbError.code === '23505' || dbError.errno === 1062) {
        throw new ConflictException('Username already exists');
      } else {
        console.error(dbError); 
        throw new InternalServerErrorException();
      }
    }
  }

  // ==========================================
  // 🟡 ส่วนโครงร่างเดิม (จาก branch dev) 
  // เก็บไว้เผื่อ UsersController เรียกใช้ จะได้ไม่ Error
  // ==========================================

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  // 💡 เปลี่ยนชื่อจาก findOne เป็น findById เพื่อไม่ให้ชนกับ findOne(username) ด้านบน
  findById(id: string) {
    return `This action returns a #${id} user`;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}