import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

const sequence: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

interface PlaceholderViewProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PlaceholderView = ({
  eyebrow,
  title,
  description,
  icon: Icon,
}: PlaceholderViewProps) => {
  return (
    <motion.div variants={sequence} initial="hidden" animate="visible" className="space-y-7">
      <motion.header variants={rise}>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
          {eyebrow}
        </p>
        <h1 className="display mt-2 text-3xl leading-tight text-ink-950 sm:text-[40px]">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm font-semibold leading-relaxed text-ink-500">
          {description}
        </p>
      </motion.header>

      <motion.section
        variants={rise}
        className="surface flex flex-col items-center gap-5 p-10 text-center sm:p-14"
      >
        <span className="flex size-16 items-center justify-center rounded-[22px] bg-violet-50 text-violet-600 shadow-lift">
          <Icon size={30} />
        </span>
        <div className="space-y-2">
          <h2 className="text-lg font-extrabold tracking-tight text-ink-950">
            Módulo en construcción
          </h2>
          <p className="mx-auto max-w-md text-sm font-semibold leading-relaxed text-ink-500">
            Esta sección aún no tiene contenido. El equipo está trabajando para
            habilitarla muy pronto.
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
};
