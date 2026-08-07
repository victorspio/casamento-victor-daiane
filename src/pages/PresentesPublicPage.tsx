import { useState, useEffect } from 'react';
import { Heart, Gift, ExternalLink, CheckCircle2, ShoppingBag, Sparkles } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, collection, onSnapshot, updateDoc } from 'firebase/firestore';
import type { GiftItem, WeddingConfig } from '../types/wedding';

export function PresentesPublicPage() {
  const [config, setConfig] = useState<WeddingConfig | null>(null);
  const [giftItems, setGiftItems] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('todas');

  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, 'wedding', 'config'), (snap) => {
      if (snap.exists()) setConfig(snap.data() as WeddingConfig);
    });

    const unsubGifts = onSnapshot(
      collection(db, 'wedding', 'config', 'giftItems'),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as GiftItem));
        setGiftItems(items.sort((a, b) => a.sortOrder - b.sortOrder));
        setLoading(false);
      }
    );

    return () => { unsubConfig(); unsubGifts(); };
  }, []);

  const handleToggle = async (item: GiftItem) => {
    if (togglingId) return;
    setTogglingId(item.id);
    try {
      await updateDoc(doc(db, 'wedding', 'config', 'giftItems', item.id), {
        isPurchased: !item.isPurchased,
        purchasedAt: !item.isPurchased ? new Date().toISOString() : null,
      });
    } finally {
      setTogglingId(null);
    }
  };

  const categories = ['todas', ...Array.from(new Set(giftItems.map(g => g.category).filter(Boolean))) as string[]];
  const filtered = filterCategory === 'todas'
    ? giftItems
    : giftItems.filter(g => g.category === filterCategory);

  const purchased = giftItems.filter(g => g.isPurchased).length;
  const total = giftItems.length;
  const percentage = total > 0 ? Math.round((purchased / total) * 100) : 0;

  const coupleLabel = config
    ? `${config.groom} & ${config.bride}`
    : 'Lista de Presentes';

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        <div style={{ textAlign: 'center', opacity: 0.6 }}>
          <Heart size={32} color="var(--color-brand)" fill="var(--color-brand)" style={{ animation: 'pulse-soft 1.5s infinite' }} />
          <p style={{ marginTop: '1rem', fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
            Carregando lista…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: 'var(--font-body)' }}>
      {/* ── Hero Header ─────────────────────────────────────────── */}
      <header style={{
        background: `linear-gradient(135deg, #2d1b12 0%, #5c3320 40%, #8a6d52 100%)`,
        padding: '3.5rem 1.5rem 4rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: `radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px),
            radial-gradient(circle at 80% 50%, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <Gift size={26} color="#f5e6d3" />
            </div>
          </div>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8rem', letterSpacing: '0.25em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)', margin: '0 0 0.5rem',
          }}>
            Lista de Presentes
          </p>

          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700, color: '#fff',
            margin: '0 0 0.75rem',
            textShadow: '0 2px 24px rgba(0,0,0,0.3)',
            letterSpacing: '-0.02em',
          }}>
            {coupleLabel}
          </h1>

          {config?.weddingDate && (
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: '0 0 2rem' }}>
              {new Date(config.weddingDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}

          {total > 0 && (
            <div style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1.25rem 2rem',
              border: '1px solid rgba(255,255,255,0.15)',
              minWidth: '280px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>
                  {purchased} de {total} comprados
                </span>
                <span style={{ color: '#f5c97a', fontWeight: 700, fontSize: '0.85rem' }}>
                  {percentage}%
                </span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '999px',
                  width: `${percentage}%`,
                  background: 'linear-gradient(90deg, #f5c97a, #e8a845)',
                  transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', margin: '0.5rem 0 0', textAlign: 'center' }}>
                {total - purchased} {total - purchased === 1 ? 'item ainda precisa' : 'itens ainda precisam'} de um presentinho 🎁
              </p>
            </div>
          )}
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────── */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>

        <div style={{
          background: 'linear-gradient(135deg, var(--color-brand-bg), #fff)',
          border: '1px solid var(--color-border)',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
        }}>
          <Sparkles size={20} color="var(--color-brand)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Clique no <strong>nome do presente</strong> para ir à loja e, após comprar,
              marque o item como <strong>comprado</strong> para que outros convidados saibam. 💝
            </p>
          </div>
        </div>

        {categories.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                style={{
                  padding: '5px 16px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  border: '1px solid',
                  borderColor: filterCategory === cat ? 'var(--color-brand)' : 'var(--color-border)',
                  background: filterCategory === cat ? 'var(--color-brand)' : 'var(--color-surface)',
                  color: filterCategory === cat ? '#fff' : 'var(--color-text-secondary)',
                }}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
            <ShoppingBag size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.9rem' }}>Nenhum presente nesta categoria.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((item, i) => (
              <GiftCard
                key={item.id}
                item={item}
                index={i}
                isToggling={togglingId === item.id}
                onToggle={() => handleToggle(item)}
              />
            ))}
          </div>
        )}
      </main>

      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '1.5rem',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}>
          Feito com{' '}
          <Heart size={11} color="var(--color-brand)" fill="var(--color-brand)" />
          {' '}para{' '}
          <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{coupleLabel}</span>
        </p>
      </footer>
    </div>
  );
}

