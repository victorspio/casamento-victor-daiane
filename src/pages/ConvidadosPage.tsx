import { useState } from 'react';
import { Users, Plus, Pencil, Trash2, X, Save, CheckCircle, Clock, XCircle, Link2, Check } from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import type { Guest, RsvpStatus } from '../types/wedding';

// ─── Modal de Convidado ───────────────────────────────────────────────────────
interface GuestModalProps {
  initial?: Guest;
  onSave: (data: Omit<Guest, 'id'>) => void;
  onClose: () => void;
}

function GuestModal({ initial, onSave, onClose }: GuestModalProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    group: initial?.group ?? '',
    status: initial?.status ?? 'pending' as RsvpStatus,
    plusOne: false,
    tableNumber: initial?.tableNumber ?? undefined as number | undefined,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 100 }} aria-hidden="true" />
      <div role="dialog" aria-modal="true" style={{
        position: 'fixed', inset: 0, margin: 'auto',
        zIndex: 101, width: '100%', maxWidth: '440px',
        background: 'var(--color-surface)', borderRadius: '20px',
        border: '1px solid var(--color-border)', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        padding: '2rem', animation: 'fadeInUp 0.2s ease both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {initial ? 'Editar Convidado' : 'Novo Convidado'}
          </h2>
          <button onClick={onClose} style={iconBtnStyle} aria-label="Fechar"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <FormField label="Nome completo *" id="g-name">
            <input id="g-name" required value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Ana Silva" />
          </FormField>

          <FormField label="Grupo / Família" id="g-group">
            <input id="g-group" value={form.group}
              onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
              placeholder="Ex: Família da Noiva" />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <FormField label="Status RSVP" id="g-status">
              <select id="g-status" value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as RsvpStatus }))}>
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="declined">Recusado</option>
              </select>
            </FormField>
            <FormField label="Mesa nº" id="g-table">
              <input id="g-table" type="number" min={1}
                value={form.tableNumber ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, tableNumber: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="—" />
            </FormField>
          </div>



          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={secondaryBtnStyle}>Cancelar</button>
            <button type="submit" style={primaryBtnStyle}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export function ConvidadosPage() {
  const { guests, addGuest, updateGuest, deleteGuest } = useWedding();
  const [modal, setModal] = useState<{ open: boolean; editing?: Guest }>({ open: false });
  const [filter, setFilter] = useState<'all' | RsvpStatus>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const confirmed = guests.filter((g) => g.status === 'confirmed').length;
  const pending = guests.filter((g) => g.status === 'pending').length;
  const declined = guests.filter((g) => g.status === 'declined').length;


  const filtered = filter === 'all' ? guests : guests.filter((g) => g.status === filter);

  function handleSave(data: Omit<Guest, 'id'>) {
    if (modal.editing) {
      updateGuest(modal.editing.id, data);
    } else {
      addGuest(data);
    }
    setModal({ open: false });
  }

  function copyRsvpLink(guestId: string) {
    const link = `${window.location.origin}/rsvp/${guestId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(guestId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <div>
      <PageHeader
        icon={<Users size={22} color="var(--color-brand)" />}
        title="Convidados"
        sub={`${guests.length} convidados cadastrados · ${confirmed} confirmados`}
        action={
          <button id="btn-add-guest" onClick={() => setModal({ open: true })} style={primaryBtnStyle}>
            <Plus size={16} /> Convidado
          </button>
        }
      />

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { label: 'Todos', value: 'all', count: guests.length, color: 'var(--color-text-secondary)', bg: 'var(--color-surface-2)' },
          { label: 'Confirmados', value: 'confirmed', count: confirmed, color: 'var(--color-success)', bg: '#f0fdf4' },
          { label: 'Pendentes', value: 'pending', count: pending, color: 'var(--color-warning)', bg: '#fffbeb' },
          { label: 'Recusados', value: 'declined', count: declined, color: 'var(--color-danger)', bg: '#fef2f2' },
        ].map((chip) => (
          <button
            key={chip.value}
            onClick={() => setFilter(chip.value as typeof filter)}
            style={{
              padding: '6px 14px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
              border: `1px solid ${filter === chip.value ? chip.color : 'var(--color-border)'}`,
              background: filter === chip.value ? chip.bg : 'transparent',
              color: filter === chip.value ? chip.color : 'var(--color-text-secondary)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {chip.label} ({chip.count})
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={40} color="var(--color-border)" />}
          message={guests.length === 0 ? 'Nenhum convidado cadastrado ainda.' : 'Nenhum convidado com esse filtro.'}
          action={guests.length === 0 ? (
            <button onClick={() => setModal({ open: true })} style={primaryBtnStyle}><Plus size={14} /> Adicionar convidado</button>
          ) : undefined}
        />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
                {['Nome', 'Grupo', 'Status', 'Mesa', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{g.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{g.group || '—'}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={g.status} /></td>
                  <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{g.tableNumber ?? '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => copyRsvpLink(g.id)}
                        style={{
                          ...iconBtnStyle,
                          color: copiedId === g.id ? 'var(--color-success)' : 'var(--color-brand)',
                          background: copiedId === g.id ? '#f0fdf4' : 'var(--color-surface-2)',
                        }}
                        title={copiedId === g.id ? "Link copiado!" : "Copiar convite individual"}
                      >
                        {copiedId === g.id ? <Check size={14} /> : <Link2 size={14} />}
                      </button>
                      <button onClick={() => setModal({ open: true, editing: g })} style={iconBtnStyle} title="Editar"><Pencil size={14} /></button>
                      <button onClick={() => deleteGuest(g.id)} style={{ ...iconBtnStyle, color: 'var(--color-danger)' }} title="Excluir"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <GuestModal
          initial={modal.editing}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: RsvpStatus }) {
  const map = {
    confirmed: { label: 'Confirmado', color: 'var(--color-success)', bg: '#f0fdf4', icon: <CheckCircle size={12} /> },
    pending:   { label: 'Pendente',   color: 'var(--color-warning)', bg: '#fffbeb', icon: <Clock size={12} /> },
    declined:  { label: 'Recusado',   color: 'var(--color-danger)',  bg: '#fef2f2', icon: <XCircle size={12} /> },
  };
  const s = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, color: s.color, background: s.bg }}>
      {s.icon} {s.label}
    </span>
  );
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────
export function PageHeader({ icon, title, sub, action }: { icon: React.ReactNode; title: string; sub: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--color-brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <div>
          <h1 className="font-display" style={{ margin: 0, fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</h1>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{sub}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, message, action }: { icon: React.ReactNode; message: string; action?: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
      {icon}
      <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{message}</p>
      {action}
    </div>
  );
}

export function FormField({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label htmlFor={id} style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>{label}</label>
      <div className="form-field-wrap">{children}</div>
      <style>{`
        .form-field-wrap input, .form-field-wrap select, .form-field-wrap textarea {
          width: 100%; padding: 9px 12px;
          border: 1px solid var(--color-border); border-radius: 10px;
          font-size: 0.85rem; font-family: var(--font-body);
          color: var(--color-text-primary); background: var(--color-surface-2);
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .form-field-wrap input:focus, .form-field-wrap select:focus, .form-field-wrap textarea:focus {
          border-color: var(--color-brand);
          box-shadow: 0 0 0 3px rgba(176,141,110,0.15);
        }
      `}</style>
    </div>
  );
}

export const primaryBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  background: 'var(--color-brand)', color: '#fff',
  border: 'none', borderRadius: '10px', cursor: 'pointer',
  padding: '9px 18px', fontSize: '0.85rem', fontWeight: 600,
};

export const secondaryBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)',
  border: '1px solid var(--color-border)', borderRadius: '10px', cursor: 'pointer',
  padding: '9px 18px', fontSize: '0.85rem', fontWeight: 500,
};

export const iconBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '30px', height: '30px', borderRadius: '8px',
  background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
  cursor: 'pointer', color: 'var(--color-text-secondary)',
};
