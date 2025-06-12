import { IsDefined } from 'class-validator';

export class MemberInfoDto {
  @IsDefined()
  danger: number;
  @IsDefined()
  distanceInfo: { safe: number; warning: number; danger: number };
  @IsDefined()
  distance: number;
  @IsDefined()
  host: { lat: number; lon: number };
  @IsDefined()
  member: { lat: number; lon: number };
}
