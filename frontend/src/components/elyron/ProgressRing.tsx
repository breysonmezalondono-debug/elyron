import { motion } from 'framer-motion';

interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  centerClassName?: string;
  subLabel?: string;
}

export const ProgressRing = ({
  value,
  size = 56,
  stroke = 6,
  color = '#0284C7',
  trackColor = '#E9EEF5',
  centerClassName,
  subLabel,
}: ProgressRingProps) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={centerClassName ?? 'text-xs font-extrabold tracking-tight'}>{value}%</span>
        {subLabel && (
          <span className="text-[11px] font-semibold text-ink-400">{subLabel}</span>
        )}
      </span>
    </div>
  );
};
