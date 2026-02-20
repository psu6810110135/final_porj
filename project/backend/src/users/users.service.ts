import { Injectable, ConflictException, InternalServerErrorException,NotFoundException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  // 👇 ปรับปรุงฟังก์ชันสร้าง User ให้คลีนขึ้น
  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create({
      ...userData,
      role: userData.role || UserRole.USER, // กำหนด role เป็น user ถ้าไม่ได้ส่งมา
    });

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      const dbError = error as any;
      if (dbError.code === '23505') {
        throw new ConflictException('Username already exists');
      }
      console.error(dbError);
      throw new InternalServerErrorException('Error during user creation');
    }
  }

  // ฟังก์ชัน CRUD เดิม (เปลี่ยนชื่อ findOne เป็น findById เพื่อไม่ให้ชนกัน)
  create(createUserDto: CreateUserDto) { return 'This action adds a new user'; }
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['profile'], // ดึงข้อมูล Profile ติดมาด้วย
    });
  }
  async findById(id: string): Promise<User | null> {
  return this.usersRepository.findOne({ 
    where: { id },
    relations: ['profile'] // ดึงข้อมูลโปรไฟล์พ่วงมาด้วย
  });
}
 async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
  // 1. ค้นหา User ก่อนว่ามีตัวตนไหม
  const user = await this.usersRepository.preload({
    id: id,
    ...updateUserDto, // เอาข้อมูลใหม่ไปทับข้อมูลเดิม
  });

  if (!user) {
    throw new NotFoundException(`ไม่พบผู้ใช้งานไอดี #${id} ครับ`);
  }

  // 2. บันทึกค่าใหม่ลง Database
  return this.usersRepository.save(user);
}
  remove(id: string) { return `This action removes a #${id} user`; }
}