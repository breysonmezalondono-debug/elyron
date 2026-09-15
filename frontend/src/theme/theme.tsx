import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../context/useAuth';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ResolvedMode = 'light' | 'dark';

export const ACCENTS = [
  { label: 'Azul cielo', value: '#1f86e8' },
  { label: 'Verde botella', value: '#1b3a2b' },
  { label: 'Dorado', value: '#b89350' },
  { label: 'Burdeos', value: '#6b2737' },
  { label: 'Azul petróleo', value: '#1f4e5f' },
  { label: 'Terracota', value: '#b0562e' },
  { label: 'Grafito', value: '#4e5148' },
] as const;

interface StoredPrefs {
  mode: ThemeMode;
  accent: string;
}

interface ThemeState extends StoredPrefs {
  resolved: ResolvedMode;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: string) => void;
}

const STORAGE_KEY_LEGACY = 'elyron_theme';
const scopeKey = (scope: string) => `elyron_theme:${scope}`;

const DEFAULT_PREFS: StoredPrefs = { mode: 'light', accent: ACCENTS[0].value };

/** Acento heredado (verde botella) que dejó de ser el color por defecto. */
const LEGACY_DEFAULT_ACCENT = '#1b3a2b';

const ThemeContext = createContext<ThemeState | null>(null);

function parsePrefs(raw: string | null): StoredPrefs | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredPrefs;
    const validMode = parsed.mode === 'light' || parsed.mode === 'dark' || parsed.mode === 'auto';
    if (validMode && typeof parsed.accent === 'string' && /^#[0-9a-f]{6}$/i.test(parsed.accent)) {
      const accent =
        parsed.accent.toLowerCase() === LEGACY_DEFAULT_ACCENT
          ? ACCENTS[0].value
          : parsed.accent;
      return { mode: parsed.mode, accent };
    }
  } catch {
  }
  return null;
}

function loadPrefs(scope: string): StoredPrefs {
  return parsePrefs(localStorage.getItem(scopeKey(scope))) ?? parsePrefs(localStorage.getItem(STORAGE_KEY_LEGACY)) ?? DEFAULT_PREFS;
}

function persistPrefs(scope: string, prefs: StoredPrefs): void {
  try {
    localStorage.setItem(scopeKey(scope), JSON.stringify(prefs));
  } catch {
  }
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

type AccentRgb = [number, number, number];

/**
 * En Modo Oscuro el acento elegido suele ser demasiado oscuro para verse
 * sobre el lienzo carbón (p. ej. verde botella #1b3a2b sobre #0a0a0b).
 * Se aclara mezclando hacia el blanco hasta alcanzar una luminancia mínima
 * usable, manteniendo el carácter del color elegido.
 */
export function accentRgbFor(accent: string, dark: boolean): AccentRgb {
  const [r, g, b] = hexToRgb(accent);
  if (!dark) return [r, g, b];
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (lum >= 150) return [r, g, b];
  const denom = 0.2126 * (255 - r) + 0.7152 * (255 - g) + 0.0722 * (255 - b);
  const k = Math.min(0.85, (150 - lum) / Math.max(denom, 1));
  return [
    Math.round(r + (255 - r) * k),
    Math.round(g + (255 - g) * k),
    Math.round(b + (255 - b) * k),
  ];
}

function rgbString([r, g, b]: AccentRgb): string {
  return `rgb(${r} ${g} ${b})`;
}

function applyTheme(prefs: StoredPrefs, resolved: ResolvedMode): void {
  const root = document.documentElement;
  const dark = resolved === 'dark';
  const rgb = accentRgbFor(prefs.accent, dark);
  const [r, g, b] = rgb;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const onAccent = luminance > 135 ? '#121212' : '#f8f7f3';
  const deep = dark ? rgb : [Math.round(r * 0.62), Math.round(g * 0.62), Math.round(b * 0.62)] as AccentRgb;
  const deepRgb = deep as AccentRgb;

  root.style.setProperty('--app-accent', rgbString(rgb));
  root.style.setProperty('--app-accent-soft', `rgb(${r} ${g} ${b} / ${dark ? 0.16 : 0.08})`);
  root.style.setProperty('--app-accent-line', `rgb(${r} ${g} ${b} / ${dark ? 0.34 : 0.24})`);
  root.style.setProperty('--app-accent-deep', rgbString(deepRgb));
  root.style.setProperty(
    '--app-accent-bright',
    `rgb(${Math.round(r + (255 - r) * 0.55)} ${Math.round(g + (255 - g) * 0.55)} ${Math.round(b + (255 - b) * 0.55)})`,
  );
  root.style.setProperty('--app-accent-ink', onAccent);
  root.style.setProperty('--app-spot', `rgb(${r} ${g} ${b} / ${dark ? 0.12 : 0.06})`);
  root.style.colorScheme = dark ? 'dark' : 'light';
  root.setAttribute('data-theme', resolved);

  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = dark ? '#0a0a0b' : '#fafaf7';
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const scope = user?.sub ? String(user.sub) : 'guest';
  return <ThemeScoped key={scope} scope={scope}>{children}</ThemeScoped>;
};

const ThemeScoped = ({ children, scope }: { children: ReactNode; scope: string }) => {
  const [prefs, setPrefs] = useState<StoredPrefs>(() => loadPrefs(scope));
  const [systemDark, setSystemDark] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (localStorage.getItem(scopeKey(scope))) return;
    const legacy = parsePrefs(localStorage.getItem(STORAGE_KEY_LEGACY));
    if (legacy) persistPrefs(scope, legacy);
  }, [scope]);

  const resolved: ResolvedMode = prefs.mode === 'auto' ? (systemDark ? 'dark' : 'light') : prefs.mode;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-anim');
    applyTheme(prefs, resolved);
    const timer = window.setTimeout(() => root.classList.remove('theme-anim'), 420);
    return () => {
      window.clearTimeout(timer);
      root.classList.remove('theme-anim');
    };
  }, [prefs, resolved]);

  const setMode = useCallback(
    (mode: ThemeMode) => {
      setPrefs((prev) => {
        const next = { ...prev, mode };
        persistPrefs(scope, next);
        return next;
      });
    },
    [scope],
  );

  const setAccent = useCallback(
    (accent: string) => {
      if (!/^#[0-9a-f]{6}$/i.test(accent)) return;
      setPrefs((prev) => {
        const next = { ...prev, accent };
        persistPrefs(scope, next);
        return next;
      });
    },
    [scope],
  );

  const value = useMemo<ThemeState>(
    () => ({ ...prefs, resolved, setMode, setAccent }),
    [prefs, resolved, setMode, setAccent],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}