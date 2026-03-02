import {
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
      updateUserDto.first_name !== undefined ||
      updateUserDto.last_name !== undefined
    ) {
      const fullName =
        `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
      user.full_name = fullName;
    }

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

  private async enrichUsersWithLegacyData(users: User[]): Promise<User[]> {
    if (users.length === 0) return users;

    const legacyMap = await this.getLegacyProfilesByUserId();

    return users.map((user) => {
      const legacy = legacyMap.get(user.id);

      if (!user.first_name && legacy?.first_name) {
        user.first_name = legacy.first_name;
      }

      if (!user.last_name && legacy?.last_name) {
        user.last_name = legacy.last_name;
      }

      if (!user.phone && legacy?.phone) {
        user.phone = legacy.phone;
      }

      if (!user.full_name) {
        const fullName =
          `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
        user.full_name = fullName;
      }

      if (!user.email) {
        user.email = user.username;
      }

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
          u.id AS user_id,
          up."firstName" AS first_name,
          up."lastName" AS last_name,
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
