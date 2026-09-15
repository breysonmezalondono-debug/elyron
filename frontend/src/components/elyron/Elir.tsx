import { motion } from 'framer-motion';

export type ElirMood = 'happy' | 'thinking' | 'celebrate' | 'curious';

interface ElirProps {
  size?: number;
  mood?: ElirMood;
  float?: boolean;
  className?: string;
}

const BLINK_STYLE: React.CSSProperties = {
  transformBox: 'fill-box',
  transformOrigin: 'center',
};

const Eye = ({ cx, cy, rx = 8.5, ry = 9.5 }: { cx: number; cy: number; rx?: number; ry?: number }) => (
  <g>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#ffffff" />
    <circle cx={cx + 1.4} cy={cy + 1} r={3.4} fill="#18181b" />
    <circle cx={cx + 3} cy={cy - 2.4} r={1.1} fill="#ffffff" opacity={0.9} />
  </g>
);

const HappyEyes = ({ cy }: { cy: number }) => (
  <>
    <path d="M38 66 Q46 58 54 66" stroke="#ffffff" strokeWidth={4.5} strokeLinecap="round" fill="none" />
    <path d="M66 66 Q74 58 82 66" stroke="#ffffff" strokeWidth={4.5} strokeLinecap="round" fill="none" />
    <circle cx={34} cy={cy + 12} r={4.5} fill="#4ade80" opacity={0.55} />
    <circle cx={86} cy={cy + 12} r={4.5} fill="#4ade80" opacity={0.55} />
  </>
);

export const Elir = ({ size = 120, mood = 'happy', float = true, className }: ElirProps) => {
  const faceY = 64;

  return (
    <div className={className} style={{ width: size, height: size }}>
      <div className={float ? 'animate-float' : undefined} style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 120 124" width={size} height={(size * 124) / 120} role="img" aria-label={`Elir, tutor IA de Elyron (${mood})`}>
          <defs>
            <linearGradient id="elir-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#0c0c0f" />
            </linearGradient>
            <radialGradient id="elir-sheen" cx="0.32" cy="0.22" r="0.55">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.14} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </radialGradient>
          </defs>

          <ellipse cx={60} cy={116} rx={30} ry={5.5} fill="#18181b" opacity={0.1} />

          <g>
            <line x1={60} y1={28} x2={60} y2={16} stroke="#3f3f46" strokeWidth={4} strokeLinecap="round" />
            <motion.circle
              cx={60}
              cy={12}
              r={6}
              fill="#22c55e"
              animate={{ scale: [1, 1.22, 1], opacity: [1, 0.75, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
            <circle cx={60} cy={12} r={10} fill="none" stroke="#22c55e" strokeWidth={1.4} opacity={0.28} />
          </g>

          <rect x={16} y={26} width={88} height={82} rx={38} fill="url(#elir-body)" />
          <rect x={16} y={26} width={88} height={82} rx={38} fill="url(#elir-sheen)" />

          {mood === 'celebrate' ? (
            <HappyEyes cy={faceY} />
          ) : mood === 'curious' ? (
            <g>
              <g style={BLINK_STYLE} className="animate-blink">
                <Eye cx={45} cy={faceY - 2} rx={10} ry={11} />
              </g>
              <g style={BLINK_STYLE} className="animate-blink">
                <Eye cx={75} cy={faceY + 1} rx={6.5} ry={7.5} />
              </g>
            </g>
          ) : (
            <g style={BLINK_STYLE} className="animate-blink">
              <Eye cx={45} cy={faceY} />
              <Eye cx={75} cy={faceY} />
            </g>
          )}

          {mood === 'happy' && (
            <motion.path
              key="m-happy"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              d={`M48 ${faceY + 15} Q60 ${faceY + 25} 72 ${faceY + 15}`}
              stroke="#ffffff"
              strokeWidth={4.5}
              strokeLinecap="round"
              fill="none"
            />
          )}

          {mood === 'thinking' && (
            <motion.g key="m-thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <path d={`M51 ${faceY + 18} L69 ${faceY + 17}`} stroke="#a1a1aa" strokeWidth={4} strokeLinecap="round" />
              <circle cx={95} cy={34} r={2.4} fill="#d4d4d8" />
              <circle cx={102} cy={24} r={3.2} fill="#a1a1aa" />
              <circle cx={111} cy={12} r={4.2} fill="#71717a" />
            </motion.g>
          )}

          {mood === 'celebrate' && (
            <motion.path
              key="m-celebrate"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              d={`M47 ${faceY + 13} Q60 ${faceY + 31} 73 ${faceY + 13} Z`}
              fill="#ffffff"
            />
          )}

          {mood === 'curious' && (
            <motion.circle
              key="m-curious"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16 }}
              cx={60}
              cy={faceY + 19}
              r={5}
              fill="#ffffff"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
