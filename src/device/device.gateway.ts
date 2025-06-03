import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Server, Socket } from 'socket.io';
import { InfoDto } from './dto/info.dto';

@WebSocketGateway({ namespace: '/device/location' })
export class DeviceGateway {
  constructor(private readonly deviceService: DeviceService) {}
  private clients: Map<string, Socket> = new Map();

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('info')
  async info(client: Socket, infoDto: InfoDto) {
    client.emit('danger', await this.deviceService.info(infoDto));
  }
}
