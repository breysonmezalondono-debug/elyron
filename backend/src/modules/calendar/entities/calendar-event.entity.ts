import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
@Entity('eventos_calendario')
export class CalendarEvent extends BaseEntity {
  @Column()
  title: string;
  @Column({ nullable: true })
  description: string;
  @Column()
  startDate: Date;
  @Column()
  endDate: Date;
  @Column({ default: false })
  allDay: boolean;
  @Column({ default: 'default' })
  color: string;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;
  @Column()
  createdById: string;
  @Column({ nullable: true })
  type: string;
  @Column({ type: 'simple-json', nullable: true })
  attendees: string[];
}
