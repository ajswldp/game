import { Injectable } from '@nestjs/common';
import { SignupHostDto } from './dto/signup-host.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HostEntity } from './entities/host.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HostService {
  constructor(
    @InjectRepository(HostEntity)
    private readonly hostRepo: Repository<HostEntity>,
  ) {}
}
