import { TrendingUp, TrendingDown } from 'lucide-react';
import { IconTile } from './IconTile';
import type { IconTileVariant } from './IconTile';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
  deltaUp?: boolean;
  variant?: IconTileVariant;
  to?: string;
}

export const StatCard = ({
  icon,
  label,
  value,
  delta,
  deltaUp = true,
  variant = 'mint',
  to,
}: StatCardProps) => {
  const body = (
    <div className="surface flex h-full flex-col justify-between gap-4 p-5 transition-all duration-300 ease-deluxe hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-400">{label}</p>
          <p className="display mt-1.5 truncate text-[32px] leading-none text-ink-950">{value}</p>
        </div>
        <IconTile icon={icon} variant={variant} />
      </div>
      {delta && (
        <p
          className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
            deltaUp ? 'bg-mint-50 text-mint-700' : 'bg-red-50 text-red-500'
          }`}
        >
          {deltaUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {delta}
        </p>
      )}
    </div>
  );

  if (!to) return body;
  return (
    <a href={to} className="block h-full">
      {body}
    </a>
  );
};
