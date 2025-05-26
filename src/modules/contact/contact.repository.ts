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

  async findByContactId(contactId: string): Promise<Contact | null> {
    const contact = await this.repo.findOne({
      where: { id: contactId },
    });

    return contact
  }

  async findByUserId(userId: string, page: number, limit: number, status?: 'pending' | 'answered'): Promise<{contacts: Contact[], total: number}> {
    const [contacts, total] = await this.repo.findAndCount({
      select: ['id', 'title', 'status', 'createdAt'],
      where: { user: { id: userId }, ...(status && { status }) },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit
    });

    return { contacts, total}
  }

  async countContactsGroupedByStatus(userId: string): Promise<{
    total: number;
    pending: number;
    answered: number;
  }> {
    const result = await this.repo
      .createQueryBuilder('contact')
      .select(['contact.status AS status', 'COUNT(*) AS count'])
      .where('contact.userId = :userId', { userId })
      .groupBy('contact.status')
      .getRawMany();

    const counts = { pending: 0, answered: 0, total: 0 };

    result.forEach(({ status, count }) => {
      if (status === 'pending') counts.pending = Number(count);
      if (status === 'answered') counts.answered = Number(count);
    });

    counts.total = counts.pending + counts.answered;

    return counts;
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
