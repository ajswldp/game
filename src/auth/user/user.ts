import { HostEntity } from '../../host/entities/host.entity';
import { MemberEntity } from '../../member/entities/member.entity';
import { Role } from '../jwt/jwt.config';

export class User {
  constructor(role: Role, user: HostEntity | MemberEntity) {
    this.role = role;
    this.entity = user;
  }
  role: string;
  entity: HostEntity | MemberEntity;
}
