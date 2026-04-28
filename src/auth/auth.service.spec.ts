import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { User } from '@idemos/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn(),
}));

const mockUser: User = {
  id: 'uuid-1',
  name: 'Test User',
  email: 'test@example.com',
  passwordHash: 'hashed',
  createdAt: new Date(),
  lastLoginAt: null,
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let localStrategy: jest.Mocked<LocalStrategy>;
  let jwtStrategy: jest.Mocked<JwtStrategy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateLastLogin: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('signed.jwt.token') },
        },
        {
          provide: LocalStrategy,
          useValue: { validate: jest.fn() },
        },
        {
          provide: JwtStrategy,
          useValue: { validate: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    localStrategy = module.get(LocalStrategy);
    jwtStrategy = module.get(JwtStrategy);
  });

  describe('register', () => {
    it('throws RpcException 409 when email already registered', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          name: 'Test',
          email: 'test@example.com',
          password: 'pass12345',
        }),
      ).rejects.toThrow(RpcException);
    });

    it('creates user and returns token pair', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        name: 'Test',
        email: 'new@example.com',
        password: 'pass12345',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@example.com' }),
      );
      expect(result).toEqual({
        accessToken: 'signed.jwt.token',
        refreshToken: 'signed.jwt.token',
      });
    });
  });

  describe('login', () => {
    it('validates credentials, updates last login, and returns token pair', async () => {
      localStrategy.validate.mockResolvedValue(mockUser);
      usersService.updateLastLogin.mockResolvedValue(undefined);

      const result = await service.login({
        email: 'test@example.com',
        password: 'pass12345',
      });

      expect(localStrategy.validate).toHaveBeenCalledWith(
        'test@example.com',
        'pass12345',
      );
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        accessToken: 'signed.jwt.token',
        refreshToken: 'signed.jwt.token',
      });
    });
  });

  describe('refresh', () => {
    it('throws RpcException 401 when user not found after token validation', async () => {
      jwtStrategy.validate.mockReturnValue({
        sub: 'uuid-999',
        email: 'x@x.com',
      });
      usersService.findById.mockResolvedValue(null);

      await expect(
        service.refresh({ refreshToken: 'some.token' }),
      ).rejects.toThrow(RpcException);
    });

    it('returns new token pair when token is valid and user exists', async () => {
      jwtStrategy.validate.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
      });
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.refresh({ refreshToken: 'valid.token' });

      expect(usersService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        accessToken: 'signed.jwt.token',
        refreshToken: 'signed.jwt.token',
      });
    });
  });
});
