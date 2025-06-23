import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(private readonly authService: AuthService) {}
  @Post('/refresh')
  async refresh(@Body() refreshToken: string) {
    this.logger.log('Refresh Token', refreshToken);
    return this.authService.reissueAccessToken(refreshToken);
  }
}
