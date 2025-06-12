import { IsDefined } from 'class-validator';

export class SignupHostDto {
  @IsDefined()
  deviceId: number;
  @IsDefined()
  hostId: string;
  @IsDefined()
  password: string;
}
