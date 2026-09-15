import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

export const Count = ({ to, className = '' }: { to: number; className?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const controls = animate(0, to, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v: number) => {
        node.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [to]);

  return (
    <span ref={ref} className={className}>
      {to}
    </span>
  );
};