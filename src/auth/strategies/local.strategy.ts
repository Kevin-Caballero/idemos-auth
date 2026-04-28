import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../users/users.service';

/**
 * LocalStrategy — Strategy pattern for credential-based authentication.
 * Validates email/password and returns the user entity if valid.
 */
@Injectable()
export class LocalStrategy {
  constructor(private readonly usersService: UsersService) {}

  async validate(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Credenciales incorrectas.',
      });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Credenciales incorrectas.',
      });
    }

    return user;
  }
}
