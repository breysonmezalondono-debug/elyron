import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
import { Case } from './case.entity';

@Entity('casos_mensajes')
export class CaseMessage extends BaseEntity {
  @ManyToOne(() => Case, (item) => item.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ length: 36 })
  caseId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ length: 36 })
  authorId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 'PUBLIC', length: 20 })
  type: string;
}
