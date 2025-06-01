import { forwardRef, Module } from '@nestjs/common';
import { HostService } from './host.service';
import { HostController } from './host.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HostEntity } from './entities/host.entity';
import { typeORMConfig } from '../../config/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MemberService } from '../member/member.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HostEntity]),
    TypeOrmModule.forRoot(typeORMConfig),
    forwardRef(() => AuthModule),
  ],
  controllers: [HostController],
  providers: [HostService, MemberService],
  exports: [HostService],
})
export class HostModule {}
