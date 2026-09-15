import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ElyronLightCoreProps {
  children: ReactNode;
}

/** Firma visual de Elyron: luz orbital alrededor de Elir. */
export const ElyronLightCore = ({ children }: ElyronLightCoreProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <div className="elyron-light-core relative flex min-h-[290px] items-end justify-center pt-6">
      <div className="elyron-light-aura" aria-hidden="true" />
      <motion.svg
        viewBox="0 0 420 260"
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 z-[1] h-[250px] w-[420px] max-w-full overflow-visible"
        animate={
          reducedMotion
            ? { opacity: 0.7 }
            : {
                transform: [
                  'translateY(0px) rotate(-1deg)',
                  'translateY(-5px) rotate(1deg)',
                  'translateY(0px) rotate(-1deg)',
                ],
                opacity: [0.58, 0.82, 0.58],
              }
        }
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ellipse cx="210" cy="215" rx="138" ry="24" fill="none" stroke="#86efac" strokeWidth="1" strokeDasharray="3 12" opacity="0.55" />
        <ellipse cx="210" cy="215" rx="106" ry="17" fill="none" stroke="#34d399" strokeWidth="1.4" strokeDasharray="1 9" opacity="0.7" />
        <motion.path
          d="M210 48v115M155 79l55 32 55-32M132 158l78-45 78 45"
          fill="none"
          stroke="#a7f3d0"
          strokeWidth="0.8"
          strokeDasharray="2 8"
          animate={reducedMotion ? { opacity: 0.35 } : { opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="210"
          cy="42"
          r="4"
          fill="#d1fae5"
          animate={reducedMotion ? { opacity: 0.8 } : { transform: ['scale(0.85)', 'scale(1.25)', 'scale(0.85)'], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      </motion.svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
};