// ── Gift Card Component ─────────────────────────────────────────────────────

interface GiftCardProps {
  item: GiftItem;
  index: number;
  isToggling: boolean;
  onToggle: () => void;
}

function GiftCard({ item, index, isToggling, onToggle }: GiftCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="animate-fade-in-up"
      style={{
        animationDelay: `${Math.min(index * 0.05, 0.4)}s`,
        background: item.isPurchased
          ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
          : 'var(--color-surface)',
        border: `1px solid ${item.isPurchased ? '#86efac' : 'var(--color-border)'}`,
        borderRadius: '14px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'all 0.25s ease',
        opacity: item.isPurchased ? 0.85 : 1,
        boxShadow: hovered && !item.isPurchased
          ? '0 4px 20px rgba(176,141,110,0.12)'
          : '0 1px 4px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        disabled={isToggling}
        aria-label={item.isPurchased ? 'Desmarcar como comprado' : 'Marcar como comprado'}
        style={{
          flexShrink: 0,
          width: '28px', height: '28px',
          borderRadius: '8px',
          border: `2px solid ${item.isPurchased ? '#22c55e' : 'var(--color-border)'}`,
          background: item.isPurchased ? '#22c55e' : 'transparent',
          cursor: isToggling ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
          opacity: isToggling ? 0.5 : 1,
        }}
      >
        {item.isPurchased && <CheckCircle2 size={16} color="#fff" fill="#fff" />}
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
                fontSize: '0.95rem',
                fontWeight: 600,
                color: item.isPurchased ? 'var(--color-text-muted)' : 'var(--color-brand-dark)',
                textDecoration: item.isPurchased ? 'line-through' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
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
              <ExternalLink size={13} style={{ opacity: 0.6 }} />
            </a>
          ) : (
            <span style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: item.isPurchased ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              textDecoration: item.isPurchased ? 'line-through' : 'none',
            }}>
              {item.name}
            </span>
          )}

          {item.category && (
            <span style={{
              fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '2px 8px', borderRadius: '999px',
              background: 'var(--color-surface-2)', color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
            }}>
              {item.category}
            </span>
          )}
        </div>

        {item.isPurchased && (
          <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#16a34a' }}>
            ✓ Já foi comprado!
          </p>
        )}
      </div>

      {/* CTA comprar */}
      {!item.isPurchased && item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flexShrink: 0,
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '0.75rem', fontWeight: 600,
            background: 'var(--color-brand-bg)',
            color: 'var(--color-brand-dark)',
            border: '1px solid var(--color-border)',
            textDecoration: 'none',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: '4px',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--color-brand)';
            (e.currentTarget as HTMLElement).style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--color-brand-bg)';
            (e.currentTarget as HTMLElement).style.color = 'var(--color-brand-dark)';
          }}
        >
          <ShoppingBag size={12} />
          Ver produto
        </a>
      )}
    </div>
  );
}
