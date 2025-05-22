import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo(): Repository<User> {
    return this.dataSource.getRepository(User);
  }

  async findByOauth(oauthId: string, provider: string): Promise<User | null> {
    try {
      return await this.repo.findOne({
        where: { oauthId, provider },
        relations: ['preferences'],
      });
    } catch (err) {
      throw new InternalServerErrorException('findByOauth in UserRepository');
    }
  }

  async findByNickname(nickname: string): Promise<User | null> {
    try {
      return await this.repo.findOne({ where: { nickname } });
    } catch (err) {
      throw new InternalServerErrorException(
        'findByNickname in UserRepository',
      );
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.repo.findOne({ where: { id } });
    } catch (err) {
      throw new InternalServerErrorException('findById in UserRepository');
    }
  }

  async findByIdWithPreferences(id: string): Promise<User | null> {
    try {
      return await this.repo.findOne({
        where: { id },
        relations: ['preferences'],
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'findByIdWithPreferences in UserRepository',
      );
    }
  }

  async save(userData: Partial<User>): Promise<User> {
    try {
      return this.dataSource.transaction(async (manager) => {
        const repo = manager.getRepository(User);
        const user = repo.create(userData);
        return await repo.save(user);
      });
    } catch (err) {
      throw new InternalServerErrorException('save in UserRepository');
    }
  }

  async updateUserById(id: string, updateFields: Partial<User>): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const result = await manager
          .getRepository(User)
          .createQueryBuilder()
          .update(User)
          .set(updateFields)
          .where('id = :id', { id })
          .execute();

        if (result.affected === 0) {
          throw new NotFoundException('OAuth user not found');
        }
      });
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      } else {
        throw new InternalServerErrorException(
          'updateUserById in UserRepository',
        );
      }
    }
  }

  async remove(id): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const repo = manager.getRepository(User);
        const user = await repo.findOne({ where: { id } });

        if (!user) {
          throw new NotFoundException('OAuth user not found');
        }

        await repo.delete(id);
      });
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      } else {
        throw new InternalServerErrorException('remove in UserRepository');
      }
    }
  }
}
