import { useState } from 'react';
import {
  Gift, Plus, Pencil, Trash2, ExternalLink, Save, X,
  CheckCircle2, Circle, Link, Tag, ArrowUp, ArrowDown,
  Eye,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import type { GiftItem } from '../types/wedding';

type FormState = {
  name: string;
  url: string;
  category: string;
};

const EMPTY_FORM: FormState = { name: '', url: '', category: '' };

export function ListaPresentesPage() {
  const { giftItems, addGiftItem, updateGiftItem, deleteGiftItem } = useWedding();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const total = giftItems.length;
  const purchased = giftItems.filter(g => g.isPurchased).length;
  const pending = total - purchased;

  // ── Form handlers ────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item: GiftItem) => {
    setEditingId(item.id);
    setForm({ name: item.name, url: item.url ?? '', category: item.category ?? '' });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateGiftItem(editingId, {
          name: form.name.trim(),
          url: form.url.trim() || undefined,
          category: form.category.trim() || undefined,
        });
      } else {
        await addGiftItem({
          name: form.name.trim(),
          url: form.url.trim() || undefined,
          category: form.category.trim() || undefined,
          isPurchased: false,
          sortOrder: giftItems.length,
        });
      }
      closeForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteGiftItem(id);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleTogglePurchased = async (item: GiftItem) => {
    await updateGiftItem(item.id, {
      isPurchased: !item.isPurchased,
      purchasedAt: !item.isPurchased ? new Date().toISOString() : undefined,
    });
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const a = giftItems[index];
    const b = giftItems[index - 1];
    await Promise.all([
      updateGiftItem(a.id, { sortOrder: b.sortOrder }),
      updateGiftItem(b.id, { sortOrder: a.sortOrder }),
    ]);
  };

  const handleMoveDown = async (index: number) => {
    if (index === giftItems.length - 1) return;
    const a = giftItems[index];
    const b = giftItems[index + 1];
    await Promise.all([
      updateGiftItem(a.id, { sortOrder: b.sortOrder }),
      updateGiftItem(b.id, { sortOrder: a.sortOrder }),
    ]);
  };

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '860px', margin: '0 auto' }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
              Lista de Presentes
            </h1>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              Gerencie os presentes que os convidados poderão presentear
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a
              href="/presentes"
              target="_blank"
              rel="noopener noreferrer"
              title="Ver página pública dos convidados"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 500,
                background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)', textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-brand-bg)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
            >
              <Eye size={14} />
              Ver página pública
            </a>
            <button
              id="btn-add-gift"
              onClick={openAdd}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600,
                background: 'var(--color-brand)', color: '#fff', border: 'none',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-brand-dark)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-brand)'}
            >
              <Plus size={16} />
              Adicionar presente
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Total de presentes', value: total, color: 'var(--color-brand)' },
          { label: 'Já comprados', value: purchased, color: 'var(--color-success)' },
          { label: 'Ainda disponíveis', value: pending, color: 'var(--color-warning)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color, fontFamily: 'var(--font-sans)' }}>{value}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Add/Edit Form ────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="card animate-fade-in-up" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--color-brand-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gift size={16} color="var(--color-brand)" />
              {editingId ? 'Editar presente' : 'Novo presente'}
            </h2>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Nome */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Nome do produto *
              </label>
              <input
                id="gift-name-input"
                type="text"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Jogo de panelas antiaderente"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem',
                  border: '1px solid var(--color-border)', background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)', outline: 'none',
                  transition: 'border-color 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>

            {/* Link */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                <Link size={11} />
                Link do produto
              </label>
              <input
                id="gift-url-input"
                type="url"
                value={form.url}
                onChange={(e) => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://www.magazineluiza.com.br/..."
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem',
                  border: '1px solid var(--color-border)', background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)', outline: 'none',
                  transition: 'border-color 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>

            {/* Categoria */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                <Tag size={11} />
                Categoria (opcional)
              </label>
              <input
                id="gift-category-input"
                type="text"
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="Ex: Cozinha, Quarto, Casa..."
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem',
                  border: '1px solid var(--color-border)', background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)', outline: 'none',
                  transition: 'border-color 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-brand)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <button
              onClick={closeForm}
              style={{
                padding: '8px 18px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500,
                background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)', cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              id="btn-save-gift"
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              style={{
                padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                background: saving || !form.name.trim() ? 'var(--color-border)' : 'var(--color-brand)',
                color: saving || !form.name.trim() ? 'var(--color-text-muted)' : '#fff',
                border: 'none', cursor: saving || !form.name.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s',
              }}
            >
              <Save size={14} />
              {saving ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Adicionar'}
            </button>
          </div>
        </div>
      )}

      {/* ── Gift List ────────────────────────────────────────────────────────── */}
      {giftItems.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Gift size={40} color="var(--color-text-muted)" style={{ opacity: 0.4, marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Nenhum presente cadastrado
          </h3>
          <p style={{ margin: '0 0 1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Adicione os presentes que os convidados podem te dar.
          </p>
          <button
            onClick={openAdd}
            style={{
              padding: '10px 22px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600,
              background: 'var(--color-brand)', color: '#fff', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Plus size={16} />
            Adicionar primeiro presente
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {giftItems.map((item, index) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '0.9rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                opacity: item.isPurchased ? 0.75 : 1,
                background: item.isPurchased
                  ? 'linear-gradient(135deg, #f0fdf4, #f7fef9)'
                  : 'var(--color-surface)',
              }}
            >
              {/* Reordenar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flexShrink: 0 }}>
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  title="Mover para cima"
                  style={{
                    background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer',
                    color: index === 0 ? 'var(--color-border)' : 'var(--color-text-muted)',
                    padding: '1px', lineHeight: 1,
                  }}
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === giftItems.length - 1}
                  title="Mover para baixo"
                  style={{
                    background: 'none', border: 'none',
                    cursor: index === giftItems.length - 1 ? 'not-allowed' : 'pointer',
                    color: index === giftItems.length - 1 ? 'var(--color-border)' : 'var(--color-text-muted)',
                    padding: '1px', lineHeight: 1,
                  }}
                >
                  <ArrowDown size={13} />
                </button>
              </div>

              {/* Toggle comprado */}
              <button
                onClick={() => handleTogglePurchased(item)}
                title={item.isPurchased ? 'Marcar como disponível' : 'Marcar como comprado'}
                style={{
                  flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                  color: item.isPurchased ? '#22c55e' : 'var(--color-border)',
                  transition: 'color 0.2s',
                }}
              >
                {item.isPurchased
                  ? <CheckCircle2 size={20} fill="#22c55e" color="#fff" />
                  : <Circle size={20} />
                }
              </button>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.9rem', fontWeight: 600,
                        color: item.isPurchased ? 'var(--color-text-muted)' : 'var(--color-brand-dark)',
                        textDecoration: item.isPurchased ? 'line-through' : 'none',
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (!item.isPurchased) (e.currentTarget as HTMLElement).style.color = 'var(--color-brand)';
                      }}
                      onMouseLeave={(e) => {
                        if (!item.isPurchased) (e.currentTarget as HTMLElement).style.color = 'var(--color-brand-dark)';
                      }}
                    >
                      {item.name}
                      <ExternalLink size={12} style={{ opacity: 0.5 }} />
                    </a>
                  ) : (
                    <span style={{
                      fontSize: '0.9rem', fontWeight: 600,
                      color: item.isPurchased ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                      textDecoration: item.isPurchased ? 'line-through' : 'none',
                    }}>
                      {item.name}
                    </span>
                  )}

                  {item.category && (
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.06em',
                      textTransform: 'uppercase', padding: '2px 7px', borderRadius: '999px',
                      background: 'var(--color-surface-2)', color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                    }}>
                      {item.category}
                    </span>
                  )}

                  {item.isPurchased && (
                    <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 500 }}>
                      ✓ Comprado
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                <button
                  onClick={() => openEdit(item)}
                  title="Editar"
                  style={{
                    padding: '6px', borderRadius: '8px', background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)', cursor: 'pointer',
                    color: 'var(--color-text-secondary)', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-brand-bg)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'}
                >
                  <Pencil size={14} />
                </button>

                {confirmDeleteId === item.id ? (
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-danger)', fontWeight: 500 }}>Confirmar?</span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      style={{
                        padding: '5px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600,
                        background: 'var(--color-danger)', color: '#fff', border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {deletingId === item.id ? '…' : 'Sim'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      style={{
                        padding: '5px 8px', borderRadius: '6px', fontSize: '0.72rem',
                        background: 'var(--color-surface-2)', color: 'var(--color-text-muted)',
                        border: '1px solid var(--color-border)', cursor: 'pointer',
                      }}
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(item.id)}
                    title="Remover"
                    style={{
                      padding: '6px', borderRadius: '8px', background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)', cursor: 'pointer',
                      color: 'var(--color-text-muted)', transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#fef2f2';
                      (e.currentTarget as HTMLElement).style.color = 'var(--color-danger)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Dica público URL ─────────────────────────────────────────────────── */}
      {giftItems.length > 0 && (
        <div style={{
          marginTop: '2rem',
          background: 'var(--color-brand-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <ExternalLink size={16} color="var(--color-brand)" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
            Compartilhe o link{' '}
            <a
              href="/presentes"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-brand)', fontWeight: 600 }}
            >
              /presentes
            </a>
            {' '}com os convidados para que eles possam ver e marcar os presentes.
          </p>
        </div>
      )}
    </div>
  );
}
