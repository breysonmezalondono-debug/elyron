import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Plus, Search, X } from 'lucide-react';
import { IconTile } from '../../components/elyron/IconTile';
import { useInstitution } from '../../context/useInstitution';
import { useAuth } from '../../context/useAuth';
import { INITIAL_COMPANIES } from '../../model/mock/companyData';
import type { Company } from '../../model/mock/companyData';

const EMPTY_FORM = {
  name: '',
  nit: '',
  address: '',
  phone: '',
  email: '',
};

export const EmpresasView = () => {
  const { institution } = useInstitution();
  const { activeRole } = useAuth();
  const puedeGestionar = activeRole === 'instructor';
  const [empresas, setEmpresas] = useState<Company[]>(INITIAL_COMPANIES);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [scope, setScope] = useState<'mias' | 'todas'>('mias');

  const scoped = useMemo(
    () =>
      scope === 'mias'
        ? empresas.filter((e) => e.institutions.includes(institution.type))
        : empresas,
    [empresas, scope, institution.type],
  );

  const filtered = scoped.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.nit.includes(query),
  );

  const toggleActive = (id: string) =>
    setEmpresas((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e)),
    );

  const updateForm = (key: keyof typeof EMPTY_FORM) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.nit.trim()) return;
    setEmpresas((prev) => [
      {
        id: `emp-${Date.now()}`,
        name: form.name.trim(),
        nit: form.nit.trim(),
        address: form.address.trim() || '—',
        phone: form.phone.trim() || '—',
        email: form.email.trim() || '—',
        isActive: true,
        institutions: [institution.type],
      },
      ...prev,
    ]);
    setForm(EMPTY_FORM);
    setModalOpen(false);
  };

  const canSubmit = form.name.trim().length > 2 && form.nit.trim().length > 3;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">Convenios</p>
          <h1 className="display mt-2 text-3xl text-ink-950 sm:text-4xl">
            Empresas <span className="italic">aliadas</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-ink-500">
            {scope === 'mias'
              ? `${scoped.length} empresas en convenio con ${institution.name}.`
              : `${scoped.length} empresas en la red de todas las instituciones.`}
          </p>
        </div>
        {puedeGestionar && (
          <button type="button" onClick={() => setModalOpen(true)} className="btn-pill btn-pill-mint">
            <Plus size={15} strokeWidth={3} />
            Nueva empresa
          </button>
        )}
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setScope((s) => (s === 'mias' ? 'todas' : 'mias'))}
          className="inline-flex items-center gap-2 rounded-full bg-canvas-deep px-4 py-2 text-xs font-bold text-ink-600 ring-1 ring-line transition-colors hover:bg-white hover:text-ink-900 hover:shadow-soft"
        >
          {scope === 'mias'
            ? `Convenios · ${institution.shortName}`
            : 'Mostrando todas las instituciones'}
        </button>

        <div className="surface flex h-11 min-w-64 flex-1 items-center gap-2.5 rounded-full px-5">
          <Search size={16} className="shrink-0 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por razón social o NIT…"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-ink-400"
          />
        </div>
      </div>

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Razón Social</th>
                <th>NIT</th>
                <th>Contacto</th>
                <th>Estado</th>
                {puedeGestionar && <th className="text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <span className="flex items-center gap-3">
                      <IconTile
                        icon={Building2}
                        variant={emp.isActive ? 'mint' : 'paper'}
                        size="sm"
                      />
                      <span>
                        <span className="block text-sm font-extrabold text-ink-900">{emp.name}</span>
                        <span className="block text-xs font-medium text-ink-400">{emp.address}</span>
                      </span>
                    </span>
                  </td>
                  <td className="font-mono text-xs font-bold text-ink-600">{emp.nit}</td>
                  <td>
                    <span className="block text-xs font-semibold text-ink-700">{emp.email}</span>
                    <span className="block text-xs font-medium text-ink-400">{emp.phone}</span>
                  </td>
                  <td>
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${
                        emp.isActive
                          ? 'bg-mint-50 text-mint-700 ring-mint-200'
                          : 'bg-canvas-deep text-ink-400 ring-line-strong'
                      }`}
                    >
                      {emp.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  {puedeGestionar && (
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => toggleActive(emp.id)}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                          emp.isActive
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-mint-700 hover:bg-mint-50'
                        }`}
                      >
                        {emp.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={puedeGestionar ? 5 : 4} className="py-10 text-center text-sm font-semibold text-ink-400">
                    Sin resultados para “{query}”
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-ink-950/30 p-4 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.form
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onSubmit={handleCreate}
              onClick={(e) => e.stopPropagation()}
              className="elevated-pop w-full max-w-md rounded-[28px] bg-white p-7"
            >
              <div className="flex items-start justify-between">
                <h2 className="display text-2xl text-ink-950">Nueva empresa</h2>
                <button
                  type="button"
                  aria-label="Cerrar"
                  onClick={() => setModalOpen(false)}
                  className="grid size-8 place-items-center rounded-full text-ink-400 transition hover:bg-canvas-deep hover:text-ink-800"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <input value={form.name} onChange={updateForm('name')} placeholder="Razón social *" className="input" required />
                <input value={form.nit} onChange={updateForm('nit')} placeholder="NIT *" className="input" required />
                <input value={form.address} onChange={updateForm('address')} placeholder="Dirección" className="input" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.phone} onChange={updateForm('phone')} placeholder="Teléfono" className="input" />
                  <input value={form.email} onChange={updateForm('email')} placeholder="Correo" className="input" />
                </div>
              </div>

              <p className="mt-4 text-[11px] font-semibold text-ink-400">
                Se registrará en el convenio de {institution.name}.
              </p>

              <button type="submit" disabled={!canSubmit} className="btn-pill btn-pill-mint mt-4 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50">
                Registrar empresa
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
