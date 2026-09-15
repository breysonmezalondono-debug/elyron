import type { LucideIcon } from 'lucide-react';

export type IconTileVariant = 'mint' | 'ink' | 'amber' | 'violet' | 'paper';

const VARIANT_STYLES: Record<IconTileVariant, string> = {
  mint: 'bg-mint-100 text-mint-700',
  ink: 'bg-ink-900 text-white',
  amber: 'bg-amber-100 text-amber-600',
  violet: 'bg-violet-100 text-violet-600',
  paper: 'bg-canvas-deep text-ink-500',
};

const SIZE_STYLES = {
  sm: { box: 'size-9', icon: 15 },
  md: { box: 'size-11', icon: 19 },
} as const;

interface IconTileProps {
  icon: LucideIcon;
  variant?: IconTileVariant;
  size?: keyof typeof SIZE_STYLES;
  className?: string;
}

export const IconTile = ({
  icon: Icon,
  variant = 'mint',
  size = 'md',
  className = '',
}: IconTileProps) => {
  const tile = SIZE_STYLES[size];
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full ${tile.box} ${VARIANT_STYLES[variant]} ${className}`}
    >
      <Icon size={tile.icon} strokeWidth={2.2} />
    </span>
  );
};
