import { IsDefined } from 'class-validator';

export interface MemberInfo {
  memberId: number;
  lat: number;
  lon: number;
}

export class InfoDto {
  @IsDefined()
  hostId: number;
  @IsDefined()
  lat: number;
  @IsDefined()
  lon: number;
  @IsDefined()
  members: MemberInfo[]; // 명확하게 배열 타입으로!
}
export class DistanceInfo {
  @IsDefined()
  safe: number;
  @IsDefined()
  warning: number;
  @IsDefined()
  danger: number;
}
