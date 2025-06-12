import { IsDefined } from 'class-validator';

export class MemberLoginDto {
  @IsDefined()
  memberId: string;
  @IsDefined()
  password: string;
}
