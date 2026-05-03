import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@idemos/common';
import { Repository } from 'typeorm';

/**
 * Capa de acceso a datos para la entidad User dentro del microservicio auth.
 * Centraliza todas las consultas sobre usuarios para mantener la lógica de base de datos
 * fuera de AuthService y facilitar el testeo con mocks del repositorio.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Pick<User, 'name' | 'email' | 'passwordHash'>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.repo.update(id, { lastLoginAt: new Date() });
  }
}
