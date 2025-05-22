import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from './refresh-token.repository';
import { RefreshToken } from './refresh-token.entity';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async validateToken(rawToken: string): Promise<RefreshToken | null> {
    const tokenHash = this.hashToken(rawToken);
    return await this.refreshTokenRepository.findByTokenHash(tokenHash);
  }

  async registerToken(
    rawToken: string,
    userId: string,
    expiresAt: Date,
    ip: string,
    userAgent: string,
  ): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    await this.refreshTokenRepository.registerToken(
      tokenHash,
      userId,
      expiresAt,
      ip,
      userAgent,
    );
  }

  async revokeToken(userId: string, userAgent: string): Promise<void> {
    await this.refreshTokenRepository.deleteTokenByUserIdAndUserAgent(userId, userAgent);
  }

  async revokeAllTokensForUser(userId: string): Promise<void> {
    await this.refreshTokenRepository.deleteAllTokensForUser(userId);
  }
}
