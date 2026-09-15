import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { User } from '../users/user.entity';
@Entity('empresas')
export class Company extends BaseEntity {
  @Column()
  name: string;
  @Column({ nullable: true })
  nit: string;
  @Column({ nullable: true })
  address: string;
  @Column({ nullable: true })
  phone: string;
  @Column({ nullable: true })
  email: string;
  @Column({ nullable: true })
  logo: string;
  @Column({ nullable: true })
  website: string;
  @Column({ default: true })
  isActive: boolean;
  @OneToMany(() => User, (user) => user.company)
  users: User[];
  @ManyToMany(() => User)
  @JoinTable({
    name: 'empresas_capacitadores',
    joinColumn: { name: 'companyId' },
    inverseJoinColumn: { name: 'trainerId' },
  })
  trainers: User[];
}
