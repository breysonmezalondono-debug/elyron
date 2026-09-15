import { useRef } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1] as const;

export const luxRise: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export const LuxCard = ({
  delay = 0,
  className = '',
  children,
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      ref={ref}
      variants={luxRise}
      onMouseMove={onMouseMove}
      className={`group relative overflow-hidden rounded-xl border border-line bg-paper text-ink-900 transition-colors duration-300 ${className}`}
    >
      <motion.svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 200 56"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ delay, duration: 1.45, times: [0, 0.08, 0.5, 0.82] }}
      >
        <motion.rect
          x={0.5}
          y={0.5}
          width={199}
          height={55}
          rx={10}
          fill="none"
          vectorEffect="non-scaling-stroke"
          strokeWidth={1.4}
          stroke="var(--app-accent-line)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay, duration: 0.74, ease: EASE }}
        />
      </motion.svg>

      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), var(--app-spot, transparent) 0%, transparent 62%)',
        }}
      />

      <div className="relative">{children}</div>
    </motion.div>
  );
};