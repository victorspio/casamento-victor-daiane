import { useState } from 'react';
import { Truck, Plus, Pencil, Trash2, X, Save, Phone, User } from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import type { Vendor, BudgetCategory, VendorStatus } from '../types/wedding';
import { PageHeader, EmptyState, FormField, primaryBtnStyle, secondaryBtnStyle, iconBtnStyle } from './ConvidadosPage';

const CATEGORY_LABELS: Record<BudgetCategory, string> = {
  venue: '🏛️ Espaço', catering: '🍽️ Buffet', photography: '📷 Foto/Vídeo',
  music: '🎵 Música', decor: '🌸 Decoração', attire: '👗 Vestimenta', other: '📦 Outros',
};

const STATUS_CONFIG: Record<VendorStatus, { label: string; color: string; bg: string }> = {
  contracted:  { label: 'Contratado',  color: 'var(--color-success)', bg: '#f0fdf4' },
  negotiating: { label: 'Negociando',  color: 'var(--color-warning)', bg: '#fffbeb' },
  prospect:    { label: 'Em análise',  color: '#7c6aaf',              bg: '#f5f3ff' },
  declined:    { label: 'Descartado',  color: 'var(--color-danger)',  bg: '#fef2f2' },
};

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface VendorModalProps {
  initial?: Vendor;
  onSave: (data: Omit<Vendor, 'id'>) => void;
  onClose: () => void;
}

function VendorModal({ initial, onSave, onClose }: VendorModalProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    category: initial?.category ?? 'other' as BudgetCategory,
    status: initial?.status ?? 'prospect' as VendorStatus,
    contactName: initial?.contactName ?? '',
    contactEmail: initial?.contactEmail ?? '',
    contactPhone: initial?.contactPhone ?? '',
    contractValue: initial?.contractValue ?? 0,
    notes: initial?.notes ?? '',
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
        zIndex: 101, width: '100%', maxWidth: '500px',
        background: 'var(--color-surface)', borderRadius: '20px',
        border: '1px solid var(--color-border)', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        padding: '2rem', animation: 'fadeInUp 0.2s ease both',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{initial ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
          <button onClick={onClose} style={iconBtnStyle} aria-label="Fechar"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <FormField label="Nome *" id="v-name">
            <input id="v-name" required value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Buffet Sabor & Arte" />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <FormField label="Categoria" id="v-cat">
              <select id="v-cat" value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as BudgetCategory }))}>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="Status" id="v-status">
              <select id="v-status" value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as VendorStatus }))}>
                <option value="prospect">Em análise</option>
                <option value="negotiating">Negociando</option>
                <option value="contracted">Contratado</option>
                <option value="declined">Descartado</option>
              </select>
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <FormField label="Contato (nome)" id="v-cname">
              <input id="v-cname" value={form.contactName ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                placeholder="Ex: Chef Marcos" />
            </FormField>
            <FormField label="Telefone" id="v-phone">
              <input id="v-phone" type="tel" value={form.contactPhone ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                placeholder="(00) 00000-0000" />
            </FormField>
          </div>

          <FormField label="E-mail" id="v-email">
            <input id="v-email" type="email" value={form.contactEmail ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              placeholder="fornecedor@email.com" />
          </FormField>

          <FormField label="Valor do contrato (R$)" id="v-value">
            <input id="v-value" type="number" min={0} step="0.01" value={form.contractValue || ''}
              onChange={(e) => setForm((f) => ({ ...f, contractValue: e.target.value === '' ? 0 : Number(e.target.value) }))}
              placeholder="0,00" />
          </FormField>

          <FormField label="Observações" id="v-notes">
            <textarea id="v-notes" rows={2} value={form.notes ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Detalhes do contrato, pendências..." style={{ resize: 'vertical' }} />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={secondaryBtnStyle}>Cancelar</button>
            <button type="submit" style={primaryBtnStyle}><Save size={14} /> Salvar</button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export function FornecedoresPage() {
  const { vendors, addVendor, updateVendor, deleteVendor } = useWedding();
  const [modal, setModal] = useState<{ open: boolean; editing?: Vendor }>({ open: false });
  const [filterStatus, setFilterStatus] = useState<'all' | VendorStatus>('all');

  const contracted = vendors.filter((v) => v.status === 'contracted').length;
  const totalContracted = vendors
    .filter((v) => v.status === 'contracted')
    .reduce((a, v) => a + (v.contractValue ?? 0), 0);

  const filtered = filterStatus === 'all' ? vendors : vendors.filter((v) => v.status === filterStatus);

  function handleSave(data: Omit<Vendor, 'id'>) {
    if (modal.editing) updateVendor(modal.editing.id, data);
    else addVendor(data);
    setModal({ open: false });
  }

  return (
    <div>
      <PageHeader
        icon={<Truck size={22} color="var(--color-brand)" />}
        title="Fornecedores"
        sub={`${vendors.length} cadastrados · ${contracted} contratados · Total: ${fmt(totalContracted)}`}
        action={
          <button id="btn-add-vendor" onClick={() => setModal({ open: true })} style={primaryBtnStyle}>
            <Plus size={16} /> Fornecedor
          </button>
        }
      />

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {(['all', 'contracted', 'negotiating', 'prospect', 'declined'] as const).map((s) => {
          const cfg = s === 'all'
            ? { label: 'Todos', color: 'var(--color-text-secondary)', bg: 'var(--color-surface-2)' }
            : STATUS_CONFIG[s];
          const count = s === 'all' ? vendors.length : vendors.filter((v) => v.status === s).length;
          return (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: '5px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
              border: `1px solid ${filterStatus === s ? cfg.color : 'var(--color-border)'}`,
              background: filterStatus === s ? (s === 'all' ? 'var(--color-surface-2)' : (cfg as typeof STATUS_CONFIG[VendorStatus]).bg) : 'transparent',
              color: filterStatus === s ? cfg.color : 'var(--color-text-secondary)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Vendor cards grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Truck size={40} color="var(--color-border)" />}
          message={vendors.length === 0 ? 'Nenhum fornecedor cadastrado ainda.' : 'Nenhum fornecedor com esse filtro.'}
          action={vendors.length === 0 ? (
            <button onClick={() => setModal({ open: true })} style={primaryBtnStyle}><Plus size={14} /> Adicionar fornecedor</button>
          ) : undefined}
        />
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filtered.map((v) => {
            const st = STATUS_CONFIG[v.status];
            return (
              <div key={v.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{v.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {CATEGORY_LABELS[v.category]}
                    </p>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, color: st.color, background: st.bg, flexShrink: 0, marginLeft: '8px' }}>
                    {st.label}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '0.75rem' }}>
                  {v.contactName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                      <User size={12} /> {v.contactName}
                    </div>
                  )}
                  {v.contactPhone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                      <Phone size={12} /> {v.contactPhone}
                    </div>
                  )}
                  {v.contractValue ? (
                    <p style={{ margin: '4px 0 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-brand)' }}>{fmt(v.contractValue)}</p>
                  ) : null}
                </div>

                {v.notes && (
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                    {v.notes}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                  <button onClick={() => setModal({ open: true, editing: v })} style={iconBtnStyle} title="Editar"><Pencil size={14} /></button>
                  <button onClick={() => deleteVendor(v.id)} style={{ ...iconBtnStyle, color: 'var(--color-danger)' }} title="Excluir"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal.open && (
        <VendorModal
          initial={modal.editing}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
