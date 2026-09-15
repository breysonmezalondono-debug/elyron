import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Ficha } from './ficha.entity';
import { FichaInstructor } from '../sena/entities/ficha-instructor.entity';
import { User } from '../users/user.entity';
import { SenaAccessService } from '../sena/sena-access.service';
import { CreateFichaDto, UpdateFichaDto } from './dto/ficha.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class FichasService {
  constructor(
    @InjectRepository(Ficha)
    private readonly fichaRepo: Repository<Ficha>,
    @InjectRepository(FichaInstructor)
    private readonly fiRepo: Repository<FichaInstructor>,
    private readonly senaAccess: SenaAccessService,
  ) {}

  private readonly relations = {
    company: true,
    competencias: true,
    instructores: { instructor: true },
  };

  async create(dto: CreateFichaDto): Promise<Ficha> {
    const { instructorIds, ...data } = dto;
    const ficha = this.fichaRepo.create(data);
    const saved = await this.fichaRepo.save(ficha);
    if (instructorIds?.length) {
      await this.asignarInstructores(saved.id, instructorIds);
    }
    return this.findOne(saved.id);
  }

  async findAll(
    pagination: PaginationDto,
    currentUser: User,
  ): Promise<{
    data: Ficha[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const visible = await this.senaAccess.visibleFichaIds(currentUser);
    const where: Record<string, unknown> = {};
    if (visible !== null) {
      where.id = In(visible);
    }
    const [data, total] = await this.fichaRepo.findAndCount({
      where,
      relations: this.relations,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string, currentUser?: User): Promise<Ficha> {
    const ficha = await this.fichaRepo.findOne({
      where: { id },
      relations: this.relations,
    });
    if (!ficha) throw new NotFoundException('Ficha no encontrada');
    if (currentUser) {
      const puede = await this.senaAccess.canAccessFicha(currentUser, id);
      if (!puede) {
        throw new ForbiddenException('No tienes acceso a esa ficha');
      }
    }
    return ficha;
  }

  async update(
    id: string,
    dto: UpdateFichaDto,
    currentUser: User,
  ): Promise<Ficha> {
    await this.findOne(id, currentUser);
    const { instructorIds, ...data } = dto;
    await this.fichaRepo.update(id, data);
    if (instructorIds) {
      await this.fiRepo.delete({ fichaId: id });
      if (instructorIds.length) {
        await this.asignarInstructores(id, instructorIds);
      }
    }
    return this.findOne(id);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    await this.findOne(id, currentUser);
    await this.fiRepo.delete({ fichaId: id });
    await this.fichaRepo.delete(id);
  }

  private async asignarInstructores(
    fichaId: string,
    instructorIds: string[],
  ): Promise<void> {
    const rows = instructorIds.map((instructorId) =>
      this.fiRepo.create({ fichaId, instructorId }),
    );
    await this.fiRepo.save(rows);
  }

  async cerrarVencidas(): Promise<number> {
    const hoy = new Date();
    const fichas = await this.fichaRepo.find({ where: { status: 'active' } });
    const vencidas = fichas.filter((f) => new Date(f.endDate) < hoy);
    if (!vencidas.length) return 0;
    const userRepo = this.fichaRepo.manager.getRepository(User);
    for (const ficha of vencidas) {
      await this.fichaRepo.update(ficha.id, { status: 'egresado' });
      await userRepo.update(
        { fichaId: ficha.id },
        { esVocero: false, esVoceroSuplente: false },
      );
    }
    return vencidas.length;
  }
}
