import { forwardRef, Module } from '@nestjs/common';
import { HostService } from './host.service';
import { HostController } from './host.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HostEntity } from './entities/host.entity';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { HostGateway } from './host.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([HostEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => MemberModule),
  ],
  controllers: [HostController],
  providers: [HostService, HostGateway],
  exports: [HostService, HostGateway],
})
export class HostModule {}
