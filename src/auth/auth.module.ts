import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtStrategy } from './jwt/jwt.strategy';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { RolesGuard } from './role.guard';

import { HostModule } from '../host/host.module';
import { MemberModule } from '../member/member.module';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from '../../config/typeorm';
import { RefreshTokenEntity } from './jwt/refresh.token.entity';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshTokenEntity]),
    TypeOrmModule.forRoot(typeORMConfig),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    ConfigModule,
    forwardRef(() => HostModule),
    forwardRef(() => MemberModule),
  ],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    AuthService,
    JwtStrategy,
    JwtService,
    RolesGuard,
    AuthController,
  ],
  exports: [JwtModule, JwtAuthGuard, RolesGuard, AuthService, RolesGuard],
})
export class AuthModule {}
