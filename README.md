# Auth Service

Servicio de autenticación de iDemos. Gestiona el registro, login y validación de tokens JWT. Se expone como microservicio RabbitMQ (cola `auth_queue`).

## Variables de entorno

| Variable                  | Por defecto             | Descripción                                   |
| ------------------------- | ----------------------- | --------------------------------------------- |
| `DB_HOST`                 | `localhost`             | Host de PostgreSQL                            |
| `DB_PORT`                 | `5432`                  | Puerto de PostgreSQL                          |
| `DB_NAME`                 | `idemos`                | Nombre de la base de datos                    |
| `DB_USER`                 | `postgres`              | Usuario de PostgreSQL                         |
| `DB_PASSWORD`             | `postgres`              | Contraseña de PostgreSQL                      |
| `JWT_SECRET`              | `secret`                | Secreto para firmar los access tokens         |
| `JWT_REFRESH_SECRET`      | valor de `JWT_SECRET`   | Secreto para firmar los refresh tokens        |
| `JWT_EXPIRES_IN`          | `15m`                   | Duración del access token                     |
| `JWT_REFRESH_EXPIRES_IN`  | `7d`                    | Duración del refresh token                    |
| `RABBITMQ_URL`            | `amqp://localhost:5672` | URL de conexión a RabbitMQ                    |
| `NODE_ENV`                | —                       | `development` activa `synchronize` en TypeORM |

## Required versions

| Tool / Package          | Version  |
| ----------------------- | -------- |
| Node.js                 | >= 20.0  |
| npm                     | >= 10.0  |
| TypeScript              | ^5.7.3   |
| NestJS (`@nestjs/core`) | ^11.0.1  |
| TypeORM                 | ^0.3.20  |
| `@nestjs/typeorm`       | ^11.0.0  |
| `@nestjs/jwt`           | ^11.0.0  |
| `@nestjs/config`        | ^4.0.2   |
| `@nestjs/microservices` | ^11.0.1  |
| `bcryptjs`              | ^2.4.3   |
| PostgreSQL (`pg`)       | ^8.13.3  |
| RxJS                    | ^7.8.1   |

> Node.js 20+ is required for native `.env` file loading via `--env-file`.

## Scripts

```bash
npm run start:dev   # development (watch mode)
npm run start:prod  # production
npm run test        # unit tests
npm run test:e2e    # e2e tests
```
