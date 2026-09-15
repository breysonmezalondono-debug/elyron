import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
@Entity('ofertas_trabajo')
export class JobListing extends BaseEntity {
  @Column()
  title: string;
  @Column('text')
  description: string;
  @Column({ nullable: true })
  company: string;
  @Column({ nullable: true })
  location: string;
  @Column({ nullable: true })
  salary: string;
  @Column({ default: 'active' })
  status: string;
  @Column({ nullable: true })
  expiresAt: Date;
  @Column({ type: 'simple-json', nullable: true })
  requirements: string[];
  @ManyToOne(() => User)
  @JoinColumn({ name: 'postedById' })
  postedBy: User;
  @Column()
  postedById: string;
  @Column({ default: 0 })
  applicationsCount: number;
}
