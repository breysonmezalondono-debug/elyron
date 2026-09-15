import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Ficha } from '../fichas/ficha.entity';
import { FichaInstructor } from './entities/ficha-instructor.entity';
import { Remision } from './entities/remision.entity';
import { SENA_ROLES } from '../../common/constants/roles';

export type ChatDecision = {
  allowed: boolean;
  reason?: string;
  fichaId?: string | null;
};

const ROL = SENA_ROLES;

function isVocero(u: User): boolean {
  return Boolean(u.esVocero || u.esVoceroSuplente);
}

function isAprendiz(u: User): boolean {
  return u.role?.name === ROL.APRENDIZ || (!u.role && u.roleId != null);
}

@Injectable()
export class SenaAccessService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Ficha)
    private readonly fichaRepo: Repository<Ficha>,
    @InjectRepository(FichaInstructor)
    private readonly fiRepo: Repository<FichaInstructor>,
    @InjectRepository(Remision)
    private readonly remisionRepo: Repository<Remision>,
  ) {}

  getUserRoleName(user: User): string {
    return user.role?.name ?? '';
  }

  async visibleFichaIds(user: User): Promise<string[] | null> {
    const role = this.getUserRoleName(user);
    if (
      role === ROL.ADMINISTRADOR ||
      role === ROL.COORDINADOR ||
      role === ROL.BIENESTAR
    ) {
      return null;
    }
    if (role === ROL.INSTRUCTOR) {
      const rows = await this.fiRepo.find({
        where: { instructorId: user.id, activo: true },
      });
      return rows.map((r) => r.fichaId);
    }
    if (isAprendiz(user)) {
      return user.fichaId ? [user.fichaId] : [];
    }
    return [];
  }

  async canAccessFicha(user: User, fichaId: string): Promise<boolean> {
    if (!fichaId) return false;
    const visible = await this.visibleFichaIds(user);
    if (visible === null) return true;
    return visible.includes(fichaId);
  }

  async instructoresDeFicha(fichaId: string): Promise<User[]> {
    const rows = await this.fiRepo.find({
      where: { fichaId, activo: true },
      relations: { instructor: true },
    });
    return rows.map((r) => r.instructor);
  }

  private async instructorDictaFicha(
    instructorId: string,
    fichaId: string,
  ): Promise<boolean> {
    if (!fichaId) return false;
    const count = await this.fiRepo.count({
      where: { instructorId, fichaId, activo: true },
    });
    return count > 0;
  }

  private async remisionActiva(
    aprendizId: string,
    responsableId: string,
  ): Promise<Remision | null> {
    return this.remisionRepo.findOne({
      where: { aprendizId, responsableId, chatActivo: true },
    });
  }

  async canChatBetween(sender: User, receiver: User): Promise<ChatDecision> {
    const sr = this.getUserRoleName(sender);
    const rr = this.getUserRoleName(receiver);

    if (sender.institucion !== 'sena' || receiver.institucion !== 'sena') {
      return {
        allowed: false,
        reason: 'Mensajería permitida solo dentro del SENA',
      };
    }

    if (sr === ROL.ADMINISTRADOR) {
      return {
        allowed: true,
        reason: 'Administrador',
        fichaId: sender.fichaId ?? null,
      };
    }
    if (rr === ROL.ADMINISTRADOR) {
      const allowedSenders = [ROL.COORDINADOR, ROL.BIENESTAR, ROL.INSTRUCTOR];
      if (sr === ROL.APRENDIZ) {
        return isVocero(sender)
          ? {
              allowed: true,
              reason: 'Vocero con administrador',
              fichaId: sender.fichaId,
            }
          : {
              allowed: false,
              reason: 'El aprendiz debe ser vocero para escribir',
            };
      }
      if (allowedSenders.includes(sr as (typeof allowedSenders)[number])) {
        return {
          allowed: true,
          reason: `Rol ${sr} con administrador`,
          fichaId: null,
        };
      }
      return { allowed: false, reason: 'No autorizado' };
    }

    if (sr === ROL.COORDINADOR) {
      if (rr === ROL.INSTRUCTOR || rr === ROL.BIENESTAR) {
        return {
          allowed: true,
          reason: 'Coordinador con equipo',
          fichaId: null,
        };
      }
      if (rr === ROL.APRENDIZ) {
        return {
          allowed: true,
          reason: 'Coordinador supervisa al aprendiz',
          fichaId: receiver.fichaId,
        };
      }
      if (rr === ROL.ADMINISTRADOR) {
        return {
          allowed: true,
          reason: 'Coordinador con admin',
          fichaId: null,
        };
      }
      return { allowed: false, reason: 'No autorizado' };
    }
    if (rr === ROL.COORDINADOR) {
      if (sr === ROL.INSTRUCTOR || sr === ROL.BIENESTAR) {
        return {
          allowed: true,
          reason: 'Equipo con coordinador',
          fichaId: null,
        };
      }
      if (sr === ROL.APRENDIZ) {
        return isVocero(sender)
          ? {
              allowed: true,
              reason: 'Vocero con coordinador',
              fichaId: sender.fichaId,
            }
          : {
              allowed: false,
              reason: 'El aprendiz debe ser vocero para escribir',
            };
      }
      if (sr === ROL.ADMINISTRADOR) {
        return {
          allowed: true,
          reason: 'Admin con coordinador',
          fichaId: null,
        };
      }
      return { allowed: false, reason: 'No autorizado' };
    }

    if (sr === ROL.BIENESTAR) {
      if (rr === ROL.APRENDIZ) {
        const remision = await this.remisionActiva(receiver.id, sender.id);
        if (remision) {
          return {
            allowed: true,
            reason: 'Bienestar con aprendiz postulado',
            fichaId: receiver.fichaId,
          };
        }
        return {
          allowed: false,
          reason: 'Chat desactivado o aprendiz no postulado',
        };
      }
      if (rr === ROL.COORDINADOR || rr === ROL.ADMINISTRADOR) {
        return {
          allowed: true,
          reason: 'Bienestar con dirección',
          fichaId: null,
        };
      }
      return { allowed: false, reason: 'No autorizado' };
    }
    if (rr === ROL.BIENESTAR) {
      if (sr === ROL.APRENDIZ) {
        if (!isVocero(sender)) {
          return {
            allowed: false,
            reason: 'El aprendiz debe ser vocero para escribir',
          };
        }
        const remision = await this.remisionActiva(sender.id, receiver.id);
        if (remision) {
          return {
            allowed: true,
            reason: 'Vocero con bienestar',
            fichaId: sender.fichaId,
          };
        }
        return {
          allowed: false,
          reason: 'Chat desactivado o aprendiz no postulado',
        };
      }
      if (sr === ROL.COORDINADOR || sr === ROL.ADMINISTRADOR) {
        return {
          allowed: true,
          reason: 'Dirección con bienestar',
          fichaId: null,
        };
      }
      return { allowed: false, reason: 'No autorizado' };
    }

    if (sr === ROL.INSTRUCTOR) {
      if (rr === ROL.APRENDIZ) {
        if (!isVocero(receiver)) {
          return {
            allowed: false,
            reason: 'Solo se comunica con voceros de la ficha',
          };
        }
        const dicta = await this.instructorDictaFicha(
          sender.id,
          receiver.fichaId,
        );
        return dicta
          ? {
              allowed: true,
              reason: 'Instructor con vocero de su ficha',
              fichaId: receiver.fichaId,
            }
          : { allowed: false, reason: 'El instructor no dicta esa ficha' };
      }
      return { allowed: false, reason: 'No autorizado' };
    }
    if (rr === ROL.INSTRUCTOR) {
      if (sr === ROL.APRENDIZ) {
        if (!isVocero(sender)) {
          return {
            allowed: false,
            reason: 'El aprendiz debe ser vocero para escribir',
          };
        }
        const dicta = await this.instructorDictaFicha(
          receiver.id,
          sender.fichaId,
        );
        return dicta
          ? {
              allowed: true,
              reason: 'Vocero con su instructor',
              fichaId: sender.fichaId,
            }
          : { allowed: false, reason: 'El instructor no dicta esa ficha' };
      }
      return { allowed: false, reason: 'No autorizado' };
    }

    if (sr === ROL.APRENDIZ) {
      if (!isVocero(sender)) {
        return {
          allowed: false,
          reason: 'El aprendiz solo lee y descarga, no escribe',
        };
      }
      if (rr === ROL.INSTRUCTOR) {
        const dicta = await this.instructorDictaFicha(
          receiver.id,
          sender.fichaId,
        );
        return dicta
          ? {
              allowed: true,
              reason: 'Vocero con instructor',
              fichaId: sender.fichaId,
            }
          : { allowed: false, reason: 'El instructor no dicta esa ficha' };
      }
      return { allowed: false, reason: 'No autorizado' };
    }

    return { allowed: false, reason: 'Combinación de roles no permitida' };
  }

  async fichaDeMensaje(sender: User, receiver: User): Promise<string | null> {
    if (sender.institucion !== 'sena') return null;
    const fichaId = sender.fichaId ?? receiver.fichaId ?? null;
    return fichaId;
  }
}
