export class HostInfoDto {
  host: { lat: number; lon: number };
  distanceInfo: { safe: number; warning: number; danger: number };
  members: {
    memberName: string;
    lat: number;
    lon: number;
    distance: number;
    danger: number;
  }[];
}
