import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { User } from '../users/user.entity';
import { Permission } from '../permissions/permission.entity';
@Entity('roles')
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;
  @Column({ nullable: true })
  description: string;
  @OneToMany(() => User, (user) => user.role)
  users: User[];
  @ManyToMany(() => Permission, (permission) => permission.roles, {
    eager: true,
  })
  @JoinTable({
    name: 'roles_permisos',
    joinColumn: { name: 'roleId' },
    inverseJoinColumn: { name: 'permissionId' },
  })
  permissions: Permission[];
}
