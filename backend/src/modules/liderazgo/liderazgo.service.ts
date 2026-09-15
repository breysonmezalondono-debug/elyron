import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { FichaAnuncio } from './entities/ficha-anuncio.entity';
import { Inquietud } from './entities/ficha-inquietud.entity';
import { CreateAnuncioDto } from './dto/anuncio.dto';
import {
  CreateInquietudDto,
  UpdateInquietudEstadoDto,
} from './dto/inquietud.dto';

@Injectable()
export class LiderazgoService {
  constructor(
    @InjectRepository(FichaAnuncio)
    private readonly anuncioRepo: Repository<FichaAnuncio>,
    @InjectRepository(Inquietud)
    private readonly inquietudRepo: Repository<Inquietud>,
  ) {}

  private assertLider(user: User): void {
    if (!user.esVocero && !user.esVoceroSuplente) {
      throw new ForbiddenException(
        'Solo la vocera o el colíder gestionan la representación de la ficha',
      );
    }
  }

  private assertEnFicha(user: User): string {
    if (!user.fichaId) {
      throw new BadRequestException('No tienes una ficha asignada');
    }
    return user.fichaId;
  }

  listarAnuncios(user: User): Promise<FichaAnuncio[]> {
    const fichaId = this.assertEnFicha(user);
    return this.anuncioRepo.find({
      where: { fichaId },
      relations: { autor: true },
      order: { createdAt: 'DESC' },
    });
  }

  crearAnuncio(dto: CreateAnuncioDto, user: User): Promise<FichaAnuncio> {
    this.assertLider(user);
    const fichaId = this.assertEnFicha(user);
    const anuncio = this.anuncioRepo.create({
      titulo: dto.titulo,
      contenido: dto.contenido,
      prioridad: dto.prioridad ?? 'media',
      categoria: dto.categoria ?? 'anuncio',
      autorId: user.id,
      fichaId,
    });
    return this.anuncioRepo.save(anuncio);
  }

  async eliminarAnuncio(id: string, user: User): Promise<void> {
    const anuncio = await this.anuncioRepo.findOne({ where: { id } });
    if (!anuncio || anuncio.fichaId !== user.fichaId) {
      throw new NotFoundException('Anuncio no encontrado');
    }
    if (anuncio.autorId !== user.id) {
      throw new ForbiddenException('Solo el autor puede eliminar este anuncio');
    }
    await this.anuncioRepo.delete(id);
  }

  listarInquietudes(user: User): Promise<Inquietud[]> {
    const fichaId = this.assertEnFicha(user);
    return this.inquietudRepo.find({
      where: { fichaId },
      relations: { autor: true },
      order: { createdAt: 'DESC' },
    });
  }

  crearInquietud(dto: CreateInquietudDto, user: User): Promise<Inquietud> {
    this.assertLider(user);
    const fichaId = this.assertEnFicha(user);
    const inquietud = this.inquietudRepo.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      categoria: dto.categoria ?? 'general',
      estado: 'abierta',
      autorId: user.id,
      fichaId,
    });
    return this.inquietudRepo.save(inquietud);
  }

  async actualizarEstadoInquietud(
    id: string,
    dto: UpdateInquietudEstadoDto,
    user: User,
  ): Promise<Inquietud> {
    this.assertLider(user);
    const inquietud = await this.inquietudRepo.findOne({ where: { id } });
    if (!inquietud || inquietud.fichaId !== user.fichaId) {
      throw new NotFoundException('Inquietud no encontrada');
    }
    await this.inquietudRepo.update(id, { estado: dto.estado });
    return this.inquietudRepo.findOneOrFail({
      where: { id },
      relations: { autor: true },
    });
  }
}
