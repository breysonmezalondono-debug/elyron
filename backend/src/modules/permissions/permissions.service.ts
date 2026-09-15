import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';
import { CreatePermissionDto } from './dto/permission.dto';
@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}
  async create(dto: CreatePermissionDto): Promise<Permission> {
    const exists = await this.permissionRepo.findOne({
      where: { name: dto.name },
    });
    if (exists) throw new ConflictException('El permiso ya existe');
    const permission = this.permissionRepo.create(dto);
    return this.permissionRepo.save(permission);
  }
  async findAll(): Promise<Permission[]> {
    return this.permissionRepo.find();
  }
  async findOne(id: string): Promise<Permission> {
    const perm = await this.permissionRepo.findOne({ where: { id } });
    if (!perm) throw new NotFoundException('Permiso no encontrado');
    return perm;
  }
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.permissionRepo.delete(id);
  }
}
