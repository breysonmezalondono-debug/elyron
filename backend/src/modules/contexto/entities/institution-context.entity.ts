import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { InstitutionScope } from './institution-scope.entity';
import { ResponsibilityAssignment } from './responsibility-assignment.entity';

@Entity('contexto_instituciones')
export class InstitutionContext extends BaseEntity {
  @Column({ unique: true, length: 80 })
  code: string;

  @Column({ length: 160 })
  name: string;

  @Column({ length: 40 })
  type: string;

  @Column({ default: 'active', length: 20 })
  status: string;

  @OneToMany(() => InstitutionScope, (scope) => scope.institution)
  scopes: InstitutionScope[];

  @OneToMany(
    () => ResponsibilityAssignment,
    (assignment) => assignment.institution,
  )
  responsibilityAssignments: ResponsibilityAssignment[];
}
