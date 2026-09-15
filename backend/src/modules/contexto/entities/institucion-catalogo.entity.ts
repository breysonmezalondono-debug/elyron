import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

export type InstitucionCatalogoTipo = 'colegio' | 'universidad' | 'sena';

/**
 * Instituciones del catálogo administrable desde el panel admin:
 * colegios, universidades y sedes SENA (regional → centros y municipios).
 * Se fusionan con los catálogos estáticos al servir /catalogo-academico.
 */
@Entity('instituciones_catalogo')
export class InstitucionCatalogo extends BaseEntity {
  @Column({ length: 200 })
  nombre: string;

  @Column({ length: 20 })
  tipo: InstitucionCatalogoTipo;

  @Column({ type: 'json', nullable: true })
  detalles: Record<string, unknown>;

  @Column({ default: 'active', length: 20 })
  status: string;
}
