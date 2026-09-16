import { AnimatePresence, motion } from 'framer-motion';
import { Check, FileText, X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onAceptar: () => void;
}

const Seccion = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <h3 className="text-sm font-extrabold tracking-tight text-ink-900 dark:text-white">{titulo}</h3>
    <div className="space-y-1.5 text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
      {children}
    </div>
  </div>
);

/**
 * Modal de Términos y Condiciones de Elyron.
 * Se muestra en el registro: el usuario debe abrirlo, leerlo (incluida la
 * retención de datos por un período) y aceptarlo con el botón dedicado.
 */
export const TerminosCondicionesModal = ({ open, onClose, onAceptar }: Props) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 grid place-items-center bg-ink-950/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] bg-white shadow-lift ring-1 ring-line dark:bg-ink-900"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line/70 px-6 py-4 dark:border-ink-700/70">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-mint-500/15 text-mint-600 dark:text-mint-400">
                  <FileText size={18} />
                </span>
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-ink-950 dark:text-white">
                    Términos y condiciones
                  </h2>
                  <p className="text-xs font-semibold text-ink-400">
                    Última actualización: {new Date().toLocaleDateString('es-CO')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="rounded-xl p-2 text-ink-400 transition hover:bg-canvas-deep hover:text-ink-800 dark:hover:bg-ink-800 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <Seccion titulo="1. Aceptación de los términos">
                <p>
                  Al crear una cuenta en Elyron aceptas estos términos y condiciones y la política de
                  privacidad y protección de datos personales. Si no estás de acuerdo, no debes crear
                  la cuenta.
                </p>
              </Seccion>

              <Seccion titulo="2. Uso de la plataforma">
                <p>
                  Elyron es una plataforma de gestión académica. Los datos que registras se utilizan
                  para tu proceso de formación, seguimiento académico, comunicación institucional y
                  generación de tu trayectoria.
                </p>
              </Seccion>

              <Seccion titulo="3. Conservación y retención de tus datos">
                <p>
                  <strong>Tus datos no se eliminan de inmediato.</strong> Por razones legales,
                  académicas y de trazabilidad, la información de tu cuenta y de tu proceso se
                  conserva durante un periodo de retención definido por la institución (generalmente
                  5 años después de finalizar tu proceso formativo), conforme a la normativa
                  colombiana de protección de datos.
                </p>
                <p>
                  Cuando solicites la eliminación de tu cuenta, tus datos personales podrán ser
                  conservados de forma limitada durante el tiempo que exija la ley, para cumplir
                  obligaciones legales o académicas, antes de su eliminación definitiva.
                </p>
              </Seccion>

              <Seccion titulo="4. Protección de la información">
                <p>
                  Tus datos se tratan de forma confidencial y segura: contraseñas encriptadas,
                  control de acceso por roles y permisos, y protección contra accesos no autorizados.
                  Solo el personal autorizado de tu institución puede acceder a tu información.
                </p>
              </Seccion>

              <Seccion titulo="5. Responsabilidades del usuario">
                <p>
                  Eres responsable de la veracidad de los datos que registras y de mantener segura tu
                  contraseña. Elyron no se hace responsable por el uso indebido de una cuenta cuyas
                  credenciales hayan sido compartidas por el titular.
                </p>
              </Seccion>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-line/70 px-6 py-4 dark:border-ink-700/70">
              <button type="button" onClick={onClose} className="btn-pill btn-pill-paper">
                Rechazar
              </button>
              <button
                type="button"
                onClick={onAceptar}
                className="btn-pill btn-pill-mint"
              >
                <Check size={15} />
                Aceptar términos y condiciones
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};