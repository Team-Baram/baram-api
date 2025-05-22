import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm'
import { User } from '@modules/user/user.entity'
import { CreatePreferenceDto, UpdatePreferenceDto } from './preference.dto'

@Entity()
export class Preference {
  @PrimaryGeneratedColumn()
  id: number 

  @Column({ nullable: false }) activityType: string;
  @Column({ nullable: false }) distance: number;
  @Column({ nullable: false }) pace: number;
  @Column({ nullable: false }) activityDaysPerWeek: number;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  @Index()
  @ManyToOne(() => User, (user) => user.preferences, { onDelete: 'CASCADE' })
  user: User;

  static fromCreatePreferenceDto({ activityType, distance, pace, activityDaysPerWeek }: CreatePreferenceDto): Partial<Preference> {
    const preference: Partial<Preference> = {}
    preference.activityType = activityType
    preference.distance = distance
    preference.pace = pace
    preference.activityDaysPerWeek = activityDaysPerWeek
    return preference
  }

  static fromUpdatePreferenceDto({ activityType, distance, pace, activityDaysPerWeek }: UpdatePreferenceDto): Partial<Preference> {
    const preference: Partial<Preference> = {}
    if (activityType !== undefined) {
    preference.activityType = activityType
    }
    if (distance !== undefined) {
    preference.distance = distance
    }
    if (pace !== undefined) {
    preference.pace = pace
    }
    if (activityDaysPerWeek !== undefined) {
    preference.activityDaysPerWeek = activityDaysPerWeek
    }
    return preference
  }
}