import { Injectable, Logger } from '@nestjs/common';
import { ContactRepository } from './contact.repository';
import { ContactDto, CreateContactDto } from './contact.dto';
import { winstonLogger } from '@utils';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  constructor(private readonly contactRepository: ContactRepository) {}

  async fetchContacts(userId: string): Promise<ContactDto[]> {
    try {
      const contacts = await this.contactRepository.findByUserId(userId);

      return ContactDto.fromEntities(contacts);
    } catch (err) {
      winstonLogger.error(`Failed to fetch contacts`, err.stack);
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
