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
    try {
      return await this.repo.findOne({
        where: { tokenHash },
        relations: ['user'],
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'findByTokenHash in RefreshTokenRepository',
      );
    }
  }

  async registerToken(
    tokenHash: string,
    userId: string,
    expiresAt: Date,
    ip: string,
    userAgent: string,
  ): Promise<RefreshToken> {
    try {
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
    } catch (err) {
      throw new InternalServerErrorException(
        'registerToken in RefreshTokenRepository',
      );
    }
  }

  async deleteTokenByUserIdAndUserAgent(
    userId: string,
    userAgent: string,
  ): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        await manager
          .getRepository(RefreshToken)
          .delete({ user: { id: userId }, userAgent });
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'deleteTokenByHash in RefreshTokenRepository',
      );
    }
  }

  async deleteAllTokensForUser(userId: string): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        await manager
          .getRepository(RefreshToken)
          .delete({ user: { id: userId } });
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'deleteTokenByHash in RefreshTokenRepository',
      );
    }
  }
}
