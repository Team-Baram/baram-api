import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RefreshToken } from './refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo(): Repository<RefreshToken> {
    return this.dataSource.getRepository(RefreshToken);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return await this.repo.findOne({
      where: { tokenHash },
      relations: ['user'],
    });
  }

  async registerToken(
    tokenHash: string,
    userId: string,
    expiresAt: Date,
    ip: string,
    userAgent: string,
  ): Promise<RefreshToken> {
    return await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RefreshToken);
      const token = this.repo.create({
        tokenHash,
        user: { id: userId } as any,
        expiresAt,
        ip,
        userAgent,
      });
      return await repo.save(token);
    });
  }

  async deleteTokenByUserIdAndUserAgent(
    userId: string,
    userAgent: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager
        .getRepository(RefreshToken)
        .delete({ user: { id: userId }, userAgent });
    });
  }

  async deleteAllTokensForUser(userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager
        .getRepository(RefreshToken)
        .delete({ user: { id: userId } });
    });
  }
}
