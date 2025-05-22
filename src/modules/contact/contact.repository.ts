import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Contact } from './contact.entity';

@Injectable()
export class ContactRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo(): Repository<Contact> {
    return this.dataSource.getRepository(Contact);
  }

  async findByUserId(userId: string): Promise<Contact[]> {
    return await this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async save(userId: string, contactData: Partial<Contact>): Promise<Contact> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Contact);
      const contact = repo.create({
        user: { id: userId } as any,
        ...contactData,
      });
      return await repo.save(contact);
    });
  }
}
