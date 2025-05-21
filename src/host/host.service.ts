import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HostEntity } from './entities/host.entity';
import { Repository } from 'typeorm';
import { SignupHostDto } from './dto/signup-host.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/user/user';
import { LoginDto } from '../auth/user/login.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class HostService {
  constructor(
    @InjectRepository(HostEntity)
    private readonly hostRepo: Repository<HostEntity>,
    private readonly tokenService: AuthService,
  ) {}

  test(user: User) {
    const entity = user.entity as HostEntity;
    return `User profile of ${entity.id}`;
  }

  async signup(signupHostDto: SignupHostDto) {
    const host = await this.hostRepo.findOneBy({
      deviceId: signupHostDto.deviceId,
    });
    if (!host) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }
    const hostExists = await this.hostRepo.findOneBy({
      id: signupHostDto.hostId,
    });
    if (host.id != null || hostExists) {
      console.log(host.id, hostExists);
      throw new HttpException('Host already exists', HttpStatus.CONFLICT);
    }
    const newHost = new HostEntity();
    newHost.deviceId = signupHostDto.deviceId;
    newHost.id = signupHostDto.hostId;
    newHost.password = await bcrypt.hash(signupHostDto.password, 10);
    newHost.hostId = host.hostId;
    return await this.hostRepo.save(newHost);
  }

  async login(loginDto: LoginDto) {
    console.log(loginDto);
    const host = await this.hostRepo.findOneBy({ id: loginDto.hostId });
    if (!host) {
      throw new BadRequestException('호스트를 찾지 못했습니다');
    }
    if (!(await bcrypt.compare(loginDto.password, host.password))) {
      console.log('bcrypt.compare(loginDto.password, host.password) === flase');
      throw new BadRequestException('비밀번호가 올바르지 않습니다');
    }
    return await this.tokenService.issueTokenLogin(loginDto.hostId, 'host');
  }

  async findOneByName(name: string) {
    return await this.hostRepo.findOneBy({ id: name });
  }
}
