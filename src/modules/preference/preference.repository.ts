import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Preference } from './preference.entity';

@Injectable()
export class PreferenceRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo(): Repository<Preference> {
    return this.dataSource.getRepository(Preference);
  }

  async save(
    userId: string,
    preferenceData: Partial<Preference>,
  ): Promise<Preference> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Preference);
      const preference = repo.create({
        user: { id: userId } as any,
        ...preferenceData,
      });
      return await repo.save(preference);
    });
  }

  async updatePreferenceById(
    id: number,
    updateFields: Partial<Preference>,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const result = await manager
        .getRepository(Preference)
        .createQueryBuilder()
        .update(Preference)
        .set(updateFields)
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException('Preference not found');
      }
    });
  }
}
