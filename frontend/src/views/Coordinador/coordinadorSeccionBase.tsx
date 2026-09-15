import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, Hammer, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

interface CoordinadorSeccionProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
}

export const CoordinadorSeccionBase = ({
  icon: Icon,
  eyebrow,
  title,
  description,
  features,
}: CoordinadorSeccionProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={rise}
      className="space-y-7"
    >
      <motion.header
        variants={rise}
        className="flex flex-wrap items-end justify-between gap-6"
      >
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
            {eyebrow}
          </p>
          <h1 className="display mt-2 text-3xl leading-tight text-ink-950 sm:text-[40px]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-ink-500">
            {description}
          </p>
        </div>
        <Link
          to="/coordinador"
          className="btn-pill btn-pill-ink hidden shrink-0 sm:inline-flex"
        >
          Volver al inicio
          <ArrowRight size={15} />
        </Link>
      </motion.header>

      <motion.section variants={rise} className="surface p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-full bg-amber-100 text-amber-700">
            <Hammer size={17} />
          </span>
          <div>
            <h2 className="text-base font-extrabold tracking-tight">
              Módulo en preparación
            </h2>
            <p className="text-xs font-semibold text-ink-400">
              Esta sección estará disponible en la próxima entrega del panel del coordinador.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature}
              className="rounded-2xl border border-line bg-canvas-deep/40 p-4"
            >
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-600">
                <Sparkles size={12} />
                Incluirá
              </span>
              <p className="mt-2 text-sm font-bold leading-relaxed text-ink-800">
                {feature}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-mint-50 p-4 ring-1 ring-mint-100">
          <Icon size={18} className="shrink-0 text-mint-600" />
          <p className="text-xs font-semibold leading-relaxed text-ink-600">
            Cuando el microservicio de coordinación esté disponible, este módulo
            consumirá sus datos a través de <code className="font-mono">services/</code>,
            sin cambiar la ruta ni el panel.
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
};
