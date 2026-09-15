import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Calendar,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  GraduationCap,
  Library,
  Lock,
  Mail,
  School,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { AuthShell } from '../../components/elyron/AuthShell';
import { IconTile } from '../../components/elyron/IconTile';
import type { IconTileVariant } from '../../components/elyron/IconTile';
import { portalHomeForRole } from '../../model/permissions';
import { academicProfileService } from '../../services/academicProfileService';
import type {
  CrearPerfilSenaPayload,
  CrearPerfilUniversidadPayload,
  CrearPerfilColegioPayload,
  PerfilAcademicoRespuesta,
} from '../../services/academicProfileService';
import {
  estimarSena,
  estimarUniversidad,
  estimarColegio,
} from '../../utils/academicEstimator';
import { catalogoService } from '../../services/catalogoService';
import type { CatalogoAcademico, ValidacionCurso } from '../../services/catalogoService';
import { PROGRAMAS_SENA_ORDENADOS } from '../../model/programasSenaCatalogo';

type LearnerKey = 'aprendiz' | 'estudiante' | 'universitario';
type Paso = 'perfil' | 'identificacion' | 'formacion' | 'resultado';

interface LearnerProfile {
  key: LearnerKey;
  question: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: IconTileVariant;
  roleKey: string;
  institutionId: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const LEARNER_PROFILES: LearnerProfile[] = [
  {
    key: 'aprendiz',
    question: '¿Eres aprendiz SENA?',
    title: 'Aprendiz SENA',
    description: 'Programas de formación técnica y tecnológica del SENA.',
    icon: GraduationCap,
    accent: 'mint',
    roleKey: 'aprendiz',
    institutionId: 'inst-sena',
  },
  {
    key: 'estudiante',
    question: '¿Eres estudiante?',
    title: 'Estudiante de colegio',
    description: 'Estudiante de colegio, básica y media.',
    icon: School,
    accent: 'violet',
    roleKey: 'estudiante',
    institutionId: 'inst-colegio',
  },
  {
    key: 'universitario',
    question: '¿Eres universitario?',
    title: 'Estudiante universitario',
    description: 'Estudiante de educación superior universitaria.',
    icon: Library,
    accent: 'amber',
    roleKey: 'universitario',
    institutionId: 'inst-aurora',
  },
];

interface PasswordRequirement {
  label: string;
  test: (value: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: 'Al menos 8 caracteres', test: (value) => value.length >= 8 },
  { label: 'Una letra mayúscula', test: (value) => /[A-Z]/.test(value) },
  { label: 'Una letra minúscula', test: (value) => /[a-z]/.test(value) },
  { label: 'Un número', test: (value) => /\d/.test(value) },
  { label: 'Un carácter especial', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

/* Puntuación ponderada 0–100: longitud + variedad de caracteres. */
const passwordScore = (value: string): number => {
  if (!value) return 0;
  let puntos = 0;
  const longitud = value.length;
  if (longitud >= 8) puntos += 20;
  if (longitud >= 12) puntos += 15;
  if (longitud >= 16) puntos += 15;
  if (/[a-z]/.test(value)) puntos += 10;
  if (/[A-Z]/.test(value)) puntos += 10;
  if (/\d/.test(value)) puntos += 10;
  if (/[^A-Za-z0-9]/.test(value)) puntos += 10;
  const variedad =
    new Set([/[a-z]/.test(value), /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean)).size;
  puntos += variedad * 2;
  return Math.min(puntos, 100);
};

const STRENGTH_LABEL = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte', 'Excelente'];

const strengthMeta = (score: number): { label: string; color: string } => {
  if (score >= 85) return { label: STRENGTH_LABEL[5], color: 'bg-emerald-500' };
  if (score >= 65) return { label: STRENGTH_LABEL[4], color: 'bg-mint-500' };
  if (score >= 45) return { label: STRENGTH_LABEL[3], color: 'bg-mint-400' };
  if (score >= 25) return { label: STRENGTH_LABEL[2], color: 'bg-amber-400' };
  if (score >= 10) return { label: STRENGTH_LABEL[1], color: 'bg-red-400' };
  return { label: STRENGTH_LABEL[0], color: 'bg-red-500' };
};

const emailsMatch = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/* ============================================================
   VALIDACIÓN DE CAMPOS · Elyron
   Helpers reutilizables. El backend es la fuente de verdad final;
   aquí damos feedback inmediato sin romper el diseño.
   ============================================================ */

/** Número de documento: únicamente 9–10 dígitos numéricos, sin letras ni símbolos. */
const DOCUMENTO_REGEX = /^\d{9,10}$/;
const documentoEsValido = (value: string): boolean => DOCUMENTO_REGEX.test(value.trim());
/** Limpia el valor mientras se escribe: conserva solo dígitos y limita a 10. */
const limpiarDocumento = (value: string): string => value.replace(/\D/g, '').slice(0, 10);

/** Nombre / apellidos: letras (incluido español) y espacios, nombres compuestos. */
const NOMBRE_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/;
const nombreEsValido = (value: string): boolean => value.trim().length >= 2 && NOMBRE_REGEX.test(value.trim());

/** Teléfono: únicamente dígitos, 7–15, sin símbolos. */
const TELEFONO_REGEX = /^\d{7,15}$/;
const telefonoEsValido = (value: string): boolean => TELEFONO_REGEX.test(value.trim());
const limpiarTelefono = (value: string): string => value.replace(/\D/g, '').slice(0, 15);

/** Correo: formato válido, normalizado a minúsculas y sin espacios. */
const normalizarEmail = (value: string): string => value.trim().toLowerCase();

const TIPOS_DOCUMENTO = ['cc', 'ce', 'ti', 'rc', 'pasaporte'] as const;
const TIPOS_DOCUMENTO_COLEGIO = ['RC', 'TI', 'CE', 'CC'] as const;

const TIPOS_FORMACION = ['tecnico', 'tecnologo'] as const;
const ETAPAS_SENA = [
  'induccion',
  'lectiva',
  'productiva',
  'finalizacion',
  'certificacion',
] as const;
const ESTADOS_SENA = [
  'matriculado',
  'en_formacion',
  'etapa_productiva',
  'finalizado',
  'certificado',
  'retirado',
  'cancelado',
  'suspendido',
] as const;
const MODALIDADES_SENA = ['presencial', 'virtual', 'a_distancia', 'mixta'] as const;
const MODALIDADES_UNIVERSIDAD = ['presencial', 'virtual', 'a_distancia', 'mixta'] as const;
const JORNADAS = ['manana', 'tarde', 'noche', 'completa', 'fin_de_semana'] as const;
const NIVELES_UNIVERSIDAD = [
  'tecnico_profesional',
  'tecnologo',
  'profesional',
  'especializacion',
  'maestria',
  'doctorado',
  'otro',
] as const;
const ESTADOS_UNIVERSIDAD = [
  'activo',
  'matriculado',
  'en_formacion',
  'en_pausa',
  'aplazado',
  'en_practicas',
  'en_proyecto_grado',
  'egresado',
  'graduado',
  'retirado',
] as const;
const ESTADOS_COLEGIO = ['en_curso', 'finalizado', 'retirado'] as const;

const LABEL: Record<string, string> = {
  tecnico: 'Técnico',
  tecnologo: 'Tecnólogo',
  induccion: 'Inducción',
  lectiva: 'Formación lectiva',
  productiva: 'Etapa productiva',
  finalizacion: 'Finalización',
  certificacion: 'Certificación',
  matriculado: 'Matriculado',
  en_formacion: 'En formación',
  etapa_productiva: 'Etapa productiva',
  finalizado: 'Finalizado',
  certificado: 'Certificado',
  retirado: 'Retirado',
  cancelado: 'Cancelado',
  suspendido: 'Suspendido',
  presencial: 'Presencial',
  virtual: 'Virtual',
  a_distancia: 'A distancia',
  mixta: 'Mixta',
  manana: 'Mañana',
  tarde: 'Tarde',
  noche: 'Noche',
  completa: 'Completa',
  fin_de_semana: 'Fin de semana',
  tecnico_profesional: 'Técnico profesional',
  profesional: 'Profesional',
  especializacion: 'Especialización',
  maestria: 'Maestría',
  doctorado: 'Doctorado',
  otro: 'Otro',
  activo: 'Activo',
  en_pausa: 'En pausa',
  aplazado: 'Aplazado',
  en_practicas: 'En prácticas',
  en_proyecto_grado: 'En proyecto de grado',
  egresado: 'Egresado',
  graduado: 'Graduado',
  en_curso: 'En curso',
};

const CONFIANZA_LABEL: Record<string, { label: string; dot: string }> = {
  verificada: { label: 'Verificada', dot: 'bg-emerald-500' },
  declarada: { label: 'Declarada', dot: 'bg-amber-400' },
  calculada: { label: 'Calculada', dot: 'bg-sky-500' },
  no_verificada: { label: 'No verificada', dot: 'bg-red-500' },
};

const formatError = (err: unknown): string => {
  if (isAxiosError(err)) {
    // Sin respuesta del servidor = el backend no está accesible.
    if (!err.response) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo e inténtalo de nuevo.';
    }
    const message = err.response.data?.message;
    if (Array.isArray(message) && message.length > 0) return String(message[0]);
    if (typeof message === 'string') return message;
    const status = err.response.status;
    if (status === 403) {
      return 'Demasiados intentos en poco tiempo. Espera unos minutos y vuelve a intentarlo.';
    }
  }
  // El interceptor de api.js convierte los errores del servidor en `ApiError`
  // (no es un error de axios), así que aquí se pierde el mensaje real.
  // Extraemos el mensaje del ApiError para mostrar el motivo verdadero.
  const candidate = err as { message?: unknown; data?: { message?: unknown } } | null;
  const realMessage = candidate?.data?.message ?? candidate?.message;
  if (typeof realMessage === 'string') return realMessage;
  if (Array.isArray(realMessage) && realMessage.length > 0) return String(realMessage[0]);
  return 'No fue posible completar el registro. Intenta de nuevo.';
};

interface IdentificacionState {
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
}

interface FormacionSenaState {
  tipoFormacion: string;
  programaFormacion: string;
  numeroFicha: string;
  centroFormacion: string;
  regional: string;
  ciudad: string;
  modalidad: string;
  jornada: string;
  estadoAcademico: string;
  etapa: string;
  rolFicha: 'ninguno' | 'lider' | 'colider';
}

interface FormacionUniversidadState {
  universidad: string;
  programaAcademico: string;
  nivelAcademico: string;
  anioIngreso: string;
  periodoIngreso: string;
  jornada: string;
  modalidad: string;
  creditosPrograma: string;
  creditosAprobados: string;
  semestre: string;
  totalSemestres: string;
  estadoAcademico: string;
}

interface FormacionColegioState {
  codigoCurso: string;
  colegio: string;
  grado: string;
  jornada: string;
  anioAcademico: string;
  ciudad: string;
  estadoAcademico: string;
}

const IDENTIFICACION_INICIAL: IdentificacionState = {
  tipoDocumento: 'cc',
  numeroDocumento: '',
  nombres: '',
  apellidos: '',
  telefono: '',
};

const FORMACION_SENA_INICIAL: FormacionSenaState = {
  tipoFormacion: 'tecnologo',
  programaFormacion: '',
  numeroFicha: '',
  centroFormacion: '',
  regional: '',
  ciudad: '',
  modalidad: '',
  jornada: '',
  estadoAcademico: 'en_formacion',
  etapa: 'lectiva',
  rolFicha: 'ninguno',
};

const FORMACION_UNIVERSIDAD_INICIAL: FormacionUniversidadState = {
  universidad: '',
  programaAcademico: '',
  nivelAcademico: 'profesional',
  anioIngreso: '',
  periodoIngreso: '1',
  jornada: '',
  modalidad: '',
  creditosPrograma: '',
  creditosAprobados: '',
  semestre: '',
  totalSemestres: '10',
  estadoAcademico: 'activo',
};

const FORMACION_COLEGIO_INICIAL: FormacionColegioState = {
  codigoCurso: '',
  colegio: '',
  grado: '',
  jornada: '',
  anioAcademico: String(new Date().getFullYear()),
  ciudad: '',
  estadoAcademico: 'en_curso',
};

const Field = ({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
      {label} {required && <span className="text-mint-600">*</span>}
    </label>
    {children}
    {hint && <p className="text-[11px] font-medium text-ink-400 dark:text-ink-500">{hint}</p>}
  </div>
);

const SelectField = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
}) => (
  <div className="relative">
    <select
      className="input appearance-none pr-10"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option} value={option}>
          {LABEL[option] ?? option}
        </option>
      ))}
    </select>
    <ChevronDown
      size={16}
      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400"
    />
  </div>
);

