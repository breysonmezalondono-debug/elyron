import { motion } from 'framer-motion';
import { Elir } from './Elir';

interface ElirLoaderProps {
  variant?: 'screen' | 'inline';
  label?: string;
}

export const ElirLoader = ({
  variant = 'screen',
  label = 'Cargando Elyron…',
}: ElirLoaderProps) => {
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3">
        <motion.span
          animate={{ rotate: [0, 12, -12, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        >
          <Elir size={34} float={false} mood="thinking" />
        </motion.span>
        <span className="text-xs font-bold text-ink-400">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas dark:bg-canvas-deep">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <span className="relative grid place-items-center">
          <motion.span
            className="absolute inset-0 rounded-full bg-mint-400/30"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          />
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
            className="relative"
          >
            <Elir size={92} mood="thinking" />
          </motion.div>
        </span>
        <p className="text-xs font-extrabold text-ink-400">{label}</p>
      </motion.div>
    </div>
  );
};
