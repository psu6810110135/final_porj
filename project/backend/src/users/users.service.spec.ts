import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
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

  const dataSourceMock = {
    query: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepositoryMock,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
    dataSourceMock.query.mockResolvedValue([]);
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

    await expect(service.getCurrentUserProfile('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update current user profile first name last name and phone', async () => {
    const existingUser: User = {
      id: 'u-2',
      username: 'bob',
      password: 'hashed',
      email: 'bob@example.com',
      first_name: 'Bob',
      last_name: 'Old',
      full_name: 'Bob Old',
      role: UserRole.USER,
      is_active: true,
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      updated_at: new Date('2026-01-02T00:00:00.000Z'),
      phone: '0800000000',
      avatar_url: null as any,
    };

    const savedUser: User = {
      ...existingUser,
      first_name: 'Robert',
      last_name: 'Lee',
      phone: '0899999999',
      full_name: 'Robert Lee',
    };

    repository.findOne.mockResolvedValue(existingUser);
    repository.save.mockResolvedValue(savedUser as any);

    const result = await service.updateCurrentUserProfile('u-2', {
      first_name: 'Robert',
      last_name: 'Lee',
      phone: '0899999999',
    });

    expect(repository.save).toHaveBeenCalled();
    expect(result.firstName).toBe('Robert');
    expect(result.lastName).toBe('Lee');
    expect(result.phone).toBe('0899999999');
  });
});
