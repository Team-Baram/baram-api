import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from './refresh-token.repository';
import { RefreshToken } from './refresh-token.entity';
import * as crypto from 'crypto';
import { winstonLogger } from '@utils';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async validateToken(rawToken: string): Promise<RefreshToken | null> {
    try {
      const tokenHash = this.hashToken(rawToken);
      return await this.refreshTokenRepository.findByTokenHash(tokenHash);
    } catch (err) {
      winstonLogger.error('Failed to validate token', err.stack);
      throw err;
    }
  }

  async registerToken(
    rawToken: string,
    userId: string,
    expiresAt: Date,
    ip: string,
    userAgent: string,
  ): Promise<void> {
    try {
      const tokenHash = this.hashToken(rawToken);
      await this.refreshTokenRepository.registerToken(
        tokenHash,
        userId,
        expiresAt,
        ip,
        userAgent,
      );
    } catch (err) {
      winstonLogger.error('Failed to register token', err.stack);
      throw err;
    }
  }

  async revokeToken(userId: string, userAgent: string): Promise<void> {
    try {
      await this.refreshTokenRepository.deleteTokenByUserIdAndUserAgent(
        userId,
        userAgent,
      );
    } catch (err) {
      winstonLogger.error('Failed to revoke token', err.stack);
      throw err;
    }
  }

  async revokeAllTokensForUser(userId: string): Promise<void> {
    try {
      await this.refreshTokenRepository.deleteAllTokensForUser(userId);
    } catch (err) {
      winstonLogger.error('Failed to revoke all tokens', err.stack);
      throw err;
    }
  }
}
