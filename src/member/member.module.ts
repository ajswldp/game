import { forwardRef, Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from './entities/member.entity';
import { DeviceModule } from '../device/device.module';
import { AuthModule } from '../auth/auth.module';
import { MemberGateway } from './member.gateway';
import { HostModule } from '../host/host.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberEntity]),
    forwardRef(() => DeviceModule),
    forwardRef(() => AuthModule),
    forwardRef(() => HostModule),
  ],
  controllers: [MemberController],
  providers: [MemberService, MemberGateway],
  exports: [MemberService, MemberGateway],
})
export class MemberModule {}
