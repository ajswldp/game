import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './token.dto';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(private readonly authService: AuthService) {}
  @Post('/refresh')
  async refresh(@Body() refreshToken: RefreshTokenDto) {
    this.logger.log('Refresh Token', refreshToken);
    return this.authService.reissueAccessToken(refreshToken);
  }
}
