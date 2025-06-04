import { Injectable } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { InfoDto } from './dto/info.dto';
import { HostService } from '../host/host.service';
import { MemberService } from '../member/member.service';

@Injectable()
export class DeviceService {
  constructor(
    private readonly hostService: HostService,
    private readonly membersService: MemberService,
  ) {}
  async info(infoDto: InfoDto) {
    const host = await this.hostService.info(infoDto);
    const dto = await this.membersService.info(host, infoDto.members);
    await this.hostService.location(host);
    return dto;
  }
}
