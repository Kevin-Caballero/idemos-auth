import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy {
  constructor(private readonly jwtService: JwtService) {}

  validate(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret:
          process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'secret',
      });
    } catch {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Token inválido o expirado.',
      });
    }
  }
}
