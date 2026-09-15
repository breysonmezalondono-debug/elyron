import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Briefcase,
  ChevronDown,
  GraduationCap,
  Home,
  IdCard,
  Lock,
  Mail,
  Phone,
  Plus,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { cuentasService } from '../services/cuentasService';

export interface RolCreable {
  key: string;
  label: string;
  descripcion: string;
}

/** Roles que puede crear el ADMINISTRADOR (cualquier cargo). */
export const ROLES_ADMIN: RolCreable[] = [
  { key: 'coordinador', label: 'Coordinador', descripcion: 'Coordinación académica (SENA)' },
  { key: 'instructor', label: 'Instructor', descripcion: 'Instructor / formador (SENA)' },
  { key: 'bienestar_sena', label: 'Bienestar SENA', descripcion: 'Apoyo de sostenimiento / bienestar' },
  { key: 'docente', label: 'Docente', descripcion: 'Docente de colegio / profesor universitario' },
  { key: 'orientador', label: 'Orientador(a)', descripcion: 'Psicoorientación escolar' },
  { key: 'coordinador_convivencia', label: 'Convivencia', descripcion: 'Coordinador de convivencia escolar' },
  { key: 'rector', label: 'Rector(a)', descripcion: 'Rector / director del colegio' },
  { key: 'director_programa', label: 'Director de programa', descripcion: 'Director de programa académico (universidad)' },
  { key: 'decano', label: 'Decano(a)', descripcion: 'Decano de facultad (universidad)' },
  { key: 'bienestar_universitario', label: 'Bienestar universitario', descripcion: 'Bienestar universitario' },
];

/** Roles que puede crear un COORDINADOR según su institución. */
export const ROLES_POR_ENTIDAD: Record<string, RolCreable[]> = {
  sena: [
    { key: 'instructor', label: 'Instructor', descripcion: 'Instructor / formador (SENA)' },
    { key: 'bienestar_sena', label: 'Bienestar SENA', descripcion: 'Apoyo de sostenimiento / bienestar' },
  ],
  colegio: [
    { key: 'docente', label: 'Docente', descripcion: 'Docente de colegio' },
    { key: 'orientador', label: 'Orientador(a)', descripcion: 'Psicoorientación escolar' },
    { key: 'coordinador_convivencia', label: 'Convivencia', descripcion: 'Coordinador de convivencia escolar' },
  ],
  universidad: [
    { key: 'docente', label: 'Profesor', descripcion: 'Profesor universitario' },
  ],
};

const INSTITUCION_LABEL: Record<string, string> = {
  sena: 'SENA',
  colegio: 'Colegio',
  universidad: 'Universidad',
};

const TIPOS_DOCUMENTO = [
  { value: 'cc', label: 'Cédula de ciudadanía' },
  { value: 'ce', label: 'Cédula de extranjería' },
  { value: 'pasaporte', label: 'Pasaporte' },
];

const TIPOS_TITULO = ['pregrado', 'posgrado', 'tecnológico', 'técnico', 'otro'];

const TIPOS_EDUCACION = ['curso', 'diplomado', 'seminario', 'taller', 'otro'];

interface TituloRow {
  titulo: string;
  institucion: string;
  tipo: string;
}

interface EducacionRow {
  nombre: string;
  tipo: string;
  intensidadHoraria: string;
}

interface ExperienciaRow {
  empresa: string;
  cargo: string;
  funciones: string;
  fechaInicio: string;
  fechaFin: string;
}

interface CrearCuentaModalProps {
  open: boolean;
  onClose: () => void;
  onCreada: (mensaje: string) => void;
  roles: RolCreable[];
  institucionPorRol: (roleKey: string) => string;
}

const SectionTitle = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) => (
  <div className="flex items-center gap-3 rounded-2xl border border-line bg-canvas-deep/40 px-4 py-3 dark:border-ink-700 dark:bg-ink-900/40">
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-mint-500/15 text-mint-600 dark:text-mint-400">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-extrabold tracking-tight text-ink-900 dark:text-white">{title}</span>
      {subtitle && (
        <span className="mt-0.5 block text-[11px] font-medium text-ink-400 dark:text-ink-500">{subtitle}</span>
      )}
    </span>
  </div>
);

