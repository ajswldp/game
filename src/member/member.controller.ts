import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberLoginDto } from './dto/member.login.dto';
import { SignupMemberDto } from './dto/signup.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { User } from '../auth/user/user';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}
  @Post('/signup')
  async signup(@Body() signupMemberDto: SignupMemberDto) {
    await this.memberService.signup(signupMemberDto);
  }
  @Post('/login')
  async login(@Body() memberLoginDto: MemberLoginDto) {
    return await this.memberService.login(memberLoginDto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('member')
  @Get('/test')
  test(@CurrentUser() user: User) {
    return this.memberService.test(user);
  }
}
