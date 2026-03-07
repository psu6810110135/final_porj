// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/entities/user.entity';

const mockUser = {
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashed_password',
  role: UserRole.USER,
  provider: 'local',
  is_active: true,
  first_name: 'Test',
  last_name: 'User',
  full_name: 'Test User',
  phone: null,
  avatar_url: null,
  resetPasswordOtp: null,
  resetPasswordOtpExpires: null,
  resetPasswordToken: null,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findByUsernameOrEmail: jest.fn(),
            createUser: jest.fn(),
            updateResetData: jest.fn(),
            updatePasswordAndClearToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock_token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findByUsernameOrEmail.mockResolvedValue(null);
      await expect(
        service.signIn({ username: 'nobody', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException for Google account', async () => {
      usersService.findByUsernameOrEmail.mockResolvedValue({
        ...mockUser,
        provider: 'google',
      } as any);
      await expect(
        service.signIn({ username: 'test@example.com', password: 'pass' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return accessToken on valid credentials', async () => {
      const hashed = await bcrypt.hash('correctPass', 10);
      usersService.findByUsernameOrEmail.mockResolvedValue({
        ...mockUser,
        password: hashed,
      } as any);

      const result = await service.signIn({ username: 'testuser', password: 'correctPass' });
      expect(result).toHaveProperty('accessToken');
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      const hashed = await bcrypt.hash('correctPass', 10);
      usersService.findByUsernameOrEmail.mockResolvedValue({
        ...mockUser,
        password: hashed,
      } as any);

      await expect(
        service.signIn({ username: 'testuser', password: 'wrongPass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should throw when email not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(service.forgotPassword('nobody@test.com')).rejects.toThrow();
    });

    it('should throw GOOGLE_ACCOUNT error for google users', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        provider: 'google',
      } as any);
      await expect(service.forgotPassword('test@example.com')).rejects.toThrow('GOOGLE_ACCOUNT');
    });
  });

  describe('verifyOtp', () => {
    it('should throw when OTP is wrong', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        resetPasswordOtp: '123456',
        resetPasswordOtpExpires: new Date(Date.now() + 600000),
      } as any);
      await expect(service.verifyOtp('test@example.com', '000000')).rejects.toThrow('รหัส OTP ไม่ถูกต้อง');
    });

    it('should throw when OTP is expired', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        resetPasswordOtp: '123456',
        resetPasswordOtpExpires: new Date(Date.now() - 1000), // expired
      } as any);
      await expect(service.verifyOtp('test@example.com', '123456')).rejects.toThrow('รหัส OTP หมดอายุแล้ว');
    });

    it('should return resetToken on valid OTP', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        resetPasswordOtp: '123456',
        resetPasswordOtpExpires: new Date(Date.now() + 600000),
      } as any);
      usersService.updateResetData.mockResolvedValue(undefined);

      const result = await service.verifyOtp('test@example.com', '123456');
      expect(result).toHaveProperty('resetToken');
      expect(typeof result.resetToken).toBe('string');
    });
  });
});