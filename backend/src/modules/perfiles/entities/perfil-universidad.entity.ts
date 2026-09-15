import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
export const JORNADAS = [
  'manana',
  'tarde',
  'noche',
  'completa',
  'fin_de_semana',
] as const;
@Entity('perfiles_universidad')
export class PerfilUniversidad extends BaseEntity {
  @Column({ unique: true })
  codigoEstudiantil: string;
  @Column()
  universidad: string;
  @Column()
  facultad: string;
  @Column()
  programaAcademico: string;
  @Column({ type: 'int' })
  semestre: number;
  @Column({ nullable: true })
  jornada: string;
  @Column({ type: 'int', nullable: true })
  creditosAprobados: number;
  @OneToOne(() => User)
  @JoinColumn({ name: 'usuarioId' })
  usuario: User;
  @Column({ unique: true })
  usuarioId: string;

  @Column({ nullable: true })
  tipoDocumento: string;
  @Column({ type: 'text', nullable: true })
  numeroDocumento: string;
  @Column({ unique: true, nullable: true })
  documentoHash: string;
  @Column({ nullable: true })
  nombres: string;
  @Column({ nullable: true })
  apellidos: string;
  @Column({ nullable: true })
  telefono: string;
  @Column({ nullable: true })
  nivelAcademico: string;
  @Column({ type: 'int', nullable: true })
  anioIngreso: number;
  @Column({ type: 'int', nullable: true })
  periodoIngreso: number;
  @Column({ nullable: true })
  modalidad: string;
  @Column({ type: 'int', nullable: true })
  creditosPrograma: number;
  @Column({ type: 'int', nullable: true })
  totalSemestres: number;
  @Column({ nullable: true })
  estadoAcademico: string;
  @Column({ type: 'int', nullable: true })
  semestresRestantes: number;
  @Column({ type: 'date', nullable: true })
  fechaEstimadaFinalizacion: Date;
  @Column({ nullable: true })
  estadoElyron: string;
  @Column({ nullable: true })
  confianza: string;
  @Column({ type: 'simple-json', nullable: true })
  confianzas: Record<string, string>;
  @Column({ type: 'simple-json', nullable: true })
  estimacion: {
    fecha?: string;
    etiqueta?: string;
    semestresRestantes?: number;
  } | null;
}
