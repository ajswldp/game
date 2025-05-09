import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@WebSocketGateway()
export class DeviceGateway {
  constructor(private readonly deviceService: DeviceService) {}

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