export const CrearCuentaModal = ({
  open,
  onClose,
  onCreada,
  roles,
  institucionPorRol,
}: CrearCuentaModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roleKey, setRoleKey] = useState(roles[0]?.key ?? '');
  const [phone, setPhone] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('cc');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [titulos, setTitulos] = useState<TituloRow[]>([
    { titulo: '', institucion: '', tipo: 'pregrado' },
  ]);
  const [educacion, setEducacion] = useState<EducacionRow[]>([
    { nombre: '', tipo: 'curso', intensidadHoraria: '' },
  ]);
  const [experiencia, setExperiencia] = useState<ExperienciaRow[]>([
    { empresa: '', cargo: '', funciones: '', fechaInicio: '', fechaFin: '' },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const documentoValido = /^\d{5,12}$/.test(numeroDocumento.trim());

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim() || !firstName.trim() || !lastName.trim() || !roleKey) {
      setError('Completa los datos personales obligatorios (nombres, apellidos, correo y rol).');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!documentoValido) {
      setError('El número de documento es obligatorio y debe contener entre 5 y 12 dígitos.');
      return;
    }
    const titulosLimpios = titulos
      .filter((t) => t.titulo.trim() || t.institucion.trim())
      .map((t) => ({
        titulo: t.titulo.trim(),
        institucion: t.institucion.trim(),
        tipo: t.tipo,
      }));
    const educacionLimpia = educacion
      .filter((e) => e.nombre.trim())
      .map((e) => ({
        nombre: e.nombre.trim(),
        tipo: e.tipo,
        intensidadHoraria: e.intensidadHoraria.trim() || undefined,
      }));
    const experienciaLimpia = experiencia
      .filter((x) => x.empresa.trim() || x.cargo.trim())
      .map((x) => ({
        empresa: x.empresa.trim(),
        cargo: x.cargo.trim(),
        funciones: x.funciones.trim() || undefined,
        fechaInicio: x.fechaInicio || undefined,
        fechaFin: x.fechaFin || undefined,
      }));
    setLoading(true);
    try {
      const creada = await cuentasService.crear({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        roleKey,
        institucion: institucionPorRol(roleKey),
        phone: phone.trim() || undefined,
        tipoDocumento,
        numeroDocumento: numeroDocumento.trim(),
        direccion: direccion.trim() || undefined,
        titulosAcademicos: titulosLimpios.length ? titulosLimpios : undefined,
        educacionComplementaria: educacionLimpia.length ? educacionLimpia : undefined,
        experienciaLaboral: experienciaLimpia.length ? experienciaLimpia : undefined,
      });
      onCreada(`Cuenta creada para ${creada.email ?? email.trim()}`);
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setNumeroDocumento('');
      setDireccion('');
      setTitulos([{ titulo: '', institucion: '', tipo: 'pregrado' }]);
      setEducacion([{ nombre: '', tipo: 'curso', intensidadHoraria: '' }]);
      setExperiencia([{ empresa: '', cargo: '', funciones: '', fechaInicio: '', fechaFin: '' }]);
      setRoleKey(roles[0]?.key ?? '');
      onClose();
    } catch (err) {
      const msg =
        (err as { message?: string })?.message ||
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(
        typeof msg === 'string'
          ? msg
          : Array.isArray(msg) && msg.length
            ? String(msg[0])
            : 'No se pudo crear la cuenta.',
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'input';

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 grid place-items-center bg-ink-950/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] bg-white shadow-lift ring-1 ring-line dark:bg-ink-900"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line/70 px-6 py-4 dark:border-ink-700/70">
            <div>
              <h2 className="admin-heading text-lg text-ink-950 dark:text-white">Crear cuenta de personal</h2>
              <p className="mt-0.5 text-xs font-semibold text-ink-400">
                La cuenta queda activa para ingresar por el acceso institucional.
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-xl p-2 text-ink-400 transition hover:bg-canvas-deep hover:text-ink-800 dark:hover:bg-ink-800 dark:hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {/* ============ DATOS PERSONALES Y DE IDENTIFICACIÓN ============ */}
            <SectionTitle
              icon={<IdCard size={17} />}
              title="Datos personales y de identificación"
              subtitle="Cédula de ciudadanía o extranjería. El correo debe ser personal y activo."
            />

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Rol <span className="text-mint-600">*</span>
              </label>
              <div className="relative">
                <select
                  className="input appearance-none pr-10"
                  value={roleKey}
                  onChange={(e) => setRoleKey(e.target.value)}
                >
                  {roles.map((rol) => (
                    <option key={rol.key} value={rol.key}>
                      {rol.label} · {INSTITUCION_LABEL[institucionPorRol(rol.key)] ?? institucionPorRol(rol.key)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              </div>
              <p className="text-[11px] font-medium text-ink-400 dark:text-ink-500">
                {roles.find((r) => r.key === roleKey)?.descripcion}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  Tipo de documento <span className="text-mint-600">*</span>
                </label>
                <div className="relative">
                  <select
                    className="input appearance-none pr-10"
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                  >
                    {TIPOS_DOCUMENTO.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  Número de documento <span className="text-mint-600">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  className={inputCls}
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 1234567890"
                />
                {numeroDocumento.length > 0 && !documentoValido && (
                  <p className="mt-1 text-[11px] font-semibold text-red-500">
                    El número de documento debe contener entre 5 y 12 dígitos.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  Nombres completos <span className="text-mint-600">*</span>
                </label>
                <input type="text" className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  Apellidos completos <span className="text-mint-600">*</span>
                </label>
                <input type="text" className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Correo electrónico <span className="text-mint-600">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input type="email" className={inputCls} style={{ paddingLeft: '2.75rem' }} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <p className="text-[11px] font-medium text-ink-400 dark:text-ink-500">
                Allí se envían las credenciales y confirmaciones.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Contraseña temporal <span className="text-mint-600">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  className={inputCls}
                  style={{ paddingLeft: '2.75rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input type="tel" inputMode="numeric" maxLength={15} className={inputCls} style={{ paddingLeft: '2.75rem' }} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 15))} placeholder="Ej: 3001234567" autoComplete="tel" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  Dirección de residencia
                </label>
                <div className="relative">
                  <Home size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input type="text" className={inputCls} style={{ paddingLeft: '2.75rem' }} value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, carrera, barrio" autoComplete="street-address" />
                </div>
              </div>
            </div>

            {/* ============ INFORMACIÓN ACADÉMICA ============ */}
            <SectionTitle
              icon={<GraduationCap size={17} />}
              title="Información académica"
              subtitle="Títulos obtenidos (diplomas o actas de grado) y educación complementaria."
            />

            <div className="space-y-2 rounded-2xl border border-line bg-canvas-deep/30 p-4 dark:border-ink-700 dark:bg-ink-900/40">
              <p className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Títulos obtenidos
              </p>
              {titulos.map((t, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_0.66fr_auto] items-center gap-2">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Título (ej: Ingeniero de Sistemas)"
                    value={t.titulo}
                    onChange={(e) => {
                      const next = [...titulos];
                      next[index].titulo = e.target.value;
                      setTitulos(next);
                    }}
                  />
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Institución educativa"
                    value={t.institucion}
                    onChange={(e) => {
                      const next = [...titulos];
                      next[index].institucion = e.target.value;
                      setTitulos(next);
                    }}
                  />
                  <div className="relative">
                    <select
                      className="input appearance-none pr-7"
                      value={t.tipo}
                      onChange={(e) => {
                        const next = [...titulos];
                        next[index].tipo = e.target.value;
                        setTitulos(next);
                      }}
                    >
                      {TIPOS_TITULO.map((tp) => (
                        <option key={tp} value={tp}>
                          {tp}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setTitulos(titulos.filter((_, i) => i !== index))}
                    aria-label="Quitar título"
                    className="rounded-lg p-2 text-ink-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setTitulos([...titulos, { titulo: '', institucion: '', tipo: 'pregrado' }])}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-mint-600 transition hover:text-mint-700 dark:text-mint-400"
              >
                <Plus size={14} />
                Agregar título
              </button>
            </div>

            <div className="space-y-2 rounded-2xl border border-line bg-canvas-deep/30 p-4 dark:border-ink-700 dark:bg-ink-900/40">
              <p className="text-xs font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Educación informal o complementaria
              </p>
              {educacion.map((e, index) => (
                <div key={index} className="grid grid-cols-[1fr_0.66fr_0.9fr_auto] items-center gap-2">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Curso / diplomado / seminario"
                    value={e.nombre}
                    onChange={(ev) => {
                      const next = [...educacion];
                      next[index].nombre = ev.target.value;
                      setEducacion(next);
                    }}
                  />
                  <div className="relative">
                    <select
                      className="input appearance-none pr-7"
                      value={e.tipo}
                      onChange={(ev) => {
                        const next = [...educacion];
                        next[index].tipo = ev.target.value;
                        setEducacion(next);
                      }}
                    >
                      {TIPOS_EDUCACION.map((tp) => (
                        <option key={tp} value={tp}>
                          {tp}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  </div>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Intensidad horaria"
                    value={e.intensidadHoraria}
                    onChange={(ev) => {
                      const next = [...educacion];
                      next[index].intensidadHoraria = ev.target.value;
                      setEducacion(next);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setEducacion(educacion.filter((_, i) => i !== index))}
                    aria-label="Quitar educación"
                    className="rounded-lg p-2 text-ink-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setEducacion([...educacion, { nombre: '', tipo: 'curso', intensidadHoraria: '' }])}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-mint-600 transition hover:text-mint-700 dark:text-mint-400"
              >
                <Plus size={14} />
                Agregar educación
              </button>
            </div>

            {/* ============ EXPERIENCIA LABORAL Y DOCENTE ============ */}
            <SectionTitle
              icon={<Briefcase size={17} />}
              title="Experiencia laboral y docente"
              subtitle="Instituciones donde ha trabajado, cargos, funciones y fechas."
            />

            <div className="space-y-3 rounded-2xl border border-line bg-canvas-deep/30 p-4 dark:border-ink-700 dark:bg-ink-900/40">
              {experiencia.map((x, index) => (
                <div key={index} className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="Empresa o entidad"
                      value={x.empresa}
                      onChange={(ev) => {
                        const next = [...experiencia];
                        next[index].empresa = ev.target.value;
                        setExperiencia(next);
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="Cargo o función"
                      value={x.cargo}
                      onChange={(ev) => {
                        const next = [...experiencia];
                        next[index].cargo = ev.target.value;
                        setExperiencia(next);
                      }}
                    />
                  </div>
                  <div className="relative space-y-1.5">
                    <input
                      type="text"
                      className={`${inputCls} pr-9`}
                      placeholder="Descripción de actividades"
                      value={x.funciones}
                      onChange={(ev) => {
                        const next = [...experiencia];
                        next[index].funciones = ev.target.value;
                        setExperiencia(next);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setExperiencia(experiencia.filter((_, i) => i !== index))}
                      aria-label="Quitar experiencia"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <input type="date" className={inputCls} value={x.fechaInicio} onChange={(ev) => {
                      const next = [...experiencia];
                      next[index].fechaInicio = ev.target.value;
                      setExperiencia(next);
                    }} />
                  </div>
                  <div className="space-y-1.5">
                    <input type="date" className={inputCls} value={x.fechaFin} onChange={(ev) => {
                      const next = [...experiencia];
                      next[index].fechaFin = ev.target.value;
                      setExperiencia(next);
                    }} />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setExperiencia([...experiencia, { empresa: '', cargo: '', funciones: '', fechaInicio: '', fechaFin: '' }])}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-mint-600 transition hover:text-mint-700 dark:text-mint-400"
              >
                <Plus size={14} />
                Agregar experiencia
              </button>
            </div>

            {error && (
              <p className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-line/70 px-6 py-4 dark:border-ink-700/70">
            <button type="button" onClick={onClose} className="btn-pill btn-pill-paper">
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={loading}
              className="btn-pill btn-pill-mint disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creando…' : (
                <>
                  <UserPlus size={15} />
                  Crear cuenta
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};