const ConfianzaBadge = ({ nivel }: { nivel: string }) => {
  const conf = CONFIANZA_LABEL[nivel] ?? CONFIANZA_LABEL.declarada;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-extrabold text-ink-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300">
      <span className={`size-2 rounded-full ${conf.dot}`} />
      {conf.label}
    </span>
  );
};

export const Register = () => {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [paso, setPaso] = useState<Paso>('perfil');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<PerfilAcademicoRespuesta | null>(null);
  const [catalogo, setCatalogo] = useState<CatalogoAcademico | null>(null);
  const [fichaValida, setFichaValida] = useState<ValidacionCurso | null>(null);
  const [fichaValidando, setFichaValidando] = useState(false);
  const [grupoValido, setGrupoValido] = useState<ValidacionCurso | null>(null);
  const [grupoValidando, setGrupoValidando] = useState(false);

  const [identificacion, setIdentificacion] = useState<IdentificacionState>(
    IDENTIFICACION_INICIAL,
  );
  const [formacionSena, setFormacionSena] = useState<FormacionSenaState>(
    FORMACION_SENA_INICIAL,
  );
  const [formacionUniversidad, setFormacionUniversidad] =
    useState<FormacionUniversidadState>(FORMACION_UNIVERSIDAD_INICIAL);
  const [formacionColegio, setFormacionColegio] = useState<FormacionColegioState>(
    FORMACION_COLEGIO_INICIAL,
  );

  const { register, isAuthenticated, activeRole } = useAuth();

  useEffect(() => {
    catalogoService.obtener().then(setCatalogo).catch(() => setCatalogo(null));
  }, []);

  if (isAuthenticated) {
    return <Navigate to={activeRole ? portalHomeForRole(activeRole) : '/seleccionar-rol'} replace />;
  }

  const setIdent = (patch: Partial<IdentificacionState>) =>
    setIdentificacion((prev) => ({ ...prev, ...patch }));
  const setSena = (patch: Partial<FormacionSenaState>) =>
    setFormacionSena((prev) => ({ ...prev, ...patch }));
  const setUni = (patch: Partial<FormacionUniversidadState>) =>
    setFormacionUniversidad((prev) => ({ ...prev, ...patch }));
  const setCol = (patch: Partial<FormacionColegioState>) =>
    setFormacionColegio((prev) => ({ ...prev, ...patch }));

  const validarFicha = async (codigo: string) => {
    const codigoTrim = codigo.trim();
    if (codigoTrim.length < 3) {
      setFichaValida(null);
      return;
    }
    setFichaValidando(true);
    setFichaValida(null);
    const res = await catalogoService.validarCurso(
      codigoTrim,
      'sena',
      formacionSena.programaFormacion || undefined,
    );
    setFichaValida(res);
    if (res.valido) {
      setSena({
        programaFormacion:
          formacionSena.programaFormacion || res.programa || '',
        tipoFormacion:
          res.tipoPrograma === 'tecnico' || res.tipoPrograma === 'tecnologo'
            ? res.tipoPrograma
            : formacionSena.tipoFormacion,
      });
    }
    setFichaValidando(false);
  };

  const validarGrupo = async (codigo: string) => {
    const codigoTrim = codigo.trim();
    if (codigoTrim.length < 2) {
      setGrupoValido(null);
      return;
    }
    setGrupoValidando(true);
    setGrupoValido(null);
    const res = await catalogoService.validarCurso(codigoTrim, 'colegio');
    setGrupoValido(res);
    if (res.valido && res.colegio) {
      setCol({
        colegio: res.colegio,
        grado: res.grado ? String(res.grado) : formacionColegio.grado,
      });
    }
    setGrupoValidando(false);
  };

  const allRequirementsMet = PASSWORD_REQUIREMENTS.every((requirement) =>
    requirement.test(password),
  );
  const score = passwordScore(password);
  const strength = strengthMeta(score);
  const passwordsCoinciden =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsNoCoinciden =
    confirmPassword.length > 0 && password !== confirmPassword;

  const estimacionSenaReal = useMemo(
    () =>
      fichaValida?.valido === true
        ? estimarSena(
            fichaValida.fechaInicio ?? null,
            fichaValida.duracionMeses ?? null,
          )
        : { fecha: null, etiqueta: null },
    [fichaValida],
  );

  const estimacionUni = useMemo(
    () =>
      estimarUniversidad({
        anioIngreso: formacionUniversidad.anioIngreso
          ? Number(formacionUniversidad.anioIngreso)
          : null,
        periodoIngreso: formacionUniversidad.periodoIngreso
          ? Number(formacionUniversidad.periodoIngreso)
          : null,
        semestreActual: formacionUniversidad.semestre
          ? Number(formacionUniversidad.semestre)
          : null,
        totalSemestres: formacionUniversidad.totalSemestres
          ? Number(formacionUniversidad.totalSemestres)
          : null,
      }),
    [formacionUniversidad],
  );

  const estimacionCol = useMemo(
    () => estimarColegio(formacionColegio.anioAcademico ? Number(formacionColegio.anioAcademico) : null),
    [formacionColegio.anioAcademico],
  );

  const regionalSena =
    catalogo?.regionales?.find((r) => r.id === formacionSena.regional) ?? null;

  const identificacionValida =
    identificacion.tipoDocumento &&
    documentoEsValido(identificacion.numeroDocumento) &&
    nombreEsValido(identificacion.nombres) &&
    nombreEsValido(identificacion.apellidos) &&
    (!identificacion.telefono || telefonoEsValido(identificacion.telefono));

  const formacionSenaValida =
    fichaValida?.valido === true &&
    formacionSena.programaFormacion.trim().length >= 2 &&
    formacionSena.centroFormacion.trim().length >= 2;

  const formacionUniValida =
    formacionUniversidad.universidad.trim().length >= 2 &&
    formacionUniversidad.programaAcademico.trim().length >= 2 &&
    formacionUniversidad.anioIngreso.length >= 4;

  const formacionColValida =
    formacionColegio.colegio.trim().length >= 2 &&
    formacionColegio.grado !== '' &&
    formacionColegio.jornada !== '' &&
    grupoValido?.valido === true;

  const credencialesValidas =
    emailsMatch(email.trim()) &&
    allRequirementsMet &&
    password === confirmPassword &&
    acceptedTerms;

  const irSiguiente = () => {
    setError('');
    if (paso === 'identificacion' && !identificacionValida) {
      setError(
        !documentoEsValido(identificacion.numeroDocumento)
          ? 'El número de documento debe contener entre 9 y 10 dígitos.'
          : !nombreEsValido(identificacion.nombres) || !nombreEsValido(identificacion.apellidos)
            ? 'Ingresa un nombre y apellido válidos.'
            : 'Completa los datos de identificación correctamente.',
      );
      return;
    }
    if (paso === 'formacion') {
      if (profile?.key === 'aprendiz' && !formacionSenaValida) {
        setError('Completa la información de formación (programa, ficha y centro).');
        return;
      }
      if (profile?.key === 'universitario' && !formacionUniValida) {
        setError('Completa la información universitaria (universidad, programa y año de ingreso).');
        return;
      }
      if (profile?.key === 'estudiante' && !formacionColValida) {
        setError('Completa la información del colegio (colegio, grado y jornada).');
        return;
      }
    }
    setPaso((prev) => (prev === 'perfil' ? 'identificacion' : prev === 'identificacion' ? 'formacion' : 'resultado'));
  };

  const irAtras = () => {
    setError('');
    if (paso === 'identificacion') setPaso('perfil');
    else if (paso === 'formacion') setPaso('identificacion');
    else if (paso === 'resultado') setPaso('formacion');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!profile) return;
    if (!credencialesValidas) {
      if (!emailsMatch(email.trim())) setError('Ingresa un correo electrónico válido.');
      else if (!allRequirementsMet) setError('La contraseña no cumple los requisitos de seguridad.');
      else if (password !== confirmPassword) setError('Las contraseñas no coinciden.');
      else setError('Debes aceptar la política de privacidad y protección de datos.');
      return;
    }
    // Validación estricta de formación: nunca crear cuenta sin curso/ficha válida.
    if (profile.key === 'aprendiz' && !formacionSenaValida) {
      setError('Debes ingresar y validar un número de ficha válido antes de crear tu cuenta.');
      return;
    }
    if (profile.key === 'estudiante' && !formacionColValida) {
      setError('Debes ingresar y validar el código de tu curso antes de crear tu cuenta.');
      return;
    }
    if (profile.key === 'universitario' && !formacionUniValida) {
      setError('Debes completar tu información universitaria antes de crear tu cuenta.');
      return;
    }

    setLoading(true);
    try {
      const [firstName, ...restLastName] = identificacion.nombres.trim().split(/\s+/);
      const lastName = restLastName.join(' ') || identificacion.apellidos.trim();
      await register(`${firstName} ${lastName}`.trim(), email.trim(), password, {
        roleKey: profile.roleKey,
        institutionId: profile.institutionId,
      });

      let perfil: PerfilAcademicoRespuesta;
      if (profile.key === 'aprendiz') {
        const payload: CrearPerfilSenaPayload = {
          tipoDocumento: identificacion.tipoDocumento,
          numeroDocumento: identificacion.numeroDocumento.trim(),
          nombres: identificacion.nombres.trim(),
          apellidos: identificacion.apellidos.trim(),
          telefono: identificacion.telefono || undefined,
          tipoFormacion: formacionSena.tipoFormacion as 'tecnico' | 'tecnologo',
          programaFormacion: formacionSena.programaFormacion.trim(),
          numeroFicha: formacionSena.numeroFicha.trim(),
          centroFormacion: formacionSena.centroFormacion.trim(),
          regional: formacionSena.regional || undefined,
          ciudad: formacionSena.ciudad || undefined,
          modalidad: formacionSena.modalidad || undefined,
          jornada: formacionSena.jornada || undefined,
          estadoAcademico: formacionSena.estadoAcademico,
          etapa: formacionSena.etapa,
          esLider: formacionSena.rolFicha === 'lider',
          esColider: formacionSena.rolFicha === 'colider',
        };
        perfil = await academicProfileService.crearSena(payload);
      } else if (profile.key === 'universitario') {
        const payload: CrearPerfilUniversidadPayload = {
          tipoDocumento: identificacion.tipoDocumento,
          numeroDocumento: identificacion.numeroDocumento.trim(),
          nombres: identificacion.nombres.trim(),
          apellidos: identificacion.apellidos.trim(),
          telefono: identificacion.telefono || undefined,
          universidad: formacionUniversidad.universidad.trim(),
          programaAcademico: formacionUniversidad.programaAcademico.trim(),
          nivelAcademico: formacionUniversidad.nivelAcademico,
          anioIngreso: Number(formacionUniversidad.anioIngreso),
          periodoIngreso: Number(formacionUniversidad.periodoIngreso),
          jornada: formacionUniversidad.jornada || undefined,
          modalidad: formacionUniversidad.modalidad || undefined,
          creditosPrograma: formacionUniversidad.creditosPrograma
            ? Number(formacionUniversidad.creditosPrograma)
            : undefined,
          creditosAprobados: formacionUniversidad.creditosAprobados
            ? Number(formacionUniversidad.creditosAprobados)
            : undefined,
          semestre: Number(formacionUniversidad.semestre),
          totalSemestres: formacionUniversidad.totalSemestres
            ? Number(formacionUniversidad.totalSemestres)
            : undefined,
          estadoAcademico: formacionUniversidad.estadoAcademico,
        };
        perfil = await academicProfileService.crearUniversidad(payload);
      } else {
        const payload: CrearPerfilColegioPayload = {
          tipoDocumento: identificacion.tipoDocumento,
          numeroDocumento: identificacion.numeroDocumento.trim(),
          nombres: identificacion.nombres.trim(),
          apellidos: identificacion.apellidos.trim(),
          telefono: identificacion.telefono || undefined,
          colegio: formacionColegio.colegio.trim(),
          grado: Number(formacionColegio.grado),
          jornada: formacionColegio.jornada,
          anioAcademico: Number(formacionColegio.anioAcademico),
          ciudad: formacionColegio.ciudad || undefined,
          estadoAcademico: formacionColegio.estadoAcademico,
        };
        perfil = await academicProfileService.crearColegio(payload);
      }

      setResultado(perfil);
      setPaso('resultado');
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const perfilSenaResultado = profile?.key === 'aprendiz' ? formacionSena : null;
  const perfilUniResultado = profile?.key === 'universitario' ? formacionUniversidad : null;
  const perfilColResultado = profile?.key === 'estudiante' ? formacionColegio : null;

  return (
    <AuthShell
      eyebrow="Crear cuenta"
      title={
        paso === 'perfil'
          ? 'Cuéntanos quién eres'
          : paso === 'identificacion'
            ? 'Tu identificación'
            : paso === 'formacion'
              ? 'Tu formación académica'
              : 'Perfil académico creado'
      }
      subtitle={
        paso === 'perfil'
          ? 'Solo aceptamos cuentas de aprendizaje. Responde para abrir la tuya:'
          : paso === 'resultado'
            ? 'Elyron construyó tu trayectoria y calculó tu finalización estimada.'
            : 'Estos datos identifican tu cuenta y alimentan tu trayectoria académica.'
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {paso === 'perfil' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="space-y-3"
          >
            {LEARNER_PROFILES.map((option, index) => (
              <motion.button
                key={option.key}
                type="button"
                onClick={() => {
                  setProfile(option);
                  setIdent({
                    tipoDocumento: option.key === 'estudiante' ? 'CC' : 'cc',
                  });
                  setPaso('identificacion');
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.35, ease: EASE }}
                className="group flex w-full items-center gap-4 rounded-[22px] border border-line bg-white p-4 text-left transition-all duration-300 ease-deluxe hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift dark:border-ink-700 dark:bg-ink-900 dark:hover:border-ink-600"
              >
                <IconTile icon={option.icon} variant={option.accent} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-extrabold tracking-tight text-ink-900 dark:text-white">
                    {option.question}
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-ink-500 dark:text-ink-400">
                    {option.title} · {option.description}
                  </span>
                </span>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-ink-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-mint-500 dark:text-ink-600"
                />
              </motion.button>
            ))}

            <p className="flex items-center gap-2 rounded-2xl bg-canvas-deep/40 px-4 py-3 text-[11px] font-bold text-ink-500 dark:bg-ink-900/60 dark:text-ink-400">
              <ShieldCheck size={14} className="shrink-0 text-mint-500" />
              Las cuentas de instructor, coordinador y administración las crea tu institución.
            </p>
          </motion.div>
        )}

        {paso === 'identificacion' && profile && (
          <motion.div
            key="identificacion"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="space-y-4"
          >
            <button
              type="button"
              onClick={irAtras}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-500 transition-colors hover:text-ink-900 dark:text-ink-400 dark:hover:text-white"
            >
              <ArrowLeft size={14} />
              Cambiar perfil
            </button>

            <div className="flex items-center gap-3 rounded-[18px] border border-mint-200 bg-mint-50/60 p-3 dark:border-mint-500/30 dark:bg-mint-500/10">
              <IconTile icon={profile.icon} variant={profile.accent} size="sm" />
              <span className="text-sm font-extrabold tracking-tight text-ink-900 dark:text-white">
                {profile.title}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  Tipo de documento <span className="text-mint-600">*</span>
                </label>
                <SelectField
                  value={identificacion.tipoDocumento}
                  onChange={(v) => setIdent({ tipoDocumento: v })}
                  options={profile.key === 'estudiante' ? TIPOS_DOCUMENTO_COLEGIO : TIPOS_DOCUMENTO}
                />
              </div>
              <Field label="Número de documento" required>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  className="input"
                  value={identificacion.numeroDocumento}
                  onChange={(e) => setIdent({ numeroDocumento: limpiarDocumento(e.target.value) })}
                  autoComplete="off"
                  placeholder="Ej: 1234567890"
                  required
                />
                {identificacion.numeroDocumento.length > 0 &&
                  !documentoEsValido(identificacion.numeroDocumento) && (
                    <p className="mt-1 text-[11px] font-semibold text-red-500">
                      El número de documento debe contener entre 9 y 10 dígitos.
                    </p>
                  )}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombres" required>
                <input
                  type="text"
                  className="input"
                  value={identificacion.nombres}
                  onChange={(e) =>
                    setIdent({
                      nombres: e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]/g, '').slice(0, 60),
                    })
                  }
                  autoComplete="given-name"
                  placeholder="Ej: Laura María"
                  required
                />
                {identificacion.nombres.length > 0 && !nombreEsValido(identificacion.nombres) && (
                  <p className="mt-1 text-[11px] font-semibold text-red-500">
                    Ingresa un nombre válido.
                  </p>
                )}
              </Field>
              <Field label="Apellidos" required>
                <input
                  type="text"
                  className="input"
                  value={identificacion.apellidos}
                  onChange={(e) =>
                    setIdent({
                      apellidos: e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]/g, '').slice(0, 60),
                    })
                  }
                  autoComplete="family-name"
                  placeholder="Ej: Gómez Ramírez"
                  required
                />
                {identificacion.apellidos.length > 0 && !nombreEsValido(identificacion.apellidos) && (
                  <p className="mt-1 text-[11px] font-semibold text-red-500">
                    Ingresa un apellido válido.
                  </p>
                )}
              </Field>
            </div>

            <Field label="Celular">
              <input
                type="tel"
                inputMode="numeric"
                maxLength={15}
                className="input"
                value={identificacion.telefono}
                onChange={(e) => setIdent({ telefono: limpiarTelefono(e.target.value) })}
                autoComplete="tel"
                placeholder="Ej: 3001234567"
              />
              {identificacion.telefono.length > 0 && !telefonoEsValido(identificacion.telefono) && (
                <p className="mt-1 text-[11px] font-semibold text-red-500">
                  Ingresa un número de teléfono válido (7 a 15 dígitos).
                </p>
              )}
            </Field>

            {error && (
              <p className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={irSiguiente}
              disabled={!identificacionValida}
              className="btn-pill btn-pill-mint w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}

        {paso === 'formacion' && profile && (
          <motion.div
            key="formacion"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="space-y-4"
          >
            <button
              type="button"
              onClick={irAtras}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-500 transition-colors hover:text-ink-900 dark:text-ink-400 dark:hover:text-white"
            >
              <ArrowLeft size={14} />
              Volver a identificación
            </button>

            <div className="flex items-center gap-3 rounded-[18px] border border-mint-200 bg-mint-50/60 p-3 dark:border-mint-500/30 dark:bg-mint-500/10">
              <IconTile icon={profile.icon} variant={profile.accent} size="sm" />
              <span className="text-sm font-extrabold tracking-tight text-ink-900 dark:text-white">
                {profile.title}
              </span>
            </div>

            {profile.key === 'aprendiz' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    ¿Qué tipo de formación realizas? <span className="text-mint-600">*</span>
                  </label>
                  <div className="relative grid grid-cols-2 gap-1 rounded-2xl bg-canvas-deep p-1 dark:bg-ink-900">
                    {TIPOS_FORMACION.map((tipo) => {
                      const activo = formacionSena.tipoFormacion === tipo;
                      return (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setSena({ tipoFormacion: tipo })}
                          className={`relative rounded-xl px-4 py-3 text-sm font-extrabold transition-colors duration-300 ${
                            activo
                              ? 'text-mint-700 dark:text-mint-300'
                              : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100'
                          }`}
                        >
                          {activo && (
                            <motion.span
                              layoutId="seg-sena-tipo"
                              className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-mint-200 dark:bg-ink-800 dark:ring-mint-500/30"
                              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                            />
                          )}
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {activo ? (
                              <motion.span
                                initial={{ scale: 0.4, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                              >
                                <GraduationCap size={15} />
                              </motion.span>
                            ) : (
                              <GraduationCap size={15} className="opacity-40" />
                            )}
                            {LABEL[tipo]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    Programa de formación <span className="text-mint-600">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="input appearance-none pr-10"
                      value={formacionSena.programaFormacion}
                      onChange={(e) => {
                        setSena({ programaFormacion: e.target.value });
                        if (fichaValida?.valido) setFichaValida(null);
                      }}
                    >
                      <option value="">Selecciona tu programa SENA</option>
                      {PROGRAMAS_SENA_ORDENADOS.map((programa) => (
                        <option key={programa.name} value={programa.name}>
                          {programa.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  </div>
                  <p className="text-[11px] font-medium text-ink-400 dark:text-ink-500">
                    Elige el programa que cursas en el SENA. Al validar tu ficha se asociará a este
                    programa.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    Número de ficha <span className="text-mint-600">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="input"
                    value={formacionSena.numeroFicha}
                    onChange={(e) => {
                      setSena({ numeroFicha: e.target.value.replace(/\D/g, '') });
                      if (e.target.value.replace(/\D/g, '').length < 6) setFichaValida(null);
                    }}
                    onBlur={() => validarFicha(formacionSena.numeroFicha)}
                    placeholder="Ej: 2451310"
                  />
                  <p className="text-[11px] font-medium text-ink-400 dark:text-ink-500">
                    Lo encuentras en tu matrícula de Sofía Plus. Al validarla, Elyron carga tu
                    programa y tus fechas oficiales.
                  </p>
                  {fichaValidando && (
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-400 dark:text-ink-500">
                      Validando ficha…
                    </p>
                  )}
                  {fichaValida?.valido === true && (
                    <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-mint-600 dark:text-mint-400">
                      <Check size={12} strokeWidth={3} />
                      Ficha válida · {fichaValida.nombre}
                      {fichaValida.programa ? ` · ${fichaValida.programa}` : ''}
                    </p>
                  )}
                  {fichaValida && fichaValida.valido === false && (
                    <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-red-500">
                      <X size={12} strokeWidth={3} />
                      {fichaValida.mensaje}
                    </p>
                  )}
                </div>

                {fichaValida?.valido === true && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="space-y-2 rounded-2xl border border-mint-200 bg-mint-50/60 p-4 dark:border-mint-500/30 dark:bg-mint-500/10"
                  >
                    <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-mint-700 dark:text-mint-400">
                      <ShieldCheck size={14} />
                      Datos de tu entidad
                    </p>
                    <ResumenFila label="Programa" value={formacionSena.programaFormacion} confianza="verificada" />
                    <ResumenFila label="Nivel" value={LABEL[formacionSena.tipoFormacion] ?? formacionSena.tipoFormacion} confianza="verificada" />
                    <ResumenFila
                      label="Inicio de formación"
                      value={fichaValida.fechaInicio?.split('-').reverse().join('/') ?? '—'}
                      confianza="verificada"
                    />
                    <ResumenFila label="Duración oficial" value={fichaValida.duracionMeses ? `${fichaValida.duracionMeses} meses` : '—'} confianza="verificada" />
                    {estimacionSenaReal.etiqueta && (
                      <ResumenFila label="Finalización estimada" value={estimacionSenaReal.etiqueta} confianza="calculada" />
                    )}
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    ¿Eres Líder o Colíder de tu ficha? <span className="text-mint-600">*</span>
                  </label>
                  <div className="relative grid grid-cols-3 gap-1 rounded-2xl bg-canvas-deep p-1 dark:bg-ink-900">
                    {(
                      [
                        { value: 'ninguno', label: 'Aprendiz', sub: 'Sin cargo' },
                        { value: 'lider', label: 'Líder', sub: '1 por ficha' },
                        { value: 'colider', label: 'Colíder', sub: '1 por ficha' },
                      ] as const
                    ).map((opcion) => {
                      const activo = formacionSena.rolFicha === opcion.value;
                      return (
                        <button
                          key={opcion.value}
                          type="button"
                          onClick={() => setSena({ rolFicha: opcion.value })}
                          className={`relative rounded-xl px-3 py-3 text-sm font-extrabold transition-colors duration-300 ${
                            activo
                              ? 'text-mint-700 dark:text-mint-300'
                              : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100'
                          }`}
                        >
                          {activo && (
                            <motion.span
                              layoutId="seg-sena-rol"
                              className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-mint-200 dark:bg-ink-800 dark:ring-mint-500/30"
                              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                            />
                          )}
                          <span className="relative z-10 block">
                            {opcion.label}
                            <span className="mt-0.5 block text-[10px] font-semibold text-ink-400 dark:text-ink-500">
                              {opcion.sub}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] font-medium text-ink-400 dark:text-ink-500">
                    Cada ficha tiene un solo Líder y un solo Colíder. Si el cargo ya está ocupado
                    en tu ficha, el registro será rechazado.
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl border border-line bg-canvas-deep/30 p-4 dark:border-ink-700 dark:bg-ink-900/40">
                  <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    <Calendar size={14} />
                    ¿Dónde estudias?
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      Regional SENA
                    </label>
                    <div className="relative">
                      <select
                        className="input appearance-none pr-10"
                        value={formacionSena.regional}
                        onChange={(e) => {
                          setSena({ regional: e.target.value, centroFormacion: '', ciudad: '' });
                          setFichaValida((prev) => prev);
                        }}
                      >
                        <option value="">Selecciona tu regional</option>
                        {(catalogo?.regionales ?? []).map((regional) => (
                          <option key={regional.id} value={regional.id}>
                            Regional {regional.nombre}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      Centro de formación <span className="text-mint-600">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className="input appearance-none pr-10"
                        value={formacionSena.centroFormacion}
                        disabled={!formacionSena.regional}
                        onChange={(e) => setSena({ centroFormacion: e.target.value })}
                      >
                        <option value="">
                          {formacionSena.regional ? 'Selecciona tu centro' : 'Primero elige la regional'}
                        </option>
                        {(regionalSena?.centros ?? []).map((centro) => (
                          <option key={centro} value={centro}>
                            {centro}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      Ciudad / municipio <span className="text-mint-600">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className="input appearance-none pr-10"
                        value={formacionSena.ciudad}
                        disabled={!formacionSena.regional}
                        onChange={(e) => setSena({ ciudad: e.target.value })}
                      >
                        <option value="">
                          {formacionSena.regional ? 'Selecciona tu ciudad' : 'Primero elige la regional'}
                        </option>
                        {(regionalSena?.municipios ?? []).map((ciudad) => (
                          <option key={ciudad} value={ciudad}>
                            {ciudad}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      Modalidad
                    </label>
                    <SelectField
                      value={formacionSena.modalidad}
                      onChange={(v) => setSena({ modalidad: v })}
                      options={MODALIDADES_SENA}
                      placeholder="Selecciona"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      Jornada
                    </label>
                    <SelectField
                      value={formacionSena.jornada}
                      onChange={(v) => setSena({ jornada: v })}
                      options={JORNADAS}
                      placeholder="Selecciona"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      Estado actual
                    </label>
                    <SelectField
                      value={formacionSena.estadoAcademico}
                      onChange={(v) => setSena({ estadoAcademico: v })}
                      options={ESTADOS_SENA}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      Etapa de formación
                    </label>
                    <SelectField
                      value={formacionSena.etapa}
                      onChange={(v) => setSena({ etapa: v })}
                      options={ETAPAS_SENA}
                    />
                  </div>
                </div>
              </div>
            )}


            {profile.key === 'universitario' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      Universidad <span className="text-mint-600">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className="input appearance-none pr-10"
                        value={formacionUniversidad.universidad}
                        onChange={(e) => setUni({ universidad: e.target.value })}
                      >
                        <option value="">Selecciona una universidad</option>
                        {(catalogo?.universidades ?? []).map((universidad) => (
                          <option key={universidad} value={universidad}>
                            {universidad}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                      />
                    </div>
                  </div>
                  <Field label="Programa académico" required>
                    <input
                      type="text"
                      className="input"
                      value={formacionUniversidad.programaAcademico}
                      onChange={(e) => setUni({ programaAcademico: e.target.value })}
                      placeholder="Ej: Ingeniería de Sistemas"
                    />
                  </Field>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    Nivel académico <span className="text-mint-600">*</span>
                  </label>
                  <SelectField
                    value={formacionUniversidad.nivelAcademico}
                    onChange={(v) => setUni({ nivelAcademico: v })}
                    options={NIVELES_UNIVERSIDAD}
                  />
                </div>

                <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-500/30 dark:bg-sky-500/10">
                  <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                    <Calendar size={14} />
                    Información de ingreso
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Field label="Año de ingreso" required>
                      <input
                        type="number"
                        min={1990}
                        max={2100}
                        className="input"
                        value={formacionUniversidad.anioIngreso}
                        onChange={(e) => setUni({ anioIngreso: e.target.value })}
                        placeholder="Ej: 2026"
                      />
                    </Field>
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                        Periodo
                      </label>
                      <SelectField
                        value={formacionUniversidad.periodoIngreso}
                        onChange={(v) => setUni({ periodoIngreso: v })}
                        options={['1', '2']}
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                        Jornada
                      </label>
                      <SelectField
                        value={formacionUniversidad.jornada}
                        onChange={(v) => setUni({ jornada: v })}
                        options={JORNADAS}
                        placeholder="Selecciona"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                        Modalidad
                      </label>
                      <SelectField
                        value={formacionUniversidad.modalidad}
                        onChange={(v) => setUni({ modalidad: v })}
                        options={MODALIDADES_UNIVERSIDAD}
                        placeholder="Selecciona"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-500/30 dark:bg-violet-500/10">
                  <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-violet-700 dark:text-violet-400">
                    <GraduationCap size={14} />
                    Progreso académico
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Field label="Semestre actual" required>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        className="input"
                        value={formacionUniversidad.semestre}
                        onChange={(e) => setUni({ semestre: e.target.value })}
                        placeholder="Ej: 3"
                      />
                    </Field>
                    <Field label="Semestres del programa">
                      <input
                        type="number"
                        min={1}
                        max={24}
                        className="input"
                        value={formacionUniversidad.totalSemestres}
                        onChange={(e) => setUni({ totalSemestres: e.target.value })}
                        placeholder="Ej: 10"
                      />
                    </Field>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Field label="Créditos del programa">
                      <input
                        type="number"
                        min={0}
                        max={400}
                        className="input"
                        value={formacionUniversidad.creditosPrograma}
                        onChange={(e) => setUni({ creditosPrograma: e.target.value })}
                      />
                    </Field>
                    <Field label="Créditos aprobados">
                      <input
                        type="number"
                        min={0}
                        max={400}
                        className="input"
                        value={formacionUniversidad.creditosAprobados}
                        onChange={(e) => setUni({ creditosAprobados: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      Estado académico
                    </label>
                    <SelectField
                      value={formacionUniversidad.estadoAcademico}
                      onChange={(v) => setUni({ estadoAcademico: v })}
                      options={ESTADOS_UNIVERSIDAD}
                    />
                  </div>
                  {estimacionUni.fecha && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-white/70 px-3 py-2 text-xs font-bold text-ink-600 dark:bg-ink-900/60 dark:text-ink-300">
                      <span>
                        Restantes:{' '}
                        <span className="text-violet-600 dark:text-violet-400">
                          {estimacionUni.semestresRestantes} semestres
                        </span>
                      </span>
                      <span>
                        Finalización estimada:{' '}
                        <span className="text-violet-600 dark:text-violet-400">
                          {estimacionUni.etiqueta}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {profile.key === 'estudiante' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      Código de curso <span className="text-mint-600">*</span>
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formacionColegio.codigoCurso}
                      onChange={(e) => {
                        setCol({ codigoCurso: e.target.value });
                        if (e.target.value.trim().length < 2) setGrupoValido(null);
                      }}
                      onBlur={() => validarGrupo(formacionColegio.codigoCurso)}
                      placeholder="Ej: 10-02"
                    />
                    {grupoValidando && (
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-400 dark:text-ink-500">
                        Validando curso…
                      </p>
                    )}
                    {grupoValido?.valido === true && (
                      <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-mint-600 dark:text-mint-400">
                        <Check size={12} strokeWidth={3} />
                        Curso válido · {grupoValido.nombre}
                        {grupoValido.colegio ? ` · ${grupoValido.colegio}` : ''}
                      </p>
                    )}
                    {grupoValido && grupoValido.valido === false && (
                      <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-red-500">
                        <X size={12} strokeWidth={3} />
                        {grupoValido.mensaje}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      Colegio <span className="text-mint-600">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className="input appearance-none pr-10"
                        value={formacionColegio.colegio}
                        onChange={(e) => setCol({ colegio: e.target.value })}
                        disabled={grupoValido?.valido !== true}
                      >
                        <option value="">{grupoValido?.valido === true ? 'Selecciona un colegio' : 'Valida tu código de curso'}</option>
                        {(catalogo?.colegios ?? []).map((colegio) => (
                          <option key={colegio} value={colegio}>
                            {colegio}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      Grado <span className="text-mint-600">*</span>
                    </label>
                    <SelectField
                      value={formacionColegio.grado}
                      onChange={(v) => setCol({ grado: v })}
                      options={['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']}
                      placeholder="Selecciona"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      Jornada <span className="text-mint-600">*</span>
                    </label>
                    <SelectField
                      value={formacionColegio.jornada}
                      onChange={(v) => setCol({ jornada: v })}
                      options={JORNADAS}
                      placeholder="Selecciona"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Año académico">
                    <input
                      type="number"
                      min={1990}
                      max={2100}
                      className="input"
                      value={formacionColegio.anioAcademico}
                      onChange={(e) => setCol({ anioAcademico: e.target.value })}
                    />
                  </Field>
                  <Field label="Ciudad">
                    <input
                      type="text"
                      className="input"
                      value={formacionColegio.ciudad}
                      onChange={(e) => setCol({ ciudad: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    Estado académico
                  </label>
                  <SelectField
                    value={formacionColegio.estadoAcademico}
                    onChange={(v) => setCol({ estadoAcademico: v })}
                    options={ESTADOS_COLEGIO}
                  />
                </div>

                {estimacionCol.fecha && (
                  <div className="flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50/60 px-4 py-3 text-xs font-bold text-ink-600 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-ink-300">
                    <Calendar size={14} className="shrink-0 text-sky-600 dark:text-sky-400" />
                    Finalización estimada:{' '}
                    <span className="text-sky-600 dark:text-sky-400">{estimacionCol.etiqueta}</span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Correo electrónico <span className="text-mint-600">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  id="email"
                  type="email"
                  className="input"
                  style={{ paddingLeft: '2.75rem' }}
                  value={email}
                  onChange={(e) => setEmail(normalizarEmail(e.target.value))}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Contraseña <span className="text-mint-600">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-12"
                  style={{ paddingLeft: '2.75rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 transition hover:text-ink-700 dark:hover:text-white"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex h-1.5 flex-1 gap-1">
                      {[0, 1, 2, 3, 4].map((segment) => (
                        <span
                          key={segment}
                          className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                            segment < Math.round(score / 20) ? strength.color : 'bg-line dark:bg-ink-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                      {strength.label}
                    </span>
                  </div>
                  <ul className="grid grid-cols-1 gap-1">
                    {PASSWORD_REQUIREMENTS.map((requirement) => {
                      const met = requirement.test(password);
                      return (
                        <li
                          key={requirement.label}
                          className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors duration-300 ${
                            met ? 'text-mint-600 dark:text-mint-400' : 'text-ink-400 dark:text-ink-500'
                          }`}
                        >
                          {met ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                          {requirement.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Confirmar contraseña <span className="text-mint-600">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input pr-12"
                  style={{ paddingLeft: '2.75rem' }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 transition hover:text-ink-700 dark:hover:text-white"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordsCoinciden && (
                <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-mint-600 dark:text-mint-400">
                  <Check size={12} strokeWidth={3} />
                  Las contraseñas coinciden
                </p>
              )}
              {passwordsNoCoinciden && (
                <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-red-500">
                  <X size={12} strokeWidth={3} />
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 pt-0.5">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="sr-only"
              />
              <span
                className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-all duration-300 ${
                  acceptedTerms ? 'border-mint-500 bg-mint-500' : 'border-line-strong dark:border-ink-600'
                }`}
              >
                <svg viewBox="0 0 12 12" width={11} height={11} fill="none" className="text-white transition-opacity duration-200">
                  <path
                    d="M2.5 6L5 8.5L9.5 3.5"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: acceptedTerms ? 1 : 0 }}
                  />
                </svg>
              </span>
              <span className="text-xs font-bold leading-relaxed text-ink-600 dark:text-ink-300">
                He leído y acepto la política de privacidad y la protección de mis datos personales.
              </span>
            </label>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  !credencialesValidas ||
                  (profile.key === 'aprendiz' && !formacionSenaValida) ||
                  (profile.key === 'estudiante' && !formacionColValida) ||
                  (profile.key === 'universitario' && !formacionUniValida)
                }
                className="btn-pill btn-pill-mint w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Creando perfil académico…' : 'Crear cuenta y perfil académico'}
              </button>

              <p className="flex items-center justify-center gap-2 text-[11px] font-bold text-ink-400 dark:text-ink-500">
                <Lock size={12} />
                Contraseña cifrada con bcrypt · Datos cifrados · Token firmado con JWT
              </p>
            </form>
          </motion.div>
        )}

        {paso === 'resultado' && profile && resultado && (
          <motion.div
            key="resultado"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 rounded-[18px] border border-mint-200 bg-mint-50/60 p-3 dark:border-mint-500/30 dark:bg-mint-500/10">
              <IconTile icon={BadgeCheck} variant="mint" size="sm" />
              <span className="text-sm font-extrabold tracking-tight text-ink-900 dark:text-white">
                Perfil académico creado
              </span>
            </div>

            <div className="space-y-2.5 rounded-[22px] border border-line bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
              {profile.key === 'aprendiz' && perfilSenaResultado && (
                <>
                  <ResumenFila
                    label="Programa"
                    value={perfilSenaResultado.programaFormacion}
                    confianza="verificada"
                  />
                  <ResumenFila
                    label="Nivel"
                    value={LABEL[perfilSenaResultado.tipoFormacion]}
                    confianza="declarada"
                  />
                  <ResumenFila label="Ficha" value={perfilSenaResultado.numeroFicha} confianza="verificada" />
                  <ResumenFila
                    label="Inicio de formación"
                    value={fichaValida?.fechaInicio?.split('-').reverse().join('/') ?? '—'}
                    confianza="verificada"
                  />
                  <ResumenFila
                    label="Finalización estimada"
                    value={resultado.finalizacionEstimada}
                    confianza="calculada"
                  />
                  <ResumenFila
                    label="Etapa"
                    value={LABEL[perfilSenaResultado.etapa]}
                    confianza="declarada"
                  />
                  <ResumenFila
                    label="Estado"
                    value={LABEL[perfilSenaResultado.estadoAcademico]}
                    confianza="declarada"
                  />
                </>
              )}
              {profile.key === 'universitario' && perfilUniResultado && (
                <>
                  <ResumenFila
                    label="Universidad"
                    value={perfilUniResultado.universidad}
                    confianza="declarada"
                  />
                  <ResumenFila
                    label="Programa"
                    value={perfilUniResultado.programaAcademico}
                    confianza="declarada"
                  />
                  <ResumenFila
                    label="Nivel"
                    value={LABEL[perfilUniResultado.nivelAcademico]}
                    confianza="declarada"
                  />
                  <ResumenFila
                    label="Semestre"
                    value={`${perfilUniResultado.semestre} de ${perfilUniResultado.totalSemestres}`}
                    confianza="declarada"
                  />
                  <ResumenFila
                    label="Restantes"
                    value={`${resultado.semestresRestantes ?? estimacionUni.semestresRestantes} semestres`}
                    confianza="calculada"
                  />
                  <ResumenFila
                    label="Finalización estimada"
                    value={resultado.finalizacionEstimada}
                    confianza="calculada"
                  />
                  <ResumenFila
                    label="Estado"
                    value={LABEL[perfilUniResultado.estadoAcademico]}
                    confianza="declarada"
                  />
                </>
              )}
              {profile.key === 'estudiante' && perfilColResultado && (
                <>
                  <ResumenFila
                    label="Institución"
                    value={perfilColResultado.colegio}
                    confianza="declarada"
                  />
                  <ResumenFila
                    label="Grado"
                    value={`${perfilColResultado.grado}°`}
                    confianza="declarada"
                  />
                  <ResumenFila
                    label="Año"
                    value={perfilColResultado.anioAcademico}
                    confianza="declarada"
                  />
                  <ResumenFila
                    label="Finalización estimada"
                    value={resultado.finalizacionEstimada}
                    confianza="calculada"
                  />
                  <ResumenFila
                    label="Estado"
                    value={LABEL[perfilColResultado.estadoAcademico]}
                    confianza="declarada"
                  />
                </>
              )}
            </div>

            <p className="flex items-center gap-2 rounded-2xl bg-canvas-deep/40 px-4 py-3 text-[11px] font-bold text-ink-500 dark:bg-ink-900/60 dark:text-ink-400">
              <ShieldCheck size={14} className="shrink-0 text-mint-500" />
              La fecha mostrada es una estimación calculada, no una certificación.
            </p>

            <button
              type="button"
              onClick={() => {
                if (activeRole) window.location.assign(portalHomeForRole(activeRole));
              }}
              className="btn-pill btn-pill-mint w-full justify-center"
            >
              Ir a mi campus
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-sm font-medium text-ink-500 dark:text-ink-400">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-bold text-mint-600 transition-colors hover:text-mint-700 dark:text-mint-400 dark:hover:text-mint-500">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
};

const ResumenFila = ({
  label,
  value,
  confianza,
}: {
  label: string;
  value?: string | number | null;
  confianza: string;
}) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs font-bold text-ink-500 dark:text-ink-400">{label}</span>
    <span className="flex items-center gap-2 text-right text-sm font-extrabold text-ink-900 dark:text-white">
      {value || '—'}
      <ConfianzaBadge nivel={confianza} />
    </span>
  </div>
);