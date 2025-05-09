import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HostModule } from './host/host.module';
import { MemberModule } from './member/member.module';
import { DeviceModule } from './device/device.module';

@Module({
  imports: [HostModule, MemberModule, DeviceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
