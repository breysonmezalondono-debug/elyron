import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './role.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { Permission } from '../permissions/permission.entity';
@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}
  async create(dto: CreateRoleDto): Promise<Role> {
    const exists = await this.roleRepo.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException('El rol ya existe');
    const role = this.roleRepo.create({
      name: dto.name,
      description: dto.description,
    });
    if (dto.permissionIds && dto.permissionIds.length > 0) {
      role.permissions = await this.permissionRepo.findBy({
        id: In(dto.permissionIds),
      });
    }
    return this.roleRepo.save(role);
  }
  async findAll(): Promise<Role[]> {
    return this.roleRepo.find({ relations: { permissions: true } });
  }
  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: { permissions: true },
    });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }
  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    Object.assign(role, { name: dto.name, description: dto.description });
    if (dto.permissionIds) {
      role.permissions = await this.permissionRepo.findBy({
        id: In(dto.permissionIds),
      });
    }
    return this.roleRepo.save(role);
  }
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.roleRepo.delete(id);
  }
}
