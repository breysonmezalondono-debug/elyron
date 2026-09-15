import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Monitor, Moon, Palette, Sun, X } from 'lucide-react';
import { ACCENTS, useTheme } from '../../theme/theme';
import type { ThemeMode } from '../../theme/theme';

const MODES: Array<{ id: ThemeMode; label: string; icon: typeof Sun }> = [
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Oscuro', icon: Moon },
  { id: 'auto', label: 'Auto', icon: Monitor },
];

export const ThemeCustomizer = () => {
  const { mode, resolved, accent, setMode, setAccent } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Personalizar apariencia"
        title="Personalizar apariencia"
        onClick={() => setOpen(true)}
        className={`relative grid size-11 shrink-0 place-items-center rounded-full border transition ${
          open
            ? 'border-line bg-white text-ink-900 shadow-soft'
            : 'border-transparent text-ink-500 hover:border-line hover:bg-white hover:text-ink-900'
        }`}
      >
        <Palette size={18} strokeWidth={1.6} />
        <span
          className="absolute right-2 top-2 size-2 rounded-full ring-2 ring-canvas"
          style={{ backgroundColor: accent }}
        />
      </button>

      {createPortal(
        <div className="pointer-events-none fixed inset-0 z-50">
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  className="pointer-events-auto fixed inset-0 bg-ink-950/40 backdrop-blur-[2px]"
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 330 }}
              className="pointer-events-auto fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-canvas shadow-pop"
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-5">
                <div>
                  <p className="admin-eyebrow text-[10px] text-ink-400">Preferencias</p>
                  <h2 className="admin-heading mt-1 text-lg text-ink-950">Apariencia</h2>
                </div>
                <button
                  type="button"
                  aria-label="Cerrar"
                  onClick={() => setOpen(false)}
                  className="grid size-9 place-items-center rounded-full border border-transparent text-ink-500 transition hover:border-line hover:bg-white hover:text-ink-900"
                >
                  <X size={16} strokeWidth={1.6} />
                </button>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
                <section>
                  <p className="admin-eyebrow mb-3 text-[10px] text-ink-400">Tema</p>
                  <div className="grid grid-cols-3 gap-2 rounded-xl border border-line bg-paper p-1.5">
                    {MODES.map(({ id, label, icon: ModeIcon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setMode(id)}
                        className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition ${
                          mode === id
                            ? 'bg-ink-950 text-white'
                            : 'text-ink-500 hover:text-ink-900'
                        }`}
                      >
                        <ModeIcon size={14} strokeWidth={1.6} />
                        {label}
                      </button>
                    ))}
                  </div>
                  {mode === 'auto' && (
                    <p className="mt-2 text-[11px] font-semibold text-ink-400">
                      Ahora mismo: <span className="text-ink-600 capitalize">{resolved}</span> según
                      tu sistema.
                    </p>
                  )}
                </section>

                <section>
                  <p className="admin-eyebrow mb-3 text-[10px] text-ink-400">
                    Color de acento · uno solo
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {ACCENTS.map((swatch) => {
                      const active = accent.toLowerCase() === swatch.value;
                      return (
                        <button
                          key={swatch.value}
                          type="button"
                          onClick={() => setAccent(swatch.value)}
                          className={`group flex flex-col items-center gap-2 rounded-xl border p-3 transition ${
                            active
                              ? 'border-line-strong bg-paper shadow-soft'
                              : 'border-line hover:border-line-strong hover:bg-paper'
                          }`}
                        >
                          <span
                            className="grid size-9 place-items-center rounded-full ring-1 ring-black/5"
                            style={{ backgroundColor: swatch.value }}
                          >
                            {active && <Check size={15} strokeWidth={2.4} className="text-white" />}
                          </span>
                          <span className="text-[10px] font-bold text-ink-600">
                            {swatch.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-paper px-4 py-3">
                    <span className="text-xs font-bold text-ink-600">Color personalizado</span>
                    <span className="flex items-center gap-2">
                      <span
                        className="size-6 rounded-full ring-1 ring-black/10"
                        style={{ backgroundColor: accent }}
                      />
                      <span className="font-mono text-[11px] font-bold uppercase text-ink-500">
                        {accent}
                      </span>
                      <input
                        type="color"
                        value={accent}
                        onChange={(e) => setAccent(e.target.value)}
                        className="h-0 w-0 opacity-0"
                        aria-label="Elegir color de acento"
                      />
                    </span>
                  </label>

                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3">
                    <span
                      className="grid shrink-0 place-items-center rounded-lg px-3 py-1.5 text-xs font-extrabold"
                      style={{ backgroundColor: accent, color: 'var(--app-accent-ink)' }}
                    >
                      Vista previa
                    </span>
                    <span className="text-[11px] font-semibold leading-snug text-ink-400">
                      El acento se aplica al instante en toda la plataforma y queda guardado.
                    </span>
                  </div>
                </section>
              </div>

              <div className="flex items-center justify-between border-t border-line px-6 py-4 text-[11px] font-bold text-ink-400">
                <span>Guardado localmente</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold" style={{ color: 'var(--app-accent)' }}>
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: 'var(--app-accent)' }} />
                  Sync automática
                </span>
              </div>
              </motion.aside>
            </>
            )}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </>
  );
};