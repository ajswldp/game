import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceGateway } from './device.gateway';

@Module({
  providers: [DeviceGateway, DeviceService],
})
export class DeviceModule {}
