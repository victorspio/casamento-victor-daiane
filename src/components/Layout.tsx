import { NavLink, useNavigate } from 'react-router-dom';
import { Heart, Settings, Users, CheckSquare, DollarSign, Truck, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useWedding } from '../context/WeddingContext';
import { SettingsModal } from './SettingsModal';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { to: '/',             label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/convidados',   label: 'Convidados',   icon: Users },
  { to: '/tarefas',      label: 'Tarefas',      icon: CheckSquare },
  { to: '/financeiro',   label: 'Financeiro',   icon: DollarSign },
  { to: '/fornecedores', label: 'Fornecedores', icon: Truck },
];

export function Layout({ children }: LayoutProps) {
  const { config } = useWedding();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const coupleLabel = config.groom && config.bride
    ? `${config.groom} & ${config.bride}`
    : 'Meu Casamento';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: 'var(--font-body)' }}>
      {/* ── Topbar ─────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem', height: '56px',
        background: 'rgba(250, 249, 247, 0.92)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
          aria-label="Ir para o Dashboard"
        >
          <Heart size={18} color="var(--color-brand)" fill="var(--color-brand)" />
          <span className="font-display" style={{
            fontSize: '1rem', fontWeight: 700,
            color: 'var(--color-text-primary)', letterSpacing: '-0.02em',
          }}>
            {coupleLabel}
          </span>
        </button>

        {/* Nav */}
        <nav
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          aria-label="Navegação principal"
        >
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 10px', borderRadius: '8px',
                fontSize: '0.78rem', fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                background: isActive ? 'var(--color-brand-bg)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              })}
            >
              <Icon size={14} />
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Settings button */}
        <button
          id="btn-settings"
          onClick={() => setSettingsOpen(true)}
          title="Configurações do casamento"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-brand-bg)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-surface-2)')}
          aria-label="Abrir configurações"
        >
          <Settings size={16} color="var(--color-text-secondary)" />
        </button>
      </header>

      {/* ── Page content ─────────────────────────────────────────── */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        {children}
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '1.25rem 1.5rem', textAlign: 'center' }}>
        <p style={{
          fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}>
          Feito com{' '}
          <Heart size={11} color="var(--color-brand)" fill="var(--color-brand)" />
          {' '}para{' '}
          <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            {coupleLabel}
          </span>
          {config.city ? ` · ${config.city}` : ''}
        </p>
      </footer>

      {/* ── Settings Modal ──────────────────────────────────────── */}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}

      {/* ── Responsive nav labels ──────────────────────────────── */}
      <style>{`
        @media (max-width: 640px) {
          .nav-label { display: none; }
        }
      `}</style>
    </div>
  );
}
