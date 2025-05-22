import { IsString } from 'class-validator';
import { Contact } from './contact.entity';

export class ContactDto {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'answered';
  answer: string;
  createdAt: Date;
  answeredAt: Date;

  static fromEntity({
    id,
    title,
    content,
    status,
    answer,
    createdAt,
    answeredAt,
  }: Contact): ContactDto {
    const dto = new ContactDto();
    dto.id = id;
    dto.title = title;
    dto.content = content;
    dto.status = status;
    dto.answer = answer;
    dto.createdAt = createdAt;
    dto.answeredAt = answeredAt;
    return dto;
  }

  static fromEntities(entities: Contact[]): ContactDto[] {
    return entities.map(ContactDto.fromEntity);
  }
}

export class CreateContactDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  public toEntity(): Partial<Contact> {
    return Contact.fromCreateContactDto(this);
  }
}
