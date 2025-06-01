import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberEntity } from './entities/member.entity';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { HostEntity } from '../host/entities/host.entity';
import { MemberInfo } from '../device/dto/info.dto';
import { Danger } from './dto/danger';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepo: Repository<MemberEntity>,
    private readonly tokenService: AuthService,
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
        const distance = this.distance(host, member);
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
        const distance = this.distance(host, member);
        dto.denger.push({ id: member.deviceId, distance: distance });
      }
    }
    return dto;
  }
  private distance(host: HostEntity, memberInfo: MemberEntity): number {
    const length = calculateDistanceInMeters(
      host.lat,
      host.lon,
      memberInfo.lat,
      memberInfo.lon,
    );

    if (length < host.safe) {
      return 0;
    } else if (length < host.warning) {
      return 1;
    } else if (length < host.danger) {
      return 2;
    } else {
      return 3;
    }
  }
  async findOneByNameAndHost(name: string, host: HostEntity) {
    return await this.memberRepo.findOneBy({ id: name, host: host });
  }

  async save(member: MemberEntity) {
    await this.memberRepo.save(member);
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
