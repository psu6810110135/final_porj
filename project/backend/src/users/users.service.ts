import {
  BadRequestException,
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

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
    private dataSource: DataSource,
  ) { }

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByUsernameOrEmail(identifier: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.username = :id OR user.email = :id', { id: identifier })
      .getOne();
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
  // อัปเดตข้อมูล OTP และ Token
  async updateResetData(id: string | number, data: any) {
    await this.usersRepository.update(id, data);
  }

  // เซฟรหัสผ่านใหม่และล้าง Token ทิ้ง
  async updatePasswordAndClearToken(id: string | number, newHashedPassword: string) {
    await this.usersRepository.update(id, {
      password: newHashedPassword,
      resetPasswordToken: null as any,       // ✅ ต้องเป็น null ไม่ใช่ '' (empty string จะ match token ได้)
      resetPasswordOtp: null as any,          // ✅ ล้าง OTP ด้วย
      resetPasswordOtpExpires: null as any,   // ✅ ล้างเวลา OTP ด้วย
    });
  }
  // ── สร้าง user พร้อม profile fields ในคราวเดียว ──
  async createUserWithProfile(
    userData: Partial<User>,
    profileData?: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
    },
  ): Promise<User> {
    const firstName = profileData?.firstName?.trim() || undefined;
    const lastName = profileData?.lastName?.trim() || undefined;
    const phone = profileData?.phoneNumber?.trim() || undefined;
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || userData.full_name;

    return this.createUser({
      ...userData,
      ...(firstName && { first_name: firstName }),
      ...(lastName && { last_name: lastName }),
      ...(phone && { phone }),
      ...(fullName && { full_name: fullName }),
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const firstName = createUserDto.first_name?.trim();
    const lastName = createUserDto.last_name?.trim();
    const fullName =
      createUserDto.full_name?.trim() ||
      [firstName, lastName].filter(Boolean).join(' ').trim() ||
      undefined;

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.createUser({
      username: createUserDto.username.trim(),
      password: hashedPassword,
      email: createUserDto.email?.trim(),
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      phone: createUserDto.phone?.trim(),
      role: createUserDto.role || UserRole.USER,
      is_active: createUserDto.is_active ?? true,
    });
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();
    return this.enrichUsersWithLegacyData(users);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;

    const [enriched] = await this.enrichUsersWithLegacyData([user]);
    return enriched;
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

    user.full_name = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();

    const updated = await this.usersRepository.save(user);
    return this.toProfileResponse(updated);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`ไม่พบผู้ใช้งานไอดี #${id} ครับ`);
    }

    if (updateUserDto.email !== undefined) user.email = updateUserDto.email;
    if (updateUserDto.username !== undefined) user.username = updateUserDto.username;
    if (updateUserDto.password !== undefined) user.password = updateUserDto.password;
    if (updateUserDto.role !== undefined) user.role = updateUserDto.role;
    if (updateUserDto.is_active !== undefined) user.is_active = updateUserDto.is_active;
    if (updateUserDto.full_name !== undefined) user.full_name = updateUserDto.full_name;
    if (updateUserDto.first_name !== undefined) user.first_name = updateUserDto.first_name;
    if (updateUserDto.last_name !== undefined) user.last_name = updateUserDto.last_name;
    if (updateUserDto.phone !== undefined) user.phone = updateUserDto.phone;

    if (
      updateUserDto.first_name !== undefined ||
      updateUserDto.last_name !== undefined
    ) {
      user.full_name =
        `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
    }

    if (!user.first_name || !user.last_name) {
      const [derivedFirst, derivedLast] = this.splitFullName(user.full_name);
      if (!user.first_name && derivedFirst) user.first_name = derivedFirst;
      if (!user.last_name && derivedLast) user.last_name = derivedLast;
    }

    return this.usersRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`ไม่พบผู้ใช้งานไอดี #${id} ครับ`);
    }

    try {
      await this.usersRepository.remove(user);
      return { success: true, message: 'ลบผู้ใช้งานเรียบร้อยแล้ว' };
    } catch (error) {
      const dbError = error as any;
      if (dbError?.code === '23503') {
        throw new BadRequestException(
          'ไม่สามารถลบผู้ใช้งานนี้ได้ เนื่องจากมีข้อมูลที่อ้างอิงอยู่',
        );
      }
      throw new InternalServerErrorException('ไม่สามารถลบผู้ใช้งานได้');
    }
  }

  // ── Private helpers ──

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

  private async enrichUsersWithLegacyData(users: User[]): Promise<User[]> {
    if (users.length === 0) return users;
    const legacyMap = await this.getLegacyProfilesByUserId();

    return users.map((user) => {
      const legacy = legacyMap.get(user.id);
      if (!user.first_name && legacy?.first_name) user.first_name = legacy.first_name;
      if (!user.last_name && legacy?.last_name) user.last_name = legacy.last_name;
      if (!user.phone && legacy?.phone) user.phone = legacy.phone;
      if (!user.full_name) {
        user.full_name =
          `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
      }
      if (!user.email) user.email = user.username;
      return user;
    });
  }

  private async getLegacyProfilesByUserId(): Promise<
    Map<string, { first_name?: string; last_name?: string; phone?: string }>
  > {
    try {
      const rows: Array<{
        user_id: string;
        first_name: string | null;
        last_name: string | null;
        phone: string | null;
      }> = await this.dataSource.query(`
        SELECT
          u.id          AS user_id,
          up."firstName"   AS first_name,
          up."lastName"    AS last_name,
          up."phoneNumber" AS phone
        FROM users u
        INNER JOIN user_profiles up ON u."profileId" = up.id
      `);

      const map = new Map<
        string,
        { first_name?: string; last_name?: string; phone?: string }
      >();
      for (const row of rows) {
        map.set(row.user_id, {
          first_name: row.first_name ?? undefined,
          last_name: row.last_name ?? undefined,
          phone: row.phone ?? undefined,
        });
      }
      return map;
    } catch {
      return new Map();
    }
  }
}
