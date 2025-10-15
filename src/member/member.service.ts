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
import { MemberEntity } from './entities/member.entity';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { HostEntity } from '../host/entities/host.entity';
import { MemberInfo } from '../device/dto/info.dto';
import { Danger } from './dto/danger';
import { SignupMemberDto } from './dto/signup.dto';
import { MemberLoginDto } from './dto/member.login.dto';
import * as bcrypt from 'bcrypt';
import { MemberGateway } from './member.gateway';
import { MemberInfoDto } from './dto/member.info.dto';
import { User } from 'src/auth/user/user';
import { HostService } from '../host/host.service';

@Injectable()
export class MemberService {
  private readonly logger = new Logger('MemberService');

  test(user: User) {
    return user;
  }
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepo: Repository<MemberEntity>,
    private readonly tokenService: AuthService,
    @Inject(forwardRef(() => MemberGateway))
    private readonly memberGateway: MemberGateway,
    @Inject(forwardRef(() => HostService))
    private readonly hostService: HostService,
  ) {}
  async location(user: MemberEntity) {
    this.logger.log('location', user);
    const user2 = await this.memberRepo.findOne({
      where: { memberId: user.memberId },
      relations: ['host'],
    });
    if (!user2) {
      throw new NotFoundException('그럴 리 없음');
    }
    const memberInfoDto: MemberInfoDto = {
      danger: user2.danger,
      distanceInfo: {
        safe: user2.host.safe,
        warning: user2.host.warning,
        danger: user2.host.danger,
      },
      distance: calculateDistanceInMeters(
        user2.lat,
        user2.lon,
        user2.host.lat,
        user2.host.lon,
      ),
      host: {
        lat: user2.host.lat,
        lon: user2.host.lon,
      },
      member: {
        lat: user2.lat,
        lon: user2.lon,
      },
    };
    this.logger.log('memberInfoDto', memberInfoDto);
    this.memberGateway.info(user, memberInfoDto);
  }
  async info(host: HostEntity, membersInfo: MemberInfo[]) {
    this.logger.log('info', host, membersInfo);
    const dto: Danger = new Danger();
    dto.danger = [];
    const count = await this.memberRepo.findAndCountBy({ host: host });

    for (const memberInfo of membersInfo) {
      const member = await this.memberRepo.findOne({
        where: { deviceId: memberInfo.memberId },
        relations: ['host'],
      });
      if (member) {
        member.lon = memberInfo.lon;
        member.lat = memberInfo.lat;
        const distance = calculateDistanceInMeters(
          host.lat,
          host.lon,
          member.lat,
          member.lon,
        );
        const danger = getDanger(distance, host);
        if (danger !== member.danger) {
          member.danger = danger;
          dto.danger.push({ id: member.deviceId, distance: danger });
        }
        this.logger.log('isMember', member);
        await this.memberRepo.save(member);
        await this.location(member);
      } else {
        const distance = calculateDistanceInMeters(
          host.lat,
          host.lon,
          memberInfo.lat,
          memberInfo.lon,
        );
        const danger = getDanger(distance, host);
        const member = this.memberRepo.create({
          deviceId: memberInfo.memberId,
          host: host,
          lon: memberInfo.lon,
          lat: memberInfo.lat,
          name: `멤버${count[1]++}`,
          danger: danger,
        });
        this.logger.log('isNotMember', member);
        await this.memberRepo.save(member);
        dto.danger.push({ id: member.deviceId, distance: danger });
        await this.location(member);
      }
    }
    return dto;
  }

  async findOneByNameAndHost(name: string, host: HostEntity) {
    this.logger.log('findOneByNameAndHost', name);
    this.logger.log(await this.memberRepo.findBy({ name }));
    return await this.memberRepo.findOneBy({ name: name, host: host });
  }

  async save(member: MemberEntity) {
    await this.memberRepo.save(member);
  }

  async signup(signupMemberDto: SignupMemberDto) {
    const member = await this.memberRepo.findOneBy({
      deviceId: signupMemberDto.deviceId,
    });
    if (!member) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }
    const hostExists = await this.memberRepo.findOneBy({
      id: signupMemberDto.memberId,
    });
    if (member.id != null || hostExists) {
      console.log(member.id, hostExists);
      throw new HttpException('Host already exists', HttpStatus.CONFLICT);
    }
    const newMember = new MemberEntity();
    newMember.deviceId = signupMemberDto.deviceId;
    newMember.id = signupMemberDto.memberId;
    newMember.password = await bcrypt.hash(signupMemberDto.password, 10);
    newMember.memberId = member.memberId;
    return await this.memberRepo.save(newMember);
  }

  async login(memberLoginDto: MemberLoginDto) {
    this.logger.log('login', memberLoginDto);
    const member = await this.memberRepo.findOneBy({
      id: memberLoginDto.memberId,
    });
    if (!member) {
      throw new BadRequestException('호스트를 찾지 못했습니다');
    }
    if (!(await bcrypt.compare(memberLoginDto.password, member.password))) {
      throw new BadRequestException('비밀번호가 올바르지 않습니다');
    }
    return await this.tokenService.issueTokenLogin(
      memberLoginDto.memberId,
      'member',
    );
  }

  async findOneByName(name: string) {
    return await this.memberRepo.findOneBy({ name: name });
  }
  async findOneName(name: string) {
    return await this.memberRepo.findOne({
      where: { id: name },
      relations: ['host'],
    });
  }
  async findByHost(host: HostEntity) {
    return await this.memberRepo.findBy({ host: host });
  }

  async setDistance(host: HostEntity) {
    const members = await this.memberRepo.find({
      where: { host: host },
      relations: ['host'],
    });
    for (const member of members) {
      const length = calculateDistanceInMeters(
        host.lat,
        host.lon,
        member.lat,
        member.lon,
      );
      member.danger = getDanger(length, host);
      await this.memberRepo.save(member);
      await this.location(member);
    }
  }
  async addLocation(
    member: MemberEntity,
    location: { lat: number; lon: number },
  ) {
    member.lat = location.lat;
    member.lon = location.lon;
    await this.memberRepo.save(member);
    await this.location(member);
    await this.hostService.location(member.host);
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

const getDanger: (length: number, host: HostEntity) => number = (
  length: number,
  host: HostEntity,
) => {
  if (length < host.safe) {
    return 0;
  } else if (length < host.warning) {
    return 1;
  } else if (length < host.danger) {
    return 2;
  } else {
    return 3;
  }
};
