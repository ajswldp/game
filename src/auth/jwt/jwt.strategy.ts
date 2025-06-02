import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HostService } from '../../host/host.service';
import { MemberService } from '../../member/member.service';
import { JwtPayload, Role } from './jwt.config';
import { User } from '../user/user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private hostService: HostService,
    private memberService: MemberService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, //만료 알잘딱 하겠다
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { role, name } = payload;

    if (!role || !name) {
      throw new UnauthorizedException('토큰 정보 부족');
    }

    console.log(Object.values(Role));
    console.log(role);
    if (!Object.values(Role).includes(role)) {
      throw new ForbiddenException('유효하지 않은 역할');
    }
    const user =
      role === Role.host
        ? await this.hostService.findOneByName(name)
        : await this.memberService.findOneByName(name);
    if (!user) {
      throw new UnauthorizedException('유저 없음');
    }
    return new User(role, user);
  }
}
