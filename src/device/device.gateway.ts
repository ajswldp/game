import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class DeviceGateway {
  constructor(private readonly deviceService: DeviceService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    console.log('Message received:', payload);
    this.server.emit('message', payload); // 모두에게 메시지 전송
  }
  @SubscribeMessage('createDevice')
  create(@MessageBody() createDeviceDto: CreateDeviceDto) {
    return this.deviceService.create(createDeviceDto);
  }

  @SubscribeMessage('findAllDevice')
  findAll() {
    return this.deviceService.findAll();
  }

  @SubscribeMessage('findOneDevice')
  findOne(@MessageBody() id: number) {
    return this.deviceService.findOne(id);
  }

  @SubscribeMessage('updateDevice')
  update(@MessageBody() updateDeviceDto: UpdateDeviceDto) {
    return this.deviceService.update(updateDeviceDto.id, updateDeviceDto);
  }

  @SubscribeMessage('removeDevice')
  remove(@MessageBody() id: number) {
    return this.deviceService.remove(id);
  }
}
