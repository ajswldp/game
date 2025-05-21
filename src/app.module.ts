import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HostModule } from './host/host.module';
import { MemberModule } from './member/member.module';
import { DeviceModule } from './device/device.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    HostModule,
    MemberModule,
    DeviceModule,
    ConfigModule.forRoot({
      isGlobal: true, // 전체에서 사용 가능하게
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
