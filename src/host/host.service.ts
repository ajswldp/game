import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
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
  private readonly logger = new Logger('HostService');

  test(user: User) {
    const entity = user.entity as HostEntity;
    return `User profile of ${entity.id}`;
  }

  async signup(signupHostDto: SignupHostDto) {
    this.logger.log('signup', signupHostDto);
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
    this.logger.log('login', loginDto);
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
  async findOneName(name: string) {
    return await this.hostRepo.findOne({
      where: { id: name },
      relations: ['members'],
    });
  }

  async distance(user: User, distanceInfo: DistanceInfo) {
    this.logger.log('distance', distanceInfo, User);
    const host = user.entity as HostEntity;
    host.safe = distanceInfo.safe;
    host.warning = distanceInfo.warning;
    host.danger = distanceInfo.danger;
    await this.hostRepo.save(host);
    await this.memberService.setDistance(host);
    await this.location(host);
  }

  async name(user: User, nameDto: NameDto) {
    this.logger.log('name', nameDto, user);
    const host = user.entity as HostEntity;
    const member = await this.memberService.findOneByNameAndHost(
      nameDto.beforeName,
      host,
    );
    if (!member) {
      throw new BadRequestException('찾을 수 없는 이름 입니다');
    } else if (
      await this.memberService.findOneByNameAndHost(nameDto.afterName, host)
    ) {
      throw new BadRequestException('이미 있는 이름 입니다');
    } else {
      member.name = nameDto.afterName;
      await this.memberService.save(member);
    }
  }

  async addLocation(host: HostEntity, location: { lat: number; lon: number }) {
    this.logger.log('addLocation', location, host);
    host.lat = location.lat;
    host.lon = location.lon;
    await this.hostRepo.save(host);
    for (const member of host.members) {
      this.logger.log('try location', member.name);
      await this.memberService.location(member);
    }
    await this.location(host);
  }

  async info(infoDto: InfoDto) {
    const host =
      (await this.hostRepo.findOneBy({ deviceId: infoDto.hostId })) ||
      this.hostRepo.create({ deviceId: infoDto.hostId });
    host.lat = infoDto.lat;
    host.lon = infoDto.lon;
    await this.hostRepo.save(host);
    await this.location(host);
    return host;
  }
  async location(user: HostEntity) {
    const user2 = await this.hostRepo.findOne({
      where: { hostId: user.hostId },
      relations: ['members'],
    });
    if (!user2) {
      throw new NotFoundException('그럴 리 없음');
    }
    const hostInfoDto: HostInfoDto = {
      host: { lat: user2.lat, lon: user2.lon },
      distanceInfo: {
        safe: user2.safe,
        warning: user2.warning,
        danger: user2.danger,
      },
      members: [],
    };
    await this.memberService.findByHost(user2).then((members) => {
      for (const member of members) {
        hostInfoDto.members.push({
          memberName: member.name,
          lat: member.lat,
          lon: member.lon,
          distance: calculateDistanceInMeters(
            user2.lat,
            user2.lon,
            member.lat,
            member.lon,
          ),
          danger: member.danger,
        });
      }
    });
    this.hostGateway.info(user2, hostInfoDto);
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
