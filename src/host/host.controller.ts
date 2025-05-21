import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { HostService } from './host.service';
import { SignupHostDto } from './dto/signup-host.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { User } from '../auth/user/user';
import { LoginDto } from '../auth/user/login.dto';
import { RolesGuard } from '../auth/role.guard';

@Controller('host')
export class HostController {
  constructor(private readonly hostService: HostService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('host')
  @Get()
  test(@CurrentUser() user: User) {
    return this.hostService.test(user);
  }
  @Post('/signup')
  async signup(@Body() signupHostDto: SignupHostDto) {
    await this.hostService.signup(signupHostDto);
  }
  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.hostService.login(loginDto);
  }
}
