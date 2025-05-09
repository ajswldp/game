import { Module } from '@nestjs/common';
import { HostService } from './host.service';
import { HostController } from './host.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HostEntity } from './entities/host.entity';
import { typeORMConfig } from '../../config/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([HostEntity]),
    TypeOrmModule.forRoot(typeORMConfig),
  ],
  controllers: [HostController],
  providers: [HostService],
  exports: [],
})
export class HostModule {}
