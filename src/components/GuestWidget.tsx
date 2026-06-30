import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { GuestSummary } from '../types/wedding';

interface GuestWidgetProps {
  summary: GuestSummary;
}

const CHART_COLORS = {
  confirmed: '#5a8a6a',
  pending: '#c9914a',
  declined: '#b85c5c',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '8px 14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {item.name}
        </p>
        <p style={{ fontSize: '0.85rem', color: item.payload.fill, fontWeight: 700 }}>
          {item.value} convidados
        </p>
      </div>
    );
  }
  return null;
}

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
}

function StatRow({ icon, label, value, color, bg }: StatRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{label}</span>
      </div>
      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
        {value}
      </span>
    </div>
  );
}

export function GuestWidget({ summary }: GuestWidgetProps) {
  const chartData = [
    { name: 'Confirmados', value: summary.confirmed, fill: CHART_COLORS.confirmed },
    { name: 'Pendentes', value: summary.pending, fill: CHART_COLORS.pending },
    { name: 'Recusados', value: summary.declined, fill: CHART_COLORS.declined },
  ];

  const confirmRate = summary.total > 0 ? Math.round((summary.confirmed / summary.total) * 100) : 0;

  return (
    <article
      className="card animate-fade-in-up delay-100"
      style={{ padding: '1.5rem', height: '100%' }}
      aria-label="Resumo de convidados"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
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
          <Users size={18} color="var(--color-brand)" />
        </div>
        <div>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
            Convidados
          </h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>
            {confirmRate}% confirmados
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {summary.total}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: '4px' }}>total</span>
        </div>
      </div>

      {/* Donut chart */}
      <div style={{ height: '160px', marginBottom: '1rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={68}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {/* Center label */}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div>
        <StatRow
          icon={<CheckCircle size={16} />}
          label="Confirmados"
          value={summary.confirmed}
          color={CHART_COLORS.confirmed}
          bg="#f0fdf4"
        />
        <StatRow
          icon={<Clock size={16} />}
          label="Pendentes"
          value={summary.pending}
          color={CHART_COLORS.pending}
          bg="#fffbeb"
        />
        <div style={{ borderBottom: 'none' }}>
          <StatRow
            icon={<XCircle size={16} />}
            label="Recusados"
            value={summary.declined}
            color={CHART_COLORS.declined}
            bg="#fef2f2"
          />
        </div>
      </div>
    </article>
  );
}
