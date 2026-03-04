import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create({
      ...userData,
      role: userData.role || UserRole.USER,
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

  // ── สร้าง user พร้อม profile ในคราวเดียว ──
  async createUserWithProfile(
    userData: Partial<User>,
    profileData?: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;   // ไม่รับ null — frontend ส่ง undefined แทนได้
    },
  ): Promise<User> {
    // สร้าง profile entity ก่อน (ถ้ามีข้อมูลส่งมา)
    let profile: UserProfile | undefined;
    if (profileData) {
      profile = this.usersRepository.manager.create(UserProfile, {
        ...(profileData.firstName                        && { firstName:   profileData.firstName }),
        ...(profileData.lastName                         && { lastName:    profileData.lastName }),
        ...(profileData.phoneNumber != null              && { phoneNumber: profileData.phoneNumber }),
      });
    }

    const user = this.usersRepository.create({
      ...userData,
      role: userData.role || UserRole.USER,
      ...(profile !== undefined && { profile }),
    });

    try {
      // ต้องมี cascade: true ที่ @OneToOne profile ใน User entity
      // ถ้ายังไม่มีให้เพิ่ม: @OneToOne(() => UserProfile, { cascade: true, eager: true })
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

  create(createUserDto: CreateUserDto) { return 'This action adds a new user'; }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['profile'] });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id }, relations: ['profile'] });
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id }, relations: ['profile'] });

    if (!user) throw new NotFoundException(`ไม่พบผู้ใช้งานไอดี #${id} ครับ`);

    if (updateUserDto.email     !== undefined) user.email     = updateUserDto.email;
    if (updateUserDto.role      !== undefined) user.role      = updateUserDto.role;
    if (updateUserDto.is_active !== undefined) user.is_active = updateUserDto.is_active;
    if (updateUserDto.full_name !== undefined) user.full_name = updateUserDto.full_name;

    if (updateUserDto.phone !== undefined) {
      if (!user.profile) {
        user.profile = this.usersRepository.manager.create(UserProfile, {});
      }
      user.profile.phoneNumber = updateUserDto.phone;
    }

    return this.usersRepository.save(user);
  }

  remove(id: string) { return `This action removes a #${id} user`; }
}