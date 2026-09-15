import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
import { Case } from '../../casos/entities/case.entity';

@Entity('documentos_personales')
export class DocumentoPersonal extends BaseEntity {
  @Column({ length: 150 })
  titulo: string;
  @Column({ length: 30, default: 'academico' })
  tipo: string;
  @Column('text', { nullable: true })
  descripcion: string;
  @Column({ length: 500, nullable: true })
  url: string;
  @Column({ nullable: true })
  fechaEmision: Date;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'aprendizId' })
  aprendiz: User;
  @Column()
  aprendizId: string;

  @ManyToOne(() => Case, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ nullable: true, length: 36 })
  caseId: string;
}
