import { Injectable, Logger } from '@nestjs/common';
import { ContactRepository } from './contact.repository';
import { ContactDto, PaginatedContactDto, ContactSummaryDto, CreateContactDto } from './contact.dto';
import { winstonLogger } from '@utils';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  constructor(private readonly contactRepository: ContactRepository) {}

  async fetchContact(contactId: string): Promise<ContactDto | null> {
    try {
      const contact = await this.contactRepository.findByContactId(contactId);

      return contact ? ContactDto.fromEntity(contact) : null 
    } catch (err) {
      winstonLogger.error(`Failed to fetch contact`, err.stack);
      throw err;
    }
  }

  async fetchContacts(userId: string, page: number, limit: number, status?: 'pending' | 'answered'): Promise<PaginatedContactDto> {
    try {
      const { contacts, total } = await this.contactRepository.findByUserId(userId, page, limit, status);

      return new PaginatedContactDto(ContactDto.fromEntities(contacts), total, page, limit);
    } catch (err) {
      winstonLogger.error(`Failed to fetch contacts`, err.stack);
      throw err;
    }
  }

  async fetchContactSummary(userId: string): Promise<ContactSummaryDto> {
    try {
      const {total, pending, answered} = await this.contactRepository.countContactsGroupedByStatus(userId);

      return new ContactSummaryDto(total, pending, answered) 
    } catch (err) {
      winstonLogger.error(`Failed to fetch contact summary`, err.stack);
      throw err;
    }
  }

  async createContact(userId: string, dto: CreateContactDto): Promise<void> {
    try {
      const entity = dto.toEntity();
      await this.contactRepository.save(userId, entity);
    } catch (err) {
      winstonLogger.error(`Failed to create contact`, err.stack);
      throw err;
    }
  }
}
