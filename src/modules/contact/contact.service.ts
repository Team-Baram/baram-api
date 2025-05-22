import { Injectable } from '@nestjs/common';
import { ContactRepository } from './contact.repository';
import { ContactDto, CreateContactDto } from './contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly contactRepository: ContactRepository) {}

  async fetchContacts(userId: string): Promise<ContactDto[] | null> {
    const contacts = await this.contactRepository.findByUserId(userId);

    if (contacts) {
      return ContactDto.fromEntities(contacts);
    } else {
      return null;
    }
  }

  async createContact(userId: string, dto: CreateContactDto): Promise<void> {
    const entity = dto.toEntity();
    await this.contactRepository.save(userId, entity);
  }
}
