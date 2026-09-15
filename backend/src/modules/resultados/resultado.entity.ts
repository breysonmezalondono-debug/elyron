import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Competencia } from '../competencias/competencia.entity';
import { Evidencia } from '../evidencias/evidencia.entity';
@Entity('resultados')
export class Resultado extends BaseEntity {
  @Column()
  name: string;
  @Column({ nullable: true })
  description: string;
  @ManyToOne(() => Competencia, (competencia) => competencia.resultados)
  @JoinColumn({ name: 'competenciaId' })
  competencia: Competencia;
  @Column()
  competenciaId: string;
  @OneToMany(() => Evidencia, (evidencia) => evidencia.resultado)
  evidencias: Evidencia[];
}
