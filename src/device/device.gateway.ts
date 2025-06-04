import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { DeviceService } from './device.service';
import { Server, Socket } from 'socket.io';
import { InfoDto } from './dto/info.dto';

@WebSocketGateway({ namespace: '/device/location' })
export class DeviceGateway {
  constructor(private readonly deviceService: DeviceService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('info')
  async info(client: Socket, infoDto: InfoDto) {
    const dto = await this.deviceService.info(infoDto);
    console.log(dto);
    if (dto.denger.length > 0) client.emit('danger', dto);
    return;
  }
}
