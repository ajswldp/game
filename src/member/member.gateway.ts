import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtPayload, Role } from '../auth/jwt/jwt.config';
import { MemberService } from './member.service';
import { User } from '../auth/user/user';
import { MemberEntity } from './entities/member.entity';
import { MemberInfoDto } from './dto/member.info.dto';

@WebSocketGateway({
  namespace: '/member/location', // 필요시 네임스페이스 지정
})
export class MemberGateway implements OnGatewayConnection {
  constructor(
    private readonly jwtService: JwtService,
    private readonly memberService: MemberService,
  ) {}
  private clients: Map<MemberEntity, CustomSocket> = new Map();

  async handleConnection(client: CustomSocket) {
    // 소켓 handshake에서 token 가져오기
    const token = client.handshake.auth?.token as string;

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      if (payload.role !== Role.member)
        throw new ForbiddenException('권한이 없습니다');
      const user = await this.memberService.findOneByName(payload.name);
      if (!user) throw new UnauthorizedException('잘못된 유저');
      else {
        client.data.user = user;
        this.clients.set(user, client);
      }
    } catch (err) {
      client.disconnect();
      throw new UnauthorizedException('잘못된 유저');
    }
  }
  info(user: MemberEntity, dto: MemberInfoDto) {
    this.clients.get(user)?.emit('info', dto);
  }
}

interface CustomSocket extends Socket {
  data: {
    user: MemberEntity; // 혹은 더 구체적인 User 타입
  };
}
