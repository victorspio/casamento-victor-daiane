import { useState, useEffect } from 'react';
import { DollarSign, Plus, Pencil, Trash2, X, Save, TrendingUp, Wallet, CheckCircle } from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import type { BudgetItem, BudgetCategory } from '../types/wedding';
import { PageHeader, EmptyState, FormField, primaryBtnStyle, secondaryBtnStyle, iconBtnStyle } from './ConvidadosPage';

const CATEGORY_LABELS: Record<BudgetCategory, string> = {
  venue: '🏛️ Espaço', catering: '🍽️ Buffet', photography: '📷 Foto/Vídeo',
  music: '🎵 Música', decor: '🌸 Decoração', attire: '👗 Vestimenta', other: '📦 Outros',
};

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ItemModalProps {
  initial?: BudgetItem;
  onSave: (data: Omit<BudgetItem, 'id'>) => void;
  onClose: () => void;
}

function ItemModal({ initial, onSave, onClose }: ItemModalProps) {
  const [form, setForm] = useState({
    category: initial?.category ?? 'other' as BudgetCategory,
    description: initial?.description ?? '',
    estimatedValue: initial?.estimatedValue ?? 0,
    paidValue: initial?.paidValue ?? 0,
    isPaid: initial?.isPaid ?? false,
    vendor: initial?.vendor ?? '',
    dueDate: initial?.dueDate ? initial.dueDate.slice(0, 10) : '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim()) return;
    onSave({ ...form, dueDate: form.dueDate ? `${form.dueDate}T12:00:00` : undefined });
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 100 }} aria-hidden="true" />
      <div role="dialog" aria-modal="true" style={{
        position: 'fixed', inset: 0, margin: 'auto',
        zIndex: 101, width: '100%', maxWidth: '480px',
        background: 'var(--color-surface)', borderRadius: '20px',
        border: '1px solid var(--color-border)', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        padding: '2rem', animation: 'fadeInUp 0.2s ease both',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{initial ? 'Editar Item' : 'Novo Item'}</h2>
          <button onClick={onClose} style={iconBtnStyle} aria-label="Fechar"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <FormField label="Categoria" id="b-cat">
            <select id="b-cat" value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as BudgetCategory }))}>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </FormField>

          <FormField label="Descrição *" id="b-desc">
            <input id="b-desc" required value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Ex: Aluguel do espaço" />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <FormField label="Valor estimado (R$)" id="b-est">
              <input id="b-est" type="number" min={0} step="0.01" value={form.estimatedValue || ''}
                onChange={(e) => setForm((f) => ({ ...f, estimatedValue: e.target.value === '' ? 0 : Number(e.target.value) }))}
                placeholder="0,00" />
            </FormField>
            <FormField label="Valor pago (R$)" id="b-paid">
              <input id="b-paid" type="number" min={0} step="0.01" value={form.paidValue || ''}
                onChange={(e) => setForm((f) => ({ ...f, paidValue: e.target.value === '' ? 0 : Number(e.target.value) }))}
                placeholder="0,00" />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <FormField label="Fornecedor" id="b-vendor">
              <input id="b-vendor" value={form.vendor ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))}
                placeholder="Ex: Buffet Sabor & Arte" />
            </FormField>
            <FormField label="Vencimento" id="b-due">
              <input id="b-due" type="date" value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            </FormField>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            <input type="checkbox" checked={form.isPaid}
              onChange={(e) => setForm((f) => ({ ...f, isPaid: e.target.checked }))}
              style={{ accentColor: 'var(--color-brand)', width: '16px', height: '16px' }} />
            Pago integralmente
          </label>

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
export function FinanceiroPage() {
  const { config, updateConfig, budgetItems, addBudgetItem, updateBudgetItem, deleteBudgetItem } = useWedding();
  const [modal, setModal] = useState<{ open: boolean; editing?: BudgetItem }>({ open: false });

  const targetBudget = config.targetBudget ?? 0;
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInputValue, setBudgetInputValue] = useState(targetBudget === 0 ? '' : targetBudget.toString());

  useEffect(() => {
    setBudgetInputValue(targetBudget === 0 ? '' : targetBudget.toString());
  }, [targetBudget]);

  const totalEstimated = budgetItems.reduce((a, i) => a + i.estimatedValue, 0);
  const totalPaid = budgetItems.reduce((a, i) => a + i.paidValue, 0);
  const remaining = targetBudget > 0 ? targetBudget - totalEstimated : 0;
  const paidPercent = totalEstimated > 0 ? Math.round((totalPaid / totalEstimated) * 100) : 0;

  function handleSave(data: Omit<BudgetItem, 'id'>) {
    if (modal.editing) updateBudgetItem(modal.editing.id, data);
    else addBudgetItem(data);
    setModal({ open: false });
  }

  function handleSaveBudget() {
    updateConfig({
      ...config,
      targetBudget: Number(budgetInputValue) || 0,
    });
    setIsEditingBudget(false);
  }

  // Group by category
  const byCategory = budgetItems.reduce<Record<string, BudgetItem[]>>((acc, item) => {
    acc[item.category] = [...(acc[item.category] ?? []), item];
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        icon={<DollarSign size={22} color="var(--color-brand)" />}
        title="Financeiro"
        sub={`${budgetItems.length} itens · Total estimado: ${fmt(totalEstimated)}`}
        action={
          <button id="btn-add-budget" onClick={() => setModal({ open: true })} style={primaryBtnStyle}>
            <Plus size={16} /> Item
          </button>
        }
      />

      {/* Summary bar */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Target Budget Editor */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Limite de Gastos Planejado
            </p>
            {isEditingBudget ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand)' }}>R$</span>
                <input
                  type="number"
                  value={budgetInputValue}
                  onChange={(e) => setBudgetInputValue(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    border: '1px solid var(--color-brand)',
                    borderRadius: '8px',
                    width: '140px',
                    background: 'var(--color-surface-2)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />
                <button onClick={handleSaveBudget} style={{ ...primaryBtnStyle, padding: '6px 12px', fontSize: '0.78rem' }}>Definir</button>
                <button onClick={() => { setIsEditingBudget(false); setBudgetInputValue(targetBudget.toString()); }} style={{ ...secondaryBtnStyle, padding: '6px 12px', fontSize: '0.78rem' }}>Cancelar</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-brand)' }}>
                  {fmt(targetBudget)}
                </span>
                <button
                  onClick={() => { setIsEditingBudget(true); setBudgetInputValue(targetBudget.toString()); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-brand)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Pencil size={12} /> Definir limite
                </button>
              </div>
            )}
          </div>
          {targetBudget > 0 && (
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status do Orçamento</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.9rem', fontWeight: 700, color: totalEstimated > targetBudget ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {totalEstimated > targetBudget 
                  ? `Estourou por ${fmt(totalEstimated - targetBudget)}` 
                  : `Dentro da meta (resta ${fmt(targetBudget - totalEstimated)})`}
              </p>
            </div>
          )}
        </div>

        {budgetItems.length > 0 ? (
          <>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {[
                { label: 'Total estimado', value: fmt(totalEstimated), icon: <Wallet size={16} />, color: 'var(--color-brand)', bg: 'var(--color-brand-bg)' },
                { label: 'Total pago', value: fmt(totalPaid), icon: <CheckCircle size={16} />, color: 'var(--color-success)', bg: '#f0fdf4' },
                { label: 'Disponível do limite', value: fmt(targetBudget > 0 ? remaining : 0), icon: <TrendingUp size={16} />, color: remaining >= 0 ? 'var(--color-success)' : 'var(--color-danger)', bg: remaining >= 0 ? '#f0fdf4' : '#fef2f2' },
              ].map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '140px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: s.color }}>{s.icon}</span>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: s.color }}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Progresso de pagamento</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: 700 }}>{paidPercent}%</span>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${paidPercent}%` }} /></div>
            </div>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem 0' }}>
            Nenhum item adicionado à lista. Use o botão "+ Item" acima para começar a adicionar custos.
          </p>
        )}
      </div>

      {/* Items grouped by category */}
      {budgetItems.length === 0 ? (
        <EmptyState
          icon={<DollarSign size={40} color="var(--color-border)" />}
          message="Nenhum item de orçamento cadastrado ainda."
          action={<button onClick={() => setModal({ open: true })} style={primaryBtnStyle}><Plus size={14} /> Adicionar item</button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat}>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>
                {CATEGORY_LABELS[cat as BudgetCategory] ?? cat}
              </h3>
              <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
                      {['Descrição', 'Fornecedor', 'Estimado', 'Pago', 'Status', ''].map((h) => (
                        <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '10px 14px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.description}</td>
                        <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{item.vendor || '—'}</td>
                        <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>{fmt(item.estimatedValue)}</td>
                        <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>{fmt(item.paidValue)}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, color: item.isPaid ? 'var(--color-success)' : 'var(--color-warning)', background: item.isPaid ? '#f0fdf4' : '#fffbeb' }}>
                            {item.isPaid ? '✓ Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setModal({ open: true, editing: item })} style={iconBtnStyle} title="Editar"><Pencil size={14} /></button>
                            <button onClick={() => deleteBudgetItem(item.id)} style={{ ...iconBtnStyle, color: 'var(--color-danger)' }} title="Excluir"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <ItemModal
          initial={modal.editing}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
