import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HostEntity } from '../../host/entities/host.entity';

@Entity({ name: 'members' })
export class MemberEntity {
  @ManyToOne(() => HostEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hostId' })
  host: HostEntity;

  @PrimaryGeneratedColumn('uuid')
  memberId: string;

  @Column({ type: 'int' })
  deviceId: number;

  @Column({ type: 'varchar', nullable: true })
  id: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'varchar', nullable: false, collation: 'utf8mb4_general_ci' })
  name: string;

  @Column({ type: 'double', nullable: true })
  lat: number;

  @Column({ type: 'double', nullable: true })
  lon: number;

  @Column({ type: 'int', nullable: true })
  danger: number;
}
