import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  register(@Payload() dto: RegisterDto) {
    this.logger.log(`[register] received email=${dto.email}`);
    return this.authService.register(dto);
  }

  @MessagePattern('auth.login')
  login(@Payload() dto: LoginDto) {
    this.logger.log(`[login] received email=${dto.email}`);
    return this.authService.login(dto);
  }

  @MessagePattern('auth.refresh')
  refresh(@Payload() dto: RefreshDto) {
    this.logger.log(`[refresh] received`);
    return this.authService.refresh(dto);
  }
}
