import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
export const NIVELES_SENA = [
  'tecnico',
  'tecnologo',
  'operario',
  'complementario',
] as const;
export const TIPOS_FORMACION_SENA = ['tecnico', 'tecnologo'] as const;
export const ETAPAS_SENA = [
  'induccion',
  'lectiva',
  'productiva',
  'finalizacion',
  'certificacion',
] as const;
export const MODALIDADES_PRODUCTIVA = [
  'contrato_aprendizaje',
  'vinculo_laboral',
  'proyecto_productivo',
  'pasantia_empresa',
  'pasantia_entidad_estatal',
  'pasantia_pyme',
  'monitoria',
  'unidad_productiva_familiar',
] as const;
@Entity('perfiles_sena')
export class PerfilSena extends BaseEntity {
  @Column()
  numeroFicha: string;
  @Column()
  programaFormacion: string;
  @Column()
  nivelFormacion: string;
  @Column()
  centroFormacion: string;
  @Column()
  regional: string;
  @Column({ default: 'lectiva' })
  etapa: string;
  @Column({ nullable: true })
  modalidadProductiva: string;
  @Column({ type: 'date', nullable: true })
  fechaInicio: Date;
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
  tipoFormacion: string;
  @Column({ nullable: true })
  codigoPrograma: string;
  @Column({ nullable: true })
  ciudad: string;
  @Column({ nullable: true })
  modalidad: string;
  @Column({ nullable: true })
  jornada: string;
  @Column({ type: 'date', nullable: true })
  fechaMatricula: Date;
  @Column({ nullable: true })
  estadoAcademico: string;
  @Column({ type: 'int', nullable: true })
  duracionMeses: number;
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
