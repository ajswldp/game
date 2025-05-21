import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/refresh')
  async refresh(@Body() refreshToken: string) {
    return this.authService.reissueAccessToken(refreshToken);
  }
}
