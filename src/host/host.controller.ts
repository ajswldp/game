import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { HostService } from './host.service';
import { SignupHostDto } from './dto/signup-host.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { User } from '../auth/user/user';
import { LoginDto } from './dto/login.dto';
import { RolesGuard } from '../auth/role.guard';
import { DistanceInfo } from '../device/dto/info.dto';
import { NameDto } from './dto/name.dto';

@Controller('host')
export class HostController {
  constructor(private readonly hostService: HostService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('host')
  @Post('/distance')
  async distance(
    @CurrentUser() user: User,
    @Body() distanceInfo: DistanceInfo,
  ) {
    await this.hostService.distance(user, distanceInfo);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('host')
  @Post('/name')
  async name(@CurrentUser() user: User, @Body() nameDto: NameDto) {
    await this.hostService.name(user, nameDto);
  }

  @Post('/signup')
  async signup(@Body() signupHostDto: SignupHostDto) {
    await this.hostService.signup(signupHostDto);
  }
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    return await this.hostService.login(loginDto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('host')
  @Get('/test')
  test(@CurrentUser() user: User) {
    return this.hostService.test(user);
  }
}
