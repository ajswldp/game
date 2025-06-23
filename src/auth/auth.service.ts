import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './jwt/refresh.token.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './token.dto';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthController');
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepo: Repository<RefreshTokenEntity>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async issueTokenLogin(userId: string, role: 'host' | 'member') {
    const refreshToken = await this.issueRefreshToken(userId, role);
    return await this.reissueAccessToken(refreshToken);
  }
  async issueRefreshToken(userId: string, role: 'host' | 'member') {
    // payload 구성
    const payload = {};

    // 만료 주기 읽기
    const expiresIn = '7d';
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');

    // 토큰 생성
    const refreshToken = this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });

    // expiresAt 계산
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // fallback 7d
    // DB 저장
    const entity = this.refreshTokenRepo.create({
      userId,
      role,
      token: refreshToken,
      expiresAt,
    });
    await this.refreshTokenRepo.save(entity);

    // 반환
    return refreshToken;
  }

  async reissueAccessToken(token: string) {
    this.logger.log(`Reissue access token for`, token);
    // 1. DB에 저장된 리프레시 토큰이 유효한지 검증
    const refreshToken = await this.refreshTokenRepo.findOneBy({ token });
    this.logger.log(refreshToken);
    if (!refreshToken) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰');
    }
    // 만료 체크
    if (new Date(refreshToken.expiresAt) < new Date()) {
      throw new UnauthorizedException('만료된 리프레시 토큰');
    }

    // 2. payload 구성 및 access token 생성
    const payload = { role: refreshToken.role, name: refreshToken.userId };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '1h', // 필요하면 변경
    });

    return new TokenDto(accessToken, token);
  }
}
