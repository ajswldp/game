import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'hosts' })
export class HostEntity {
  @PrimaryGeneratedColumn('uuid')
  hostId: string;

  @Column({ type: 'int' })
  deviceId: number;

  @Column({ type: 'varchar', nullable: true })
  id: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'double', nullable: true })
  lat: number;

  @Column({ type: 'double', nullable: true })
  lon: number;

  @Column({ type: 'int', default: 300 })
  safe: number;

  @Column({ type: 'int', default: 700 })
  warning: number;

  @Column({ type: 'int', default: 1000 })
  danger: number;
}
