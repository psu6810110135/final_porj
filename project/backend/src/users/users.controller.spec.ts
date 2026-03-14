import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { StorageService } from '../common/storage/storage.service';

describe('UsersController', () => {
  let controller: UsersController;
  const usersServiceMock: any = {
    getCurrentUserProfile: jest.fn(),
    updateCurrentUserProfile: jest.fn(),
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
        {
          provide: StorageService,
          useValue: {
            uploadPublicFile: jest.fn(),
          },
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

    expect(usersServiceMock.getCurrentUserProfile).toHaveBeenCalledWith(
      'user-123',
    );
    expect(result).toEqual(expectedProfile);
  });

  it('should update current user profile from users service', async () => {
    const req = { user: { id: 'user-999' } };
    const payload = {
      first_name: 'Jane',
      last_name: 'Doe',
      phone: '0811111111',
    };
    const expectedProfile = {
      id: 'user-999',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'user',
      createdAt: new Date(),
      phone: '0811111111',
      avatarUrl: null,
    };
    usersServiceMock.updateCurrentUserProfile.mockResolvedValue(
      expectedProfile,
    );

    const result = await controller.updateMe(req, payload);

    expect(usersServiceMock.updateCurrentUserProfile).toHaveBeenCalledWith(
      'user-999',
      payload,
    );
    expect(result).toEqual(expectedProfile);
  });
});
