import { Repository } from 'typeorm';
import { HostEntity } from './host.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
/*
@Injectable()
export class HostEntityRepository {
  constructor(
    @InjectRepository(HostEntity)
    private readonly repo: Repository<HostEntity>,
  ) {}
  async findOneByDeviceId(deviceId: number) {
    return await this.repo.findOneBy({ deviceId });
  }
  async findOneById(id: string) {
    return await this.repo.findOneBy({ id });
  }
  async sinup(deviceId: number, id: string, password: string) {
    await this.repo.update(deviceId, id);
    await this.repo.update( deviceId, password );
  }
}*/
