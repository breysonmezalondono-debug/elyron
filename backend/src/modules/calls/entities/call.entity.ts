import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
@Entity('llamadas')
export class Call extends BaseEntity {
  @Column()
  title: string;
  @Column('text')
  description: string;
  @Column()
  startDate: Date;
  @Column()
  endDate: Date;
  @Column({ default: 'open' })
  status: string;
  @Column({ type: 'simple-json', nullable: true })
  requirements: string[];
  @Column({ nullable: true })
  maxParticipants: number;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;
  @Column()
  createdById: string;
  @Column({ default: 0 })
  applicationsCount: number;
}
