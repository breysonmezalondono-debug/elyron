import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Ficha } from '../fichas/ficha.entity';
import { Resultado } from '../resultados/resultado.entity';
@Entity('competencias')
export class Competencia extends BaseEntity {
  @Column()
  name: string;
  @Column({ nullable: true })
  description: string;
  @Column({ default: 0 })
  weight: number;
  @ManyToOne(() => Ficha, (ficha) => ficha.competencias)
  @JoinColumn({ name: 'fichaId' })
  ficha: Ficha;
  @Column()
  fichaId: string;
  @OneToMany(() => Resultado, (resultado) => resultado.competencia)
  resultados: Resultado[];
}
