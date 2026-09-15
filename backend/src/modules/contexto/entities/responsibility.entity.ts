import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { ResponsibilityAssignment } from './responsibility-assignment.entity';

@Entity('responsabilidades')
export class Responsibility extends BaseEntity {
  @Column({ unique: true, length: 100 })
  code: string;

  @Column({ length: 180 })
  name: string;

  @Column({ length: 40 })
  domain: string;

  @Column({ nullable: true, length: 255 })
  description: string;

  @Column({ default: 'active', length: 20 })
  status: string;

  @OneToMany(
    () => ResponsibilityAssignment,
    (assignment) => assignment.responsibility,
  )
  assignments: ResponsibilityAssignment[];
}
