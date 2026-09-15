import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Atom,
  BadgeCheck,
  Bed,
  BookOpen,
  Boxes,
  Briefcase,
  Calculator,
  Cake,
  ChefHat,
  Coins,
  Compass,
  Cpu,
  Database,
  Factory,
  FileText,
  Film,
  GitBranch,
  Globe,
  Hammer,
  HardHat,
  Heart,
  Leaf,
  LibraryBig,
  Megaphone,
  MessageSquare,
  Monitor,
  Music,
  Palette,
  Pen,
  Phone,
  Plane,
  Recycle,
  Route,
  Scale,
  Scissors,
  Search,
  Settings,
  Share,
  Sparkles,
  Star,
  Table,
  Tag,
  Target,
  TrendingUp,
  Truck,
  User,
  Users,
  Video,
  Warehouse,
  Wheat,
  Wrench,
} from 'lucide-react';
import { perfilService } from '../../services/perfilService';
import { resolverBiblioteca, filtrarRecursos } from '../../model/bibliotecaAcademica';
import type { RecursoTipo } from '../../model/bibliotecaAcademica';
import { resolverDominioPrograma } from '../../model/programasSenaCatalogo';

const EASE = [0.22, 1, 0.36, 1] as const;

const ICONO_AREA: Record<string, React.ReactNode> = {
  code: <Cpu size={20} />,
  globe: <Globe size={20} />,
  database: <Database size={20} />,
  git: <GitBranch size={20} />,
  briefcase: <Briefcase size={20} />,
  file: <FileText size={20} />,
  table: <Table size={20} />,
  phone: <Phone size={20} />,
  message: <MessageSquare size={20} />,
  users: <Users size={20} />,
  calculator: <Calculator size={20} />,
  scale: <Scale size={20} />,
  chef: <ChefHat size={20} />,
  cake: <Cake size={20} />,
  heart: <Heart size={20} />,
  user: <User size={20} />,
  zap: <Cpu size={20} />,
  cpu: <Cpu size={20} />,
  bot: <Cpu size={20} />,
  route: <Route size={20} />,
  monitor: <Monitor size={20} />,
  wrench: <Wrench size={20} />,
  atom: <Atom size={20} />,
  settings: <Settings size={20} />,
  truck: <Truck size={20} />,
  boxes: <Boxes size={20} />,
  warehouse: <Warehouse size={20} />,
  trending: <TrendingUp size={20} />,
  coins: <Coins size={20} />,
  megaphone: <Megaphone size={20} />,
  share: <Share size={20} />,
  target: <Target size={20} />,
  badge: <BadgeCheck size={20} />,
  tool: <Settings size={20} />,
  plane: <Plane size={20} />,
  bed: <Bed size={20} />,
  star: <Star size={20} />,
  tag: <Tag size={20} />,
  'hard-hat': <HardHat size={20} />,
  leaf: <Leaf size={20} />,
  recycle: <Recycle size={20} />,
  wheat: <Wheat size={20} />,
  scissors: <Scissors size={20} />,
  needle: <Pen size={20} />,
  factory: <Factory size={20} />,
  pen: <Pen size={20} />,
  palette: <Palette size={20} />,
  video: <Video size={20} />,
  film: <Film size={20} />,
  music: <Music size={20} />,
  sparkles: <Sparkles size={20} />,
  hammer: <Hammer size={20} />,
  compass: <Compass size={20} />,
};

const TIPO_RECURSO: Record<RecursoTipo, string> = {
  documentacion: 'Documentación',
  curso: 'Curso',
  libro: 'Libro',
  herramienta: 'Herramienta',
  oficial: 'Oficial',
  guia: 'Guía',
  normativa: 'Normativa',
};

