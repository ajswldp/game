import { IsString } from 'class-validator';

export class TokenDto {
  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  accessToken: string;
  refreshToken: string;
}
export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
