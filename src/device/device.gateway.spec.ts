import { Test, TestingModule } from '@nestjs/testing';
import { DeviceGateway } from './device.gateway';
import { DeviceService } from './device.service';

describe('DeviceGateway', () => {
  let gateway: DeviceGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceGateway, DeviceService],
    }).compile();

    gateway = module.get<DeviceGateway>(DeviceGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
