import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';

/**
 * Estructura del payload codificado en todos los tokens JWT del sistema.
 * - sub: ID del usuario (UUID).
 * - email: correo electrónico, incluido para facilitar logs y depuración.
 */
export interface JwtPayload {
  sub: string;
  email: string;
}

/**
 * Estrategia de validación de tokens JWT, utilizada para verificar refresh tokens.
 * Se usa el secret de refresh (JWT_REFRESH_SECRET) con fallback al JWT_SECRET genérico
 * para mantener compatibilidad en entornos de desarrollo con un único secret.
 */
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
