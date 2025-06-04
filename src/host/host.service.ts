import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HostEntity } from './entities/host.entity';
import { Repository } from 'typeorm';
import { SignupHostDto } from './dto/signup-host.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/user/user';
import { LoginDto } from './dto/login.dto';
import { AuthService } from '../auth/auth.service';
import { DistanceInfo, InfoDto } from '../device/dto/info.dto';
import { MemberService } from '../member/member.service';
import { NameDto } from './dto/name.dto';
import { HostGateway } from './host.gateway';
import { HostInfoDto } from './dto/host.info.dto';

@Injectable()
export class HostService {
  constructor(
    @InjectRepository(HostEntity)
    private readonly hostRepo: Repository<HostEntity>,
    private readonly tokenService: AuthService,
    private readonly memberService: MemberService,
    @Inject(forwardRef(() => HostGateway))
    private readonly hostGateway: HostGateway,
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
    const host = await this.hostRepo.findOneBy({ id: loginDto.hostId });
    if (!host) {
      throw new BadRequestException('호스트를 찾지 못했습니다');
    }
    if (!(await bcrypt.compare(loginDto.password, host.password))) {
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
    await this.location(host);
    return host;
  }
  async location(user: HostEntity) {
    const hostInfoDto: HostInfoDto = {
      host: { lat: user.lat, lon: user.lon },
      distanceInfo: {
        safe: user.safe,
        warning: user.warning,
        danger: user.danger,
      },
      members: [],
    };
    await this.memberService.findByHost(user).then((members) => {
      for (const member of members) {
        hostInfoDto.members.push({
          memberName: member.name,
          lat: member.lat,
          lon: member.lon,
          distance: calculateDistanceInMeters(
            user.lat,
            user.lon,
            member.lat,
            member.lon,
          ),
          danger: member.danger,
        });
      }
    });
    this.hostGateway.info(user, hostInfoDto);
  }
}

const EARTH_RADIUS_KM = 6371;
const DEGREES_PER_RADIAN = 180 / Math.PI;
const calculateDistanceInMeters = (
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
) => {
  // 라디안으로 변환
  const lat1Radians = latitude1 / DEGREES_PER_RADIAN;
  const lon1Radians = longitude1 / DEGREES_PER_RADIAN;
  const lat2Radians = latitude2 / DEGREES_PER_RADIAN;
  const lon2Radians = longitude2 / DEGREES_PER_RADIAN;

  // haversine 공식 계산
  const deltaLatRadians = lat2Radians - lat1Radians;
  const deltaLonRadians = lon2Radians - lon1Radians;
  const a =
    Math.sin(deltaLatRadians / 2) ** 2 +
    Math.cos(lat1Radians) *
      Math.cos(lat2Radians) *
      Math.sin(deltaLonRadians / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceInKm = EARTH_RADIUS_KM * c;

  // km를 m로 변환하여 반환
  return distanceInKm * 1000;
};
