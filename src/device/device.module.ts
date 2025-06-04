import { forwardRef, Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceGateway } from './device.gateway';
import { MemberModule } from '../member/member.module';
import { HostModule } from '../host/host.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => MemberModule),
    forwardRef(() => HostModule),
  ],
  providers: [DeviceGateway, DeviceService],
})
export class DeviceModule {}
