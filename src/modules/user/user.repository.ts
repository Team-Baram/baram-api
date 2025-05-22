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
    return await this.repo.findOne({
      where: { oauthId, provider },
      relations: ['preferences'],
    });
  }

  async findByNickname(nickname: string): Promise<User | null> {
    return await this.repo.findOne({ where: { nickname } });
  }

  async findById(id: string): Promise<User | null> {
    return await this.repo.findOne({ where: { id } });
  }

  async findByIdWithPreferences(id: string): Promise<User | null> {
    return await this.repo.findOne({
      where: { id },
      relations: ['preferences'],
    });
  }

  async save(userData: Partial<User>): Promise<User> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(User);
      const user = repo.create(userData);
      return await repo.save(user);
    });
  }

  async updateUserById(id: string, updateFields: Partial<User>): Promise<void> {
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
  }

  async remove(id): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(User);
      const user = await repo.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException('OAuth user not found');
      }

      await repo.delete(id);
    });
  }
}
