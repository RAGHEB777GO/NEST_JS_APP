import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // 🔐 Generate Access Token
  generateAccessToken(payload: any): string {
    const secret = this.configService.get<string>('ACCESS_TOKEN_SECRET')!;
    const expiresIn = this.configService.get<string>('ACCESS_TOKEN_EXPIRES')!;

    return this.jwtService.sign(payload, {
      secret,
      expiresIn: expiresIn as JwtSignOptions['expiresIn'],
    });
  }

  // 🔁 Generate Refresh Token
  generateRefreshToken(payload: any): string {
    const secret = this.configService.get<string>('REFRESH_TOKEN_SECRET')!;
    const expiresIn = this.configService.get<string>('REFRESH_TOKEN_EXPIRES')!;

    return this.jwtService.sign(payload, {
      secret,
      expiresIn: expiresIn as JwtSignOptions['expiresIn'],
    });
  }

  // 🎯 Generate both tokens together
  generateTokens(payload: any) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  // ✅ Verify any token
  verifyToken(token: string, secret: string): any {
    try {
      return this.jwtService.verify(token, { secret });
    } catch (err) {
      return null;
    }
  }

  // 🧠 Verify only refresh token
  verifyRefreshToken(refreshToken: string) {
    const secret = this.configService.get<string>('REFRESH_TOKEN_SECRET')!;
    return this.verifyToken(refreshToken, secret);
  }

  // 🧩 Decode token without verification
  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}
