import {
  OnGatewayConnection,
  OnGatewayDisconnect,
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
import { HostService } from './host.service';
import { HostEntity } from './entities/host.entity';
import { HostInfoDto } from './dto/host.info.dto';

@WebSocketGateway({
  namespace: '/host/location', // 필요시 네임스페이스 지정
  pingInterval: 3000,
  pingTimeout: 30000, // 30초 안에 pong 응답 없으면 연결 끊음
})
export class HostGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => HostService))
    private readonly hostService: HostService,
  ) {}
  private clients: Map<HostEntity, CustomSocket> = new Map();
  private readonly logger = new Logger('HostGateway');

  handleDisconnect(client: CustomSocket) {
    this.logger.log('handleDisconnect', client);
  }
   handleConnection(client: CustomSocket) {
  }
  info(user: HostEntity, dto: HostInfoDto) {
    this.logger.log('info', user, dto);
    this.clients.get(user)?.emit('info', dto);
  }
}

interface CustomSocket extends Socket {
  data: {
    user: HostEntity; // 혹은 더 구체적인 User 타입
  };
}
