import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
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

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepo: Repository<MemberEntity>,
    private readonly tokenService: AuthService,
    private readonly memberGateway: MemberGateway,
  ) {}
  async info(host: HostEntity, membersInfo: MemberInfo[]) {
    const dto: Danger = new Danger();
    const count = await this.memberRepo.findAndCountBy({ host: host });

    for (const memberInfo of membersInfo) {
      const member = await this.memberRepo.findOneBy({
        deviceId: memberInfo.memberId,
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
        const memberInfoDto: MemberInfoDto = {
          danger: danger,
          distanceInfo: {
            safe: host.safe,
            warning: host.warning,
            danger: host.danger,
          },
          distance: distance,
          host: {
            lat: host.lat,
            lon: host.lon,
          },
          member: {
            lat: member.lat,
            lon: member.lon,
          },
        };
        this.memberGateway.info(member, memberInfoDto);
        if (distance !== member.danger) {
          member.danger = distance;
          dto.denger.push({ id: member.deviceId, distance: distance });
        }
      } else {
        const member = this.memberRepo.create({
          deviceId: memberInfo.memberId,
          host: host,
          lon: memberInfo.lon,
          lat: memberInfo.lat,
          name: `멤버${count[1]++}`,
        });
        const distance = calculateDistanceInMeters(
          host.lat,
          host.lon,
          member.lat,
          member.lon,
        );
        const danger = getDanger(distance, host);
        dto.denger.push({ id: member.deviceId, distance: danger });
      }
    }
    return dto;
  }

  async findOneByNameAndHost(name: string, host: HostEntity) {
    return await this.memberRepo.findOneBy({ id: name, host: host });
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
    return await this.memberRepo.findOneBy({ id: name });
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
