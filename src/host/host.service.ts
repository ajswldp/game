import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HostEntity } from './entities/host.entity';
import { Repository } from 'typeorm';
import { SignupHostDto } from './dto/signup-host.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/user/user';
import { LoginDto } from '../auth/user/login.dto';
import { AuthService } from '../auth/auth.service';
import { DistanceInfo, InfoDto } from '../device/dto/info.dto';
import { MemberService } from '../member/member.service';
import { NameDto } from './dto/name.dto';

@Injectable()
export class HostService {
  constructor(
    @InjectRepository(HostEntity)
    private readonly hostRepo: Repository<HostEntity>,
    private readonly tokenService: AuthService,
    private readonly memberService: MemberService,
  ) {}

  test(user: User) {
    const entity = user.entity as HostEntity;
    return `User profile of ${entity.id}`;
  }

  async signup(signupHostDto: SignupHostDto) {
    const host = await this.hostRepo.findOneBy({
      deviceId: signupHostDto.deviceId,
    });
    if (!host) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }
    const hostExists = await this.hostRepo.findOneBy({
      id: signupHostDto.hostId,
    });
    if (host.id != null || hostExists) {
      console.log(host.id, hostExists);
      throw new HttpException('Host already exists', HttpStatus.CONFLICT);
    }
    const newHost = new HostEntity();
    newHost.deviceId = signupHostDto.deviceId;
    newHost.id = signupHostDto.hostId;
    newHost.password = await bcrypt.hash(signupHostDto.password, 10);
    newHost.hostId = host.hostId;
    return await this.hostRepo.save(newHost);
  }

  async login(loginDto: LoginDto) {
    console.log(loginDto);
    const host = await this.hostRepo.findOneBy({ id: loginDto.hostId });
    if (!host) {
      throw new BadRequestException('호스트를 찾지 못했습니다');
    }
    if (!(await bcrypt.compare(loginDto.password, host.password))) {
      console.log('bcrypt.compare(loginDto.password, host.password) === flase');
      throw new BadRequestException('비밀번호가 올바르지 않습니다');
    }
    return await this.tokenService.issueTokenLogin(loginDto.hostId, 'host');
  }

  async findOneByName(name: string) {
    return await this.hostRepo.findOneBy({ id: name });
  }

  async distance(user: User, distanceInfo: DistanceInfo) {
    const host = user.entity as HostEntity;
    host.safe = distanceInfo.safe;
    host.warning = distanceInfo.warning;
    host.danger = distanceInfo.danger;
    await this.hostRepo.save(host);
  }

  async name(user: User, nameInfo: NameDto) {
    const host = user.entity as HostEntity;
    const member = await this.memberService.findOneByNameAndHost(
      nameInfo.beforeName,
      host,
    );
    if (!member) {
      throw new BadRequestException('찾을 수 없는 이름 입니다');
    } else if (
      await this.memberService.findOneByNameAndHost(nameInfo.afterName, host)
    ) {
      throw new BadRequestException('이미 있는 이름 입니다');
    } else {
      member.name = nameInfo.afterName;
      await this.memberService.save(member);
    }
  }

  async info(infoDto: InfoDto) {
    const host =
      (await this.hostRepo.findOneBy({ id: infoDto.hostId })) ||
      this.hostRepo.create({ id: infoDto.hostId });
    host.lat = infoDto.lat;
    host.lon = infoDto.lon;
    await this.hostRepo.save(host);
    return host;
  }
}
