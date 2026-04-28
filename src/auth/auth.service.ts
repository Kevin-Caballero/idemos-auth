import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload, JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly localStrategy: LocalStrategy,
    private readonly jwtStrategy: JwtStrategy,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    this.logger.log(`[register] checking existing user email=${dto.email}`);
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      this.logger.warn(`[register] email already registered: ${dto.email}`);
      throw new RpcException({
        statusCode: 409,
        message: 'El correo ya está registrado.',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });
    this.logger.log(
      `[register] user created id=${user.id} email=${user.email}`,
    );
    return this.generateTokens({ sub: user.id, email: user.email });
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    this.logger.log(`[login] validating credentials email=${dto.email}`);
    const user = await this.localStrategy.validate(dto.email, dto.password);
    this.logger.log(`[login] credentials valid id=${user.id}`);
    await this.usersService.updateLastLogin(user.id);
    return this.generateTokens({ sub: user.id, email: user.email });
  }

  async refresh(dto: RefreshDto): Promise<TokenPair> {
    const payload = this.jwtStrategy.validate(dto.refreshToken);

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new RpcException({
        statusCode: 401,
        message: 'Usuario no encontrado.',
      });
    }

    return this.generateTokens({ sub: user.id, email: user.email });
  }

  private generateTokens(payload: JwtPayload): TokenPair {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET ?? 'secret',
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as never,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret:
        process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'secret',
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as never,
    });

    return { accessToken, refreshToken };
  }
}
