import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { HostEntity } from '../src/host/entities/host.entity';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  charset: 'utf8mb4',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '1234',
  database: 'flp',
  entities: [HostEntity],
  synchronize: true,
  autoLoadEntities: true,
  logging: false,
};
