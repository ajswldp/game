export interface MemberInfo {
  memberId: number;
  lat: number;
  lon: number;
}

export class InfoDto {
  hostId: string;
  lat: number;
  lon: number;
  members: MemberInfo[]; // 명확하게 배열 타입으로!
}
export class DistanceInfo {
  safe: number;
  warning: number;
  danger: number;
}
