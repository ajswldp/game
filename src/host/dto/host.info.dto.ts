import { IsDefined } from 'class-validator';

export class HostInfoDto {
  @IsDefined()
  host: { lat: number; lon: number };
  @IsDefined()
  distanceInfo: { safe: number; warning: number; danger: number };
  @IsDefined()
  members: {
    memberName: string;
    lat: number;
    lon: number;
    distance: number;
    danger: number;
  }[];
}
