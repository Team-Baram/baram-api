import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '@modules/user/user.entity';
import { CreateContactDto } from './contact.dto';

@Entity()
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false }) title: string;
  @Column({ type: 'text', nullable: false }) content: string;
  @Column({ nullable: false, default: 'pending' }) status:
    | 'pending'
    | 'answered';
  @Column({ nullable: true }) answer: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updateAt: Date;
  @Column({ type: 'timestamp', nullable: true }) answeredAt: Date;

  @Index()
  @ManyToOne(() => User, (user) => user.contacts)
  user: User;

  static fromCreateContactDto({
    title,
    content,
  }: CreateContactDto): Partial<Contact> {
    const contact: Partial<Contact> = {};
    contact.title = title;
    contact.content = content;
    contact.status = 'pending';
    return contact;
  }
}
