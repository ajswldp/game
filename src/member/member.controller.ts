import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberLoginDto } from './dto/member.login.dto';
import { SignupMemberDto } from './dto/signup.dto';

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
}
