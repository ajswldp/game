import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import {
  ForbiddenException,
  forwardRef,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtPayload, Role } from '../auth/jwt/jwt.config';
import { MemberService } from './member.service';
import { MemberEntity } from './entities/member.entity';
import { MemberInfoDto } from './dto/member.info.dto';

@WebSocketGateway({
  namespace: '/member/location', // 필요시 네임스페이스 지정
})
export class MemberGateway implements OnGatewayConnection {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => MemberService))
    private readonly memberService: MemberService,
  ) {}
  private clients: Map<string, CustomSocket> = new Map();

  async handleConnection(client: CustomSocket) {
    const authorization = client.handshake.query.Authorization as string;
    const token = authorization.replace('Bearer ', '');
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      console.log(payload);
      if (payload.role !== Role.member)
        throw new ForbiddenException('권한이 없습니다');
      const user = await this.memberService.findOneName(payload.name);
      if (!user) throw new UnauthorizedException('잘못된 유저');
      else {
        client.data.user = user;
        this.clients.set(user.memberId, client);
        this.memberService.location(user);
      }
    } catch (err) {
      console.log(err);
      client.disconnect();
      throw err;
    }
  }
  info(user: MemberEntity, dto: MemberInfoDto) {
    this.clients.get(user.memberId)?.emit('info', dto);
  }
  @SubscribeMessage('info')
  async hostInfo(client: CustomSocket, location: { lat: number; lon: number }){
    await this.memberService.addLocation(client.data.user, location);
  }
}

interface CustomSocket extends Socket {
  data: {
    user: MemberEntity; // 혹은 더 구체적인 User 타입
  };
}
