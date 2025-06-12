import { IsDefined } from 'class-validator';

export class LoginDto {
  @IsDefined()
  hostId: string;
  @IsDefined()
  password: string;
}
