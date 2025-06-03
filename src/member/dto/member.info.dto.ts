export class MemberInfoDto {
  danger: number;
  distanceInfo: { safe: number; warning: number; danger: number };
  distance: number;
  host: { lat: number; lon: number };
  member: { lat: number; lon: number };
}