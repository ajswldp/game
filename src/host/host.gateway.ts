import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { ForbiddenException, forwardRef, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtPayload, Role } from '../auth/jwt/jwt.config';
import { HostService } from './host.service';
import { HostEntity } from './entities/host.entity';
import { HostInfoDto } from './dto/host.info.dto';

@WebSocketGateway({
  namespace: '/host/location', // 필요시 네임스페이스 지정
})
export class HostGateway implements OnGatewayConnection {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => HostService))
    private readonly hostService: HostService,
  ) {}
  private clients: Map<HostEntity, CustomSocket> = new Map();

  async handleConnection(client: CustomSocket) {
    // 소켓 handshake에서 token 가져오기
    const token = client.handshake.auth?.token as string;

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      if (payload.role !== Role.member)
        throw new ForbiddenException('권한이 없습니다');
      const user = await this.hostService.findOneByName(payload.name);
      if (!user) throw new UnauthorizedException('잘못된 유저');
      else {
        client.data.user = user;
        this.clients.set(user, client);
        await this.hostService.location(user);
      }
    } catch (err) {
      client.disconnect();
      throw new UnauthorizedException('잘못된 유저');
    }
  }
  info(user: HostEntity, dto: HostInfoDto) {
    this.clients.get(user)?.emit('info', dto);
  }
}

interface CustomSocket extends Socket {
  data: {
    user: HostEntity; // 혹은 더 구체적인 User 타입
  };
}
