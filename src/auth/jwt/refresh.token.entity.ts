import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  role: 'host' | 'member';

  @Column()
  token: string; // 리프레시 토큰 값

  @Column()
  expiresAt: Date; // 만료기한 등
}
