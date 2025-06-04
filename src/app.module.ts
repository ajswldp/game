import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HostModule } from './host/host.module';
import { MemberModule } from './member/member.module';
import { DeviceModule } from './device/device.module';
import { ConfigModule } from '@nestjs/config';
import { typeORMConfig } from '../config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
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
