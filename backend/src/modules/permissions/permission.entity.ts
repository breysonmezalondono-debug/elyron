import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Role } from '../roles/role.entity';
@Entity('permisos')
export class Permission extends BaseEntity {
  @Column({ unique: true })
  name: string;
  @Column()
  module: string;
  @Column()
  action: string;
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
