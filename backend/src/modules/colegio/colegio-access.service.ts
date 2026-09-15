import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Grupo } from './entities/grupo.entity';
import { DocenteGrupo } from './entities/docente-grupo.entity';
import { RemisionColegio } from './entities/remision-colegio.entity';
import { COLEGIO_ROLES } from '../../common/constants/roles';

export type ChatDecision = {
  allowed: boolean;
  reason?: string;
  grupoId?: string | null;
};

const ROL = COLEGIO_ROLES;

function isPersonero(u: User): boolean {
  return Boolean(u.esPersonero || u.esPersoneroSuplente);
}

function isEstudiante(u: User): boolean {
  return u.role?.name === ROL.ESTUDIANTE;
}

function esEstudiante(role: string | undefined): boolean {
  return role === ROL.ESTUDIANTE;
}

function isDireccion(role: string | undefined): boolean {
  return (
    role === ROL.RECTOR ||
    role === ROL.COORDINADOR ||
    role === ROL.COORDINADOR_CONVIVENCIA
  );
}

@Injectable()
export class ColegioAccessService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Grupo)
    private readonly grupoRepo: Repository<Grupo>,
    @InjectRepository(DocenteGrupo)
    private readonly dgRepo: Repository<DocenteGrupo>,
    @InjectRepository(RemisionColegio)
    private readonly remisionRepo: Repository<RemisionColegio>,
  ) {}

  getUserRoleName(user: User): string {
    return user.role?.name ?? '';
  }

  async visibleGrupoIds(user: User): Promise<string[] | null> {
    const role = this.getUserRoleName(user);
    if (
      role === ROL.ADMINISTRADOR ||
      role === ROL.RECTOR ||
      role === ROL.COORDINADOR ||
      role === ROL.COORDINADOR_CONVIVENCIA ||
      role === ROL.ORIENTADOR
    ) {
      return null;
    }
    if (role === ROL.DOCENTE) {
      const rows = await this.dgRepo.find({
        where: { docenteId: user.id, activo: true },
      });
      return rows.map((r) => r.grupoId);
    }
    if (isEstudiante(user)) {
      return user.grupoId ? [user.grupoId] : [];
    }
    return [];
  }

  async canAccessGrupo(user: User, grupoId: string): Promise<boolean> {
    if (!grupoId) return false;
    const visible = await this.visibleGrupoIds(user);
    if (visible === null) return true;
    return visible.includes(grupoId);
  }

  async docentesDeGrupo(grupoId: string): Promise<User[]> {
    const rows = await this.dgRepo.find({
      where: { grupoId, activo: true },
      relations: { docente: true },
    });
    return rows.map((r) => r.docente);
  }

  private async docenteDictaGrupo(
    docenteId: string,
    grupoId: string,
  ): Promise<boolean> {
    if (!grupoId) return false;
    const count = await this.dgRepo.count({
      where: { docenteId, grupoId, activo: true },
    });
    return count > 0;
  }

  private async remisionActiva(
    estudianteId: string,
    responsableId: string,
  ): Promise<RemisionColegio | null> {
    return this.remisionRepo.findOne({
      where: { estudianteId, responsableId, chatActivo: true },
    });
  }

  async canChatBetween(sender: User, receiver: User): Promise<ChatDecision> {
    const sr = this.getUserRoleName(sender);
    const rr = this.getUserRoleName(receiver);

    if (
      sender.institucion !== 'colegio' ||
      receiver.institucion !== 'colegio'
    ) {
      return {
        allowed: false,
        reason: 'Mensajería permitida solo dentro del colegio',
      };
    }

    if (sr === ROL.ADMINISTRADOR || isDireccion(sr)) {
      return {
        allowed: true,
        reason: 'Dirección',
        grupoId: sender.grupoId ?? null,
      };
    }
    if (isDireccion(rr)) {
      if (sr === ROL.ORIENTADOR || sr === ROL.DOCENTE) {
        return { allowed: true, reason: 'Equipo con dirección', grupoId: null };
      }
      if (esEstudiante(sr)) {
        return isPersonero(sender)
          ? {
              allowed: true,
              reason: 'Personero con dirección',
              grupoId: sender.grupoId,
            }
          : {
              allowed: false,
              reason: 'El estudiante debe ser personero para escribir',
            };
      }
      return { allowed: false, reason: 'No autorizado' };
    }

    if (sr === ROL.ORIENTADOR) {
      if (rr === ROL.DOCENTE) {
        return {
          allowed: true,
          reason: 'Orientador con docente',
          grupoId: null,
        };
      }
      if (esEstudiante(rr)) {
        const remision = await this.remisionActiva(receiver.id, sender.id);
        if (remision) {
          return {
            allowed: true,
            reason: 'Orientador con estudiante remitido',
            grupoId: receiver.grupoId,
          };
        }
        return {
          allowed: false,
          reason: 'Chat desactivado o estudiante no postulado',
        };
      }
      return { allowed: false, reason: 'No autorizado' };
    }
    if (rr === ROL.ORIENTADOR) {
      if (sr === ROL.DOCENTE) {
        return {
          allowed: true,
          reason: 'Docente con orientador',
          grupoId: null,
        };
      }
      if (sr === ROL.ADMINISTRADOR || isDireccion(sr)) {
        return {
          allowed: true,
          reason: 'Dirección con orientador',
          grupoId: null,
        };
      }
      if (esEstudiante(sr)) {
        if (!isPersonero(sender)) {
          return {
            allowed: false,
            reason: 'El estudiante debe ser personero para escribir',
          };
        }
        const remision = await this.remisionActiva(sender.id, receiver.id);
        if (remision) {
          return {
            allowed: true,
            reason: 'Personero con orientador',
            grupoId: sender.grupoId,
          };
        }
        return {
          allowed: false,
          reason: 'Chat desactivado o estudiante no postulado',
        };
      }
      return { allowed: false, reason: 'No autorizado' };
    }

    if (sr === ROL.DOCENTE) {
      if (esEstudiante(rr)) {
        const dicta = await this.docenteDictaGrupo(sender.id, receiver.grupoId);
        return dicta
          ? {
              allowed: true,
              reason: 'Docente con sus estudiantes',
              grupoId: receiver.grupoId,
            }
          : {
              allowed: false,
              reason: 'El docente no dicta ese grupo',
            };
      }
      return { allowed: false, reason: 'No autorizado' };
    }
    if (rr === ROL.DOCENTE) {
      if (sr === ROL.ORIENTADOR) {
        return {
          allowed: true,
          reason: 'Orientador con docente',
          grupoId: null,
        };
      }
      if (!esEstudiante(sr)) {
        return { allowed: false, reason: 'No autorizado' };
      }
      if (!isPersonero(sender)) {
        return {
          allowed: false,
          reason: 'El estudiante debe ser personero para escribir',
        };
      }
      const dicta = await this.docenteDictaGrupo(receiver.id, sender.grupoId);
      return dicta
        ? {
            allowed: true,
            reason: 'Personero con su docente',
            grupoId: sender.grupoId,
          }
        : { allowed: false, reason: 'El docente no dicta ese grupo' };
    }

    if (esEstudiante(sr)) {
      if (!isPersonero(sender)) {
        return { allowed: false, reason: 'El estudiante solo lee, no escribe' };
      }
      if (rr === ROL.DOCENTE) {
        const dicta = await this.docenteDictaGrupo(receiver.id, sender.grupoId);
        return dicta
          ? {
              allowed: true,
              reason: 'Personero con docente de su grupo',
              grupoId: sender.grupoId,
            }
          : { allowed: false, reason: 'El docente no dicta su grupo' };
      }
      return { allowed: false, reason: 'No autorizado' };
    }

    return { allowed: false, reason: 'Combinación de roles no permitida' };
  }

  async grupoDeMensaje(sender: User, receiver: User): Promise<string | null> {
    if (sender.institucion !== 'colegio') return null;
    return sender.grupoId ?? receiver.grupoId ?? null;
  }
}
