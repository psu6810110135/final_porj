import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, UserRole } from './entities/user.entity';

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  createdAt: Date;
  phone: string | null;
  avatarUrl: string | null;
}

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

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async getCurrentUserProfile(id: string): Promise<UserProfileResponse> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`ไม่พบผู้ใช้งานไอดี #${id} ครับ`);
    }

    return this.toProfileResponse(user);
  }

  async updateAvatar(
    id: string,
    avatarUrl: string,
  ): Promise<UserProfileResponse> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`ไม่พบผู้ใช้งานไอดี #${id} ครับ`);
    }

    user.avatar_url = avatarUrl;
    const updated = await this.usersRepository.save(user);
    return this.toProfileResponse(updated);
  }

  async updateCurrentUserProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfileResponse> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`ไม่พบผู้ใช้งานไอดี #${id} ครับ`);
    }

    if (updateProfileDto.first_name !== undefined) {
      user.first_name = updateProfileDto.first_name.trim();
    }

    if (updateProfileDto.last_name !== undefined) {
      user.last_name = updateProfileDto.last_name.trim();
    }

    if (updateProfileDto.phone !== undefined) {
      user.phone = updateProfileDto.phone.trim();
    }

    const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
    user.full_name = fullName;

    const updated = await this.usersRepository.save(user);
    return this.toProfileResponse(updated);
  }

  // ✨ Fixed property mapping to match your entities
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`ไม่พบผู้ใช้งานไอดี #${id} ครับ`);
    }

    // Update fields that belong directly to the User entity
    if (updateUserDto.email !== undefined) user.email = updateUserDto.email;
    if (updateUserDto.username !== undefined)
      user.username = updateUserDto.username;
    if (updateUserDto.password !== undefined)
      user.password = updateUserDto.password;
    if (updateUserDto.role !== undefined) user.role = updateUserDto.role;
    if (updateUserDto.is_active !== undefined)
      user.is_active = updateUserDto.is_active;

    if (updateUserDto.full_name !== undefined)
      user.full_name = updateUserDto.full_name;
    if (updateUserDto.first_name !== undefined)
      user.first_name = updateUserDto.first_name;
    if (updateUserDto.last_name !== undefined)
      user.last_name = updateUserDto.last_name;
    if (updateUserDto.phone !== undefined) user.phone = updateUserDto.phone;

    if (
      (updateUserDto.first_name === undefined ||
        updateUserDto.last_name === undefined) &&
      user.full_name
    ) {
      const [derivedFirstName, derivedLastName] = this.splitFullName(
        user.full_name,
      );
      if (
        updateUserDto.first_name === undefined &&
        !user.first_name &&
        derivedFirstName
      ) {
        user.first_name = derivedFirstName;
      }
      if (
        updateUserDto.last_name === undefined &&
        !user.last_name &&
        derivedLastName
      ) {
        user.last_name = derivedLastName;
      }
    }

    return this.usersRepository.save(user);
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }

  private splitFullName(
    fullName?: string | null,
  ): [string | null, string | null] {
    if (!fullName) return [null, null];

    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return [null, null];
    if (parts.length === 1) return [parts[0], null];

    const [firstName, ...rest] = parts;
    return [firstName, rest.join(' ') || null];
  }

  private toProfileResponse(user: User): UserProfileResponse {
    const [derivedFirstName, derivedLastName] = this.splitFullName(
      user.full_name,
    );

    return {
      id: user.id,
      email: user.email ?? user.username,
      firstName: user.first_name ?? derivedFirstName,
      lastName: user.last_name ?? derivedLastName,
      role: user.role,
      createdAt: user.created_at,
      phone: user.phone ?? null,
      avatarUrl: user.avatar_url ?? null,
    };
  }
}