const NIVEL_BADGE: Record<string, string> = {
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

const TIPO_RECURSO_COLOR: Record<RecursoTipo, string> = {
  documentacion: 'bg-mint-100 text-mint-700',
  curso: 'bg-violet-100 text-violet-700',
  libro: 'bg-amber-100 text-amber-700',
  herramienta: 'bg-sky-100 text-sky-700',
  oficial: 'bg-emerald-100 text-emerald-700',
  guia: 'bg-rose-100 text-rose-700',
  normativa: 'bg-orange-100 text-orange-700',
};

export const BibliotecaView = () => {
  const [programa, setPrograma] = useState<string>('');
  const [query, setQuery] = useState('');
  const [categoria, setCategoria] = useState('todos');

  const cargar = useCallback(async () => {
    /* El programa se toma del PERFIL real del usuario autenticado
       (backend), nunca de un mock/hardcode. Si no hay perfil o no se
       detecta programa, la biblioteca queda vacía (sin contenido ajeno). */
    const perfil = await perfilService.miPerfil();
    setPrograma(perfil?.programaFormacion ?? '');
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const biblioteca = useMemo(() => {
    const dominio = resolverDominioPrograma(programa);
    if (!dominio) return null;
    return resolverBiblioteca(dominio);
  }, [programa]);

  /* La búsqueda y los filtros se reinician cuando cambia el programa
     detectado, para no mezclar resultados entre carreras. */
  useEffect(() => {
    setQuery('');
    setCategoria('todos');
  }, [biblioteca?.dominio]);

  const visibles = useMemo(
    () =>
      biblioteca
        ? filtrarRecursos(biblioteca.recursos, { query, categoria })
        : [],
    [biblioteca, query, categoria],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="space-y-6"
    >
      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
          Servicios del aprendiz
        </p>
        <h1 className="display mt-2 text-3xl leading-tight text-ink-950 sm:text-4xl">
          Biblioteca académica
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-ink-500">
          Recursos seleccionados para tu programa de formación.
        </p>
      </header>

      {/* ===================== BIBLIOTECA INTELIGENTE ===================== */}
      {biblioteca ? (
        <section className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
          {/* Encabezado del programa */}
          <div className="relative overflow-hidden bg-gradient-to-br from-ink-950 to-ink-800 p-6 text-white sm:p-7">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <LibraryBig size={22} className="text-mint-300" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/60">
                  Tu biblioteca personalizada
                </p>
                <h2 className="mt-0.5 truncate text-xl font-extrabold tracking-tight">
                  {programa || 'Programa'}
                </h2>
                <p className="mt-0.5 text-xs font-semibold text-white/70">
                  {biblioteca.totalRecursos} recursos disponibles ·{' '}
                  {biblioteca.categorias.length} áreas
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Buscador */}
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar en tu biblioteca..."
                className="w-full rounded-2xl border border-line bg-canvas py-3 pl-10 pr-4 text-sm font-medium text-ink-900 outline-none transition focus:border-mint-500 focus:ring-4 focus:ring-mint-500/15"
              />
            </div>

            {/* Filtros por categoría (solo las del programa actual) */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoria('todos')}
                className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
                  categoria === 'todos'
                    ? 'bg-ink-950 text-white'
                    : 'bg-canvas-deep text-ink-500 hover:text-ink-900'
                }`}
              >
                Todos
              </button>
              {biblioteca.categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
                    categoria === cat
                      ? 'bg-ink-950 text-white'
                      : 'bg-canvas-deep text-ink-500 hover:text-ink-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Resultados */}
            {visibles.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center">
                <p className="text-sm font-bold text-ink-700">Sin resultados</p>
                <p className="mt-1 text-xs font-semibold text-ink-400">
                  No hay recursos que coincidan con tu búsqueda en este programa.
                </p>
              </div>
            ) : (
              /* Agrupar los recursos ya filtrados por área */
              Array.from(
                visibles.reduce((map, r) => {
                  const lista = map.get(r.area) ?? [];
                  lista.push(r);
                  map.set(r.area, lista);
                  return map;
                }, new Map<string, typeof visibles>()),
                ([areaNombre, recursosArea]) => (
                  <div key={areaNombre} className="mt-7">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-9 place-items-center rounded-xl bg-mint-50 text-mint-600">
                        {ICONO_AREA[
                          biblioteca.areas.find((a) => a.nombre === areaNombre)?.icono ?? ''
                        ] ?? <BookOpen size={18} />}
                      </span>
                      <h3 className="text-sm font-extrabold uppercase tracking-[0.12em] text-ink-700">
                        {areaNombre}
                      </h3>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {recursosArea.map((recurso) => (
                        <article
                          key={recurso.id}
                          className="group flex flex-col rounded-2xl border border-line bg-canvas p-4 transition hover:-translate-y-0.5 hover:border-mint-300 hover:shadow-lift"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-mint-600">
                              {recurso.tema}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                                TIPO_RECURSO_COLOR[recurso.tipo]
                              }`}
                            >
                              {TIPO_RECURSO[recurso.tipo]}
                            </span>
                          </div>
                          <h4 className="mt-1.5 text-sm font-extrabold text-ink-900">
                            {recurso.nombre}
                          </h4>
                          <p className="mt-1 flex-1 text-xs font-semibold leading-relaxed text-ink-500">
                            {recurso.descripcion}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-ink-400">
                              {NIVEL_BADGE[recurso.nivel]} · {recurso.fuente}
                            </span>
                            <a
                              href={recurso.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-pill btn-pill-mint btn-pill-sm"
                            >
                              Ir al recurso <ArrowUpRight size={14} />
                            </a>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        </section>
      ) : (
        /* Estado vacío: sin recursos de otra carrera como reemplazo */
        <section className="surface p-10 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-mint-50 text-mint-600">
            <LibraryBig size={24} />
          </span>
          <h2 className="mt-4 text-lg font-extrabold text-ink-900">
            Estamos preparando tu biblioteca
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm font-semibold text-ink-500">
            Todavía estamos agregando recursos para este programa.
          </p>
        </section>
      )}
    </motion.div>
  );
};