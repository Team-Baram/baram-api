import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RefreshToken } from '@modules/refresh-token/refresh-token.entity';
import { Preference } from '@modules/preference/preference.entity'
import { Contact } from '@modules/contact/contact.entity';
import { UpdateNicknameDto, UpdateProfileDto, UpdateAccountDto } from '@modules/user/user.dto'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false }) oauthId: string;
  @Column({ nullable: false }) provider: string;

  @Column({ nullable: false }) email: string;
  @Column({ nullable: false }) name: string;
  @Column({ nullable: false }) mobile: string;
  @Column({ nullable: false }) mobileE164: string;
  @Column({ nullable: true }) gender: string;
  @Column({ nullable: true }) age: string;

  @Column({ unique: true, nullable: false }) nickname: string;
  @Column({ nullable: false, default: true }) isReportPublic: boolean;
  @Column({ nullable: true }) avatarUrl: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Preference, (preference) => preference.user)
  preferences: Preference[];

  @OneToMany(() => Contact, (contact) => contact.user)
  contacts: Contact[]

  static fromUpdateNicknameDto({ nickname } : UpdateNicknameDto): Partial<User> {
    const user: Partial<User> = {}
    if (nickname !== undefined) {
      user.nickname = nickname
    }
    return user
  }


  static fromUpdateProfileDto({ avatarUrl, isReportPublic }: UpdateProfileDto): Partial<User> {
    const user: Partial<User> = {}
    if (avatarUrl!== undefined) {
      user.avatarUrl = avatarUrl
    }
    if (isReportPublic !== undefined) {
      user.isReportPublic = isReportPublic 
    }
    return user
  }

  static fromUpdateAccountDto({ nickname, mobile, mobileE164 }: UpdateAccountDto): Partial<User> {
    const user: Partial<User> = {}
    if (nickname !== undefined) {
      user.nickname = nickname 
    }
    if (mobile !== undefined) {
      user.mobile = mobile 
    }
    if (mobileE164 !== undefined) {
      user.mobileE164 = mobileE164
    }
    return user
  }
}
