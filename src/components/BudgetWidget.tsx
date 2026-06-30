import { DollarSign, TrendingUp, Wallet, AlertCircle } from 'lucide-react';
import type { BudgetSummary } from '../types/wedding';

interface BudgetWidgetProps {
  summary: BudgetSummary;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface MiniStatProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}

function MiniStat({ label, value, icon, iconBg, iconColor, valueColor }: MiniStatProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '14px',
        background: 'var(--color-surface-2)',
        borderRadius: '12px',
        flex: 1,
        minWidth: '0',
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '7px',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', margin: 0, fontWeight: 500 }}>
        {label}
      </p>
      <p
        style={{
          fontSize: '0.9rem',
          fontWeight: 700,
          color: valueColor ?? 'var(--color-text-primary)',
          margin: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </p>
    </div>
  );
}

export function BudgetWidget({ summary }: BudgetWidgetProps) {
  const committedPercent = Math.min(summary.percentageCommitted, 100);
  const paidPercent = Math.min(summary.percentagePaid, 100);
  const isOverBudget = summary.totalCommitted > summary.totalBudget;

  return (
    <article
      className="card animate-fade-in-up delay-300"
      style={{ padding: '1.5rem', height: '100%' }}
      aria-label="Termômetro financeiro do casamento"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--color-brand-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DollarSign size={18} color="var(--color-brand)" />
        </div>
        <div>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
            Termômetro Financeiro
          </h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Orçamento total: {formatCurrency(summary.totalBudget)}
          </p>
        </div>
        {isOverBudget && (
          <div style={{ marginLeft: 'auto' }}>
            <AlertCircle size={16} color="var(--color-danger)" />
          </div>
        )}
      </div>

      {/* Progress bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>

        {/* Committed */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Comprometido
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: isOverBudget ? 'var(--color-danger)' : 'var(--color-text-primary)',
                }}
              >
                {committedPercent}%
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                {formatCurrency(summary.totalCommitted)}
              </span>
            </div>
          </div>
          <div className="progress-track" role="progressbar" aria-valuenow={committedPercent} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="progress-fill"
              style={{ width: `${committedPercent}%` }}
            />
          </div>
        </div>

        {/* Paid */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Pago
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-success)' }}>
                {paidPercent}%
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                {formatCurrency(summary.totalPaid)}
              </span>
            </div>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={paidPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              style={{
                height: '100%',
                borderRadius: '999px',
                background: 'linear-gradient(90deg, #3d6b4e, var(--color-success))',
                width: `${paidPercent}%`,
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <MiniStat
          label="Restante"
          value={formatCurrency(summary.remaining)}
          icon={<Wallet size={14} />}
          iconBg="var(--color-brand-bg)"
          iconColor="var(--color-brand)"
        />
        <MiniStat
          label="A pagar"
          value={formatCurrency(summary.totalCommitted - summary.totalPaid)}
          icon={<TrendingUp size={14} />}
          iconBg="#fffbeb"
          iconColor="var(--color-warning)"
          valueColor="var(--color-warning)"
        />
      </div>
    </article>
  );
}
