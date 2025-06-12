import { IsDefined } from 'class-validator';

export class SignupMemberDto {
  @IsDefined()
  deviceId: number;

  @IsDefined()
  memberId: string;

  @IsDefined()
  password: string;
}
