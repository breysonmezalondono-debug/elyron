import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Role } from '../roles/role.entity';
import { Company } from '../companies/company.entity';
import { Ficha } from '../fichas/ficha.entity';
import { Grupo } from '../colegio/entities/grupo.entity';
@Entity('usuarios')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;
  @Column({ select: false })
  password: string;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column({ nullable: true })
  phone: string;
  @Column({ nullable: true })
  avatar: string;
  @Column({ default: true })
  isActive: boolean;
  @Column({ default: false })
  isEmailVerified: boolean;
  @Column({ type: 'varchar', nullable: true })
  emailVerificationToken: string;
  @Column({ type: 'datetime', nullable: true })
  emailVerificationExpiresAt: Date;
  @ManyToOne(() => Role, (role) => role.users, { nullable: true })
  @JoinColumn({ name: 'roleId' })
  role: Role;
  @Column({ nullable: true })
  roleId: string;
  @ManyToOne(() => Company, (company) => company.users, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company: Company;
  @Column({ nullable: true })
  companyId: string;
  @Column({ nullable: true })
  refreshToken: string;
  /** Versión de sesión/token: al cambiarla se invalidan los JWT emitidos antes. */
  @Column({ type: 'int', default: 0 })
  tokenVersion: number;
  @Column({ type: 'varchar', length: 20, default: 'sena' })
  institucion: string;
  @Column({ type: 'varchar', length: 30, nullable: true })
  authProvider: string;
  @Column({ type: 'varchar', length: 120, nullable: true })
  authProviderId: string;
  @ManyToOne(() => Ficha, { nullable: true })
  @JoinColumn({ name: 'fichaId' })
  ficha: Ficha;
  @Column({ nullable: true })
  fichaId: string;
  @Column({ default: false })
  esVocero: boolean;
  @Column({ default: false })
  esVoceroSuplente: boolean;
  @ManyToOne(() => Grupo, (g) => g.estudiantes, { nullable: true })
  @JoinColumn({ name: 'grupoId' })
  grupo: Grupo;
  @Column({ nullable: true })
  grupoId: string;
  @Column({ default: false })
  esPersonero: boolean;
  @Column({ default: false })
  esPersoneroSuplente: boolean;

  /** Datos personales y de identificación del personal institucional. */
  @Column({ type: 'varchar', length: 10, nullable: true })
  tipoDocumento: string;
  @Column({ type: 'varchar', length: 20, nullable: true })
  numeroDocumento: string;
  @Column({ type: 'varchar', length: 160, nullable: true })
  direccion: string;
  /** Títulos obtenidos: [{ titulo, institucion, tipo }] */
  @Column({ type: 'json', nullable: true })
  titulosAcademicos: Array<{ titulo: string; institucion: string; tipo: string }>;
  /** Educación informal/complementaria: [{ nombre, tipo, intensidadHoraria }] */
  @Column({ type: 'json', nullable: true })
  educacionComplementaria: Array<{ nombre: string; tipo: string; intensidadHoraria: string }>;
  /** Experiencia laboral y docente: [{ empresa, cargo, funciones, fechaInicio, fechaFin }] */
  @Column({ type: 'json', nullable: true })
  experienciaLaboral: Array<{
    empresa: string;
    cargo: string;
    funciones: string;
    fechaInicio: string;
    fechaFin: string;
  }>;
}
