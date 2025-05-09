import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HostService } from './host.service';
import { SignupHostDto } from './dto/signup-host.dto';

@Controller('host')
export class HostController {
  constructor(private readonly hostService: HostService) {}

  @Post('/signup')
  signup(@Body() req: SignupHostDto) {
    return this.hostService.signup(req);
  }
}
