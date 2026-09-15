import { motion } from 'framer-motion';

export const ElirLoginIllustration = () => (
  <div className="relative flex items-center justify-center" style={{ width: 340, height: 340 }}>
    <svg
      viewBox="0 0 340 340"
      width={340}
      height={340}
      role="img"
      aria-label="Elir, tutor IA de Elyron, sobre una base tecnológica"
      className="drop-shadow-2xl"
    >
      <defs>
        <filter id="glow-mint" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-mint-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="elir-body-lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#27272a" />
          <stop offset="100%" stopColor="#0c0c0f" />
        </linearGradient>
        <radialGradient id="elir-sheen-lg" cx="0.32" cy="0.22" r="0.55">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.14} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>

        <linearGradient id="platform-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="platform-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141c2b" />
          <stop offset="100%" stopColor="#0a1019" />
        </linearGradient>
        <linearGradient id="platform-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#182030" />
          <stop offset="100%" stopColor="#0d1520" />
        </linearGradient>

        <filter id="card-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <clipPath id="clip-platform-top">
          <polygon points="170,195 240,230 170,265 100,230" />
        </clipPath>
      </defs>

      <g opacity={0.06}>
        {Array.from({ length: 20 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={i * 18}
            x2={340}
            y2={i * 18}
            stroke="#94a3b8"
            strokeWidth={0.5}
          />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 18}
            y1={0}
            x2={i * 18}
            y2={340}
            stroke="#94a3b8"
            strokeWidth={0.5}
          />
        ))}
      </g>

      <g>
        <polygon
          points="170,240 260,280 170,320 80,280"
          fill="url(#platform-top)"
          stroke="#22c55e"
          strokeWidth={1}
          strokeOpacity={0.3}
        />
        <polygon
          points="80,280 170,320 170,338 80,298"
          fill="url(#platform-front)"
        />
        <polygon
          points="170,320 260,280 260,298 170,338"
          fill="url(#platform-side)"
        />
        <polygon
          points="170,240 260,280 170,320 80,280"
          fill="none"
          stroke="#22c55e"
          strokeWidth={1.5}
          strokeOpacity={0.5}
          filter="url(#glow-mint)"
        />
      </g>

      <g>
        <polygon
          points="170,215 230,245 170,275 110,245"
          fill="url(#platform-top)"
          stroke="#22c55e"
          strokeWidth={1}
          strokeOpacity={0.35}
        />
        <polygon
          points="110,245 170,275 170,290 110,260"
          fill="url(#platform-front)"
        />
        <polygon
          points="170,275 230,245 230,260 170,290"
          fill="url(#platform-side)"
        />
        <polygon
          points="170,215 230,245 170,275 110,245"
          fill="none"
          stroke="#22c55e"
          strokeWidth={1.5}
          strokeOpacity={0.6}
          filter="url(#glow-mint)"
        />
      </g>

      <g>
        <polygon
          points="170,195 215,217 170,240 125,217"
          fill="url(#platform-top)"
          stroke="#22c55e"
          strokeWidth={1.2}
          strokeOpacity={0.4}
        />
        <polygon
          points="125,217 170,240 170,252 125,229"
          fill="url(#platform-front)"
        />
        <polygon
          points="170,240 215,217 215,229 170,252"
          fill="url(#platform-side)"
        />
        <polygon
          points="170,195 215,217 170,240 125,217"
          fill="none"
          stroke="#22c55e"
          strokeWidth={1.5}
          strokeOpacity={0.7}
          filter="url(#glow-mint)"
        />
      </g>

      <g>
        <ellipse cx={170} cy={205} rx={22} ry={4} fill="#000" opacity={0.25} />

        <line x1={170} y1={135} x2={170} y2={120} stroke="#3f3f46" strokeWidth={3} strokeLinecap="round" />

        <motion.circle
          cx={170}
          cy={116}
          r={5}
          fill="#22c55e"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
        <circle cx={170} cy={116} r={8} fill="none" stroke="#22c55e" strokeWidth={1} opacity={0.2} />

        <rect x={143} y={137} width={54} height={52} rx={24} fill="url(#elir-body-lg)" />
        <rect x={143} y={137} width={54} height={52} rx={24} fill="url(#elir-sheen-lg)" />

        <g style={{ transformBox: 'fill-box', transformOrigin: 'center' }} className="animate-blink">
          <ellipse cx={158} cy={160} rx={5.5} ry={6} fill="#ffffff" />
          <circle cx={159} cy={161} r={2.2} fill="#18181b" />
          <circle cx={160} cy={159.5} r={0.8} fill="#ffffff" opacity={0.9} />

          <ellipse cx={182} cy={160} rx={5.5} ry={6} fill="#ffffff" />
          <circle cx={183} cy={161} r={2.2} fill="#18181b" />
          <circle cx={184} cy={159.5} r={0.8} fill="#ffffff" opacity={0.9} />
        </g>

        <motion.path
          d="M161 170 Q170 178 179 170"
          stroke="#ffffff"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
        />

        <circle cx={152} cy={168} r={3} fill="#4ade80" opacity={0.35} />
        <circle cx={188} cy={168} r={3} fill="#4ade80" opacity={0.35} />
      </g>

      <motion.g
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.5 }}
      >
        <rect
          x={52}
          y={130}
          width={56}
          height={56}
          rx={14}
          fill="#0f172a"
          stroke="#22c55e"
          strokeWidth={1}
          strokeOpacity={0.4}
          filter="url(#card-glow)"
        />
        <g transform="translate(66, 143)">
          <polygon points="14,0 28,7 14,14 0,7" fill="#22c55e" opacity={0.9} />
          <rect x={11} y={7} width={6} height={10} fill="#22c55e" opacity={0.6} />
          <path d="M6,10 L6,17 Q14,22 22,17 L22,10" fill="none" stroke="#22c55e" strokeWidth={1.5} opacity={0.5} />
        </g>
      </motion.g>

      <motion.g
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1.2 }}
      >
        <rect
          x={232}
          y={145}
          width={56}
          height={56}
          rx={14}
          fill="#0f172a"
          stroke="#22c55e"
          strokeWidth={1}
          strokeOpacity={0.4}
          filter="url(#card-glow)"
        />
        <g transform="translate(246, 160)">
          <path d="M4,4 L0,12 L4,20" stroke="#22c55e" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.9} />
          <path d="M20,4 L24,12 L20,20" stroke="#22c55e" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.9} />
          <line x1={14} y1={2} x2={10} y2={22} stroke="#22c55e" strokeWidth={1.5} opacity={0.5} />
        </g>
      </motion.g>

      {[
        { cx: 88, cy: 105, r: 2, o: 0.3, d: 0 },
        { cx: 255, cy: 120, r: 1.5, o: 0.25, d: 0.8 },
        { cx: 115, cy: 90, r: 1.8, o: 0.2, d: 1.5 },
        { cx: 225, cy: 100, r: 1.2, o: 0.35, d: 0.3 },
        { cx: 150, cy: 80, r: 1.5, o: 0.15, d: 2.0 },
        { cx: 200, cy: 88, r: 1.3, o: 0.2, d: 1.0 },
      ].map((p, i) => (
        <motion.circle
          key={i}
          cx={p.cx}
          cy={p.cy}
          r={p.r}
          fill="#22c55e"
          opacity={p.o}
          animate={{ opacity: [p.o, p.o * 0.3, p.o], scale: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 3 + i * 0.5, ease: 'easeInOut', delay: p.d }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      ))}

      <circle cx={170} cy={160} r={50} fill="#22c55e" opacity={0.04} filter="url(#glow-mint-soft)" />
    </svg>
  </div>
);
