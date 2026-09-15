import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
@Entity('perfiles_colegio')
export class PerfilColegio extends BaseEntity {
  @Column()
  colegio: string;
  @Column({ type: 'int' })
  grado: number;
  @Column()
  jornada: string;
  @Column()
  tipoDocumento: string;
  @Column({ type: 'text' })
  numeroDocumento: string;
  @OneToOne(() => User)
  @JoinColumn({ name: 'usuarioId' })
  usuario: User;
  @Column({ unique: true })
  usuarioId: string;

  @Column({ unique: true, nullable: true })
  documentoHash: string;
  @Column({ nullable: true })
  nombres: string;
  @Column({ nullable: true })
  apellidos: string;
  @Column({ nullable: true })
  telefono: string;
  @Column({ nullable: true })
  ciudad: string;
  @Column({ type: 'int', nullable: true })
  anioAcademico: number;
  @Column({ nullable: true })
  estadoAcademico: string;
  @Column({ type: 'date', nullable: true })
  fechaEstimadaFinalizacion: Date;
  @Column({ nullable: true })
  estadoElyron: string;
  @Column({ nullable: true })
  confianza: string;
  @Column({ type: 'simple-json', nullable: true })
  confianzas: Record<string, string>;
  @Column({ type: 'simple-json', nullable: true })
  estimacion: { fecha?: string; etiqueta?: string } | null;
}
