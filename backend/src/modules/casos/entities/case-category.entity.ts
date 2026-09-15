import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { InstitutionContext } from '../../contexto/entities/institution-context.entity';
import { Case } from './case.entity';

@Entity('casos_categorias')
export class CaseCategory extends BaseEntity {
  @Column({ length: 80 })
  code: string;

  @Column({ length: 160 })
  name: string;

  @Column({ nullable: true, length: 255 })
  description: string;

  @Column({ length: 100 })
  responsibilityCode: string;

  @Column({ type: 'simple-json', nullable: true })
  allowedTransitions: Record<string, string[]>;

  @Column({ default: 'active', length: 20 })
  status: string;

  @ManyToOne(() => InstitutionContext, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'institutionId' })
  institution: InstitutionContext;

  @Column({ length: 36 })
  institutionId: string;

  @OneToMany(() => Case, (item) => item.category)
  cases: Case[];
}
