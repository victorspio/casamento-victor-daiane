import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { HeroBanner } from './HeroBanner';
import { GuestWidget } from './GuestWidget';
import { TasksWidget } from './TasksWidget';
import { BudgetWidget } from './BudgetWidget';
import { calculateCountdown } from '../data/mockData';
import type { CountdownData } from '../types/wedding';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const { config, guests, tasks, budgetItems } = useWedding();
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState<CountdownData>(
    calculateCountdown(config.weddingDate)
  );

  useEffect(() => {
    const timer = setInterval(() => setCountdown(calculateCountdown(config.weddingDate)), 1000);
    return () => clearInterval(timer);
  }, [config.weddingDate]);

  // Derived Guest summary
  const guestSummary = {
    total: guests.length,
    confirmed: guests.filter((g) => g.status === 'confirmed').length,
    pending: guests.filter((g) => g.status === 'pending').length,
    declined: guests.filter((g) => g.status === 'declined').length,
  };

  // Top 3 tasks for dashboard (actions prioritarias) ordered by priority weight
  const topTasks = [...tasks]
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
      const weights = { urgent: 4, high: 3, medium: 2, low: 1 };
      return weights[b.priority] - weights[a.priority];
    })
    .slice(0, 3);

  // Derived Budget summary
  const totalEstimated = budgetItems.reduce((acc, i) => acc + i.estimatedValue, 0);
  const totalPaid = budgetItems.reduce((acc, i) => acc + i.paidValue, 0);
  const targetBudget = config.targetBudget ?? 0;
  const budgetSummary = {
    totalBudget: targetBudget,
    totalCommitted: totalEstimated,
    totalPaid: totalPaid,
    remaining: targetBudget - totalEstimated,
    percentageCommitted: targetBudget > 0 ? Math.round((totalEstimated / targetBudget) * 100) : 0,
    percentagePaid: targetBudget > 0 ? Math.round((totalPaid / targetBudget) * 100) : 0,
  };

  return (
    <div>
      {/* Page heading */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{
          fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: '0 0 4px 0',
        }}>
          Visão Geral
        </p>
        <h1 className="font-display" style={{
          fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700,
          color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.2,
        }}>
          Dashboard do Casamento
        </h1>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }} className="dashboard-grid">
        {/* Hero Banner — full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <HeroBanner
            groom={config.groom}
            bride={config.bride}
            venue={config.venue}
            city={config.city}
            weddingDate={config.weddingDate}
            countdown={countdown}
          />
        </div>

        {/* Quick-info row */}
        {(config.weddingDate || config.venue) && (
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {config.weddingDate && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 14px', background: 'var(--color-brand-bg)',
                borderRadius: '999px', border: '1px solid rgba(176,141,110,0.2)',
              }}>
                <CalendarDays size={14} color="var(--color-brand)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-brand)', fontWeight: 500 }}>
                  {new Date(config.weddingDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
            {config.venue && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 14px', background: 'var(--color-surface-2)',
                borderRadius: '999px', border: '1px solid var(--color-border)',
              }}>
                <MapPin size={14} color="var(--color-text-secondary)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  {config.venue}{config.city ? ` · ${config.city}` : ''}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Widgets grid */}
        <div onClick={() => navigate('/convidados')} style={{ cursor: 'pointer' }}>
          <GuestWidget summary={guestSummary} />
        </div>
        <div onClick={() => navigate('/tarefas')} style={{ cursor: 'pointer' }}>
          <TasksWidget tasks={topTasks} />
        </div>
        <div onClick={() => navigate('/financeiro')} style={{ cursor: 'pointer' }}>
          <BudgetWidget summary={budgetSummary} />
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .dashboard-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .dashboard-grid > div:first-child { grid-column: 1 / -1 !important; }
          .dashboard-grid > div:nth-child(2) { grid-column: 1 / -1 !important; }
        }
        @media (min-width: 1024px) {
          .dashboard-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .dashboard-grid > div:first-child { grid-column: 1 / -1 !important; }
          .dashboard-grid > div:nth-child(2) { grid-column: 1 / -1 !important; }
        }
      `}</style>
    </div>
  );
}
