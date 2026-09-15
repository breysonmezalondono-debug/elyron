import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('actividades_docente')
export class Actividad extends BaseEntity {
  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @Column({ nullable: true })
  competency: string;

  @Column()
  groupId: string;

  @Column({ nullable: true })
  groupCode: string;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ default: 0 })
  submissions: number;

  @Column({ default: 'Publicada' })
  status: string;
}
