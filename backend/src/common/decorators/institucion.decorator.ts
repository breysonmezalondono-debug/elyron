import { SetMetadata } from '@nestjs/common';
import { InstitucionName } from '../constants/instituciones';

export const INSTITUCION_KEY = 'institucion';
export const Institucion = (institucion: InstitucionName | InstitucionName[]) =>
  SetMetadata(INSTITUCION_KEY, institucion as string | string[]);
