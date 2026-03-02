import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const usersRepositoryMock = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return current user profile from users table', async () => {
    const user: User = {
      id: 'u-1',
      username: 'alice',
      password: 'hashed',
      email: 'alice@example.com',
      first_name: 'Alice',
      last_name: 'Wong',
      full_name: 'Alice Wong',
      role: UserRole.USER,
      is_active: true,
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      updated_at: new Date('2026-01-02T00:00:00.000Z'),
      phone: '0812345678',
      avatar_url: '/uploads/avatars/alice.jpg',
    };

    repository.findOne.mockResolvedValue(user);

    const result = await service.getCurrentUserProfile('u-1');

    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'u-1' } });
    expect(result).toEqual({
      id: 'u-1',
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'Wong',
      role: UserRole.USER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      phone: '0812345678',
      avatarUrl: '/uploads/avatars/alice.jpg',
    });
  });

  it('should throw when current user profile does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.getCurrentUserProfile('missing')).rejects.toThrow(NotFoundException);
  });
});
