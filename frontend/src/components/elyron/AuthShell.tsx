import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Elir } from './Elir';
import { useTheme } from '../../theme/theme';

const EASE = [0.22, 1, 0.36, 1] as const;

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export const AuthShell = ({ eyebrow, title, subtitle, children }: AuthShellProps) => {
  const { resolved } = useTheme();
  return (
  <div className="flex min-h-screen flex-col bg-canvas lg:flex-row dark:bg-canvas-deep">
    <motion.aside
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative hidden w-[46%] flex-col justify-between overflow-hidden px-12 py-12 lg:flex"
      style={{
        backgroundImage: `url('/imagen/${resolved === 'dark' ? '2' : '1'}.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="pointer-events-none absolute -left-16 -top-20 size-72 rounded-full bg-mint-200/40 blur-3xl dark:bg-mint-500/5" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 size-80 rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-500/5" />

      <div className="relative z-10 flex items-center gap-2.5">
        <div className="relative grid size-10 place-items-center rounded-2xl bg-mint-500/15 ring-1 ring-mint-500/20">
          <Elir size={30} float={false} mood="happy" />
        </div>
        <span className="text-lg font-extrabold tracking-tight text-ink-950 dark:text-white">
          Elyron<span className="text-mint-500">.</span>
        </span>
      </div>

      <div className="relative z-10 max-w-md">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-mint-200 bg-mint-50 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-mint-700 dark:border-mint-500/30 dark:bg-mint-500/10 dark:text-mint-400">
          <Sparkles size={12} />
          Aprendizaje impulsado por IA
        </span>

        <h1 className="display mt-6 text-5xl leading-[1.02] text-ink-950 dark:text-white">
          Tu institución, tu ritmo y un tutor que{' '}
          <span className="italic text-mint-600 dark:text-mint-400">razona contigo</span>.
        </h1>

        <p className="mt-5 max-w-sm text-[15px] font-medium leading-relaxed text-ink-500 dark:text-ink-400">
          Evidencias, competencias y comunidad en un solo lugar. Elir te guía con
          preguntas, no con respuestas de regalo.
        </p>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[300px]" />

      <p className="relative z-10 text-xs font-semibold text-ink-400">
        © 2026 Elyron · Aprendizaje que deja huella
      </p>
    </motion.aside>

    <motion.main
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
      className="relative flex flex-1 flex-col justify-center bg-white px-6 py-12 dark:bg-canvas-deep"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="mx-auto w-full max-w-md"
      >
        <div className="mb-6 flex items-center gap-3 lg:hidden">
          <Elir size={38} float={false} mood="happy" />
          <span className="text-lg font-extrabold tracking-tight text-ink-950 dark:text-white">
            Elyron<span className="text-mint-500">.</span>
          </span>
        </div>

        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-mint-600 dark:text-mint-400">
          {eyebrow}
        </p>
        <h1 className="display mt-2 text-4xl text-ink-950 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm font-medium text-ink-500 dark:text-ink-400">{subtitle}</p>

        <div className="mt-8 space-y-4">{children}</div>
      </motion.div>
    </motion.main>
  </div>
  );
};
