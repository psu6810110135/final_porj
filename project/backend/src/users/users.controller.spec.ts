import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const usersServiceMock: any = {
    getCurrentUserProfile: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateAvatar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should fetch current user profile from users service', async () => {
    const req = { user: { id: 'user-123' } };
    const expectedProfile = {
      id: 'user-123',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      createdAt: new Date(),
      phone: null,
      avatarUrl: null,
    };
    usersServiceMock.getCurrentUserProfile.mockResolvedValue(expectedProfile);

    const result = await controller.getMe(req);

    expect(usersServiceMock.getCurrentUserProfile).toHaveBeenCalledWith('user-123');
    expect(result).toEqual(expectedProfile);
  });
});
