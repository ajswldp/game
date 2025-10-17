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
  Logger,
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
  private readonly logger = new Logger('HostService');
  private clients: Map<string, Array<CustomSocket>> = new Map();

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

        if (!this.clients.get(user.memberId)) {
          this.clients.set(user.memberId, [client]);
        } else this.clients.get(user.memberId)?.push(client);
        await this.memberService.location(user);
      }
    } catch (err) {
      console.log(err);
      client.disconnect();
    }
  }
  info(user: MemberEntity, dto: MemberInfoDto) {
    this.logger.log('info', dto);
    const aliveSockets = this.clients
      .get(user.memberId)
      ?.filter((socket) => socket.connected);
    if (!aliveSockets) return;
    this.clients.set(user.memberId, aliveSockets);
    aliveSockets.forEach((c) => {
      c.emit('info', dto);
    });
  }
  @SubscribeMessage('info')
  async hostInfo(client: CustomSocket, location: { lat: number; lon: number }) {
    await this.memberService.addLocation(client.data.user, location);
  }
}

interface CustomSocket extends Socket {
  data: {
    user: MemberEntity; // 혹은 더 구체적인 User 타입
  };
}
