import { CheckSquare, AlertTriangle, Loader, ChevronRight, Calendar } from 'lucide-react';
import type { WeddingTask, TaskPriority, TaskStatus } from '../types/wedding';

interface TasksWidgetProps {
  tasks: WeddingTask[];
}

const priorityConfig: Record<TaskPriority, { label: string; badgeClass: string; icon: React.ReactNode }> = {
  urgent: {
    label: 'Urgente',
    badgeClass: 'badge badge-urgent',
    icon: <AlertTriangle size={10} />,
  },
  high: {
    label: 'Alta',
    badgeClass: 'badge badge-pending',
    icon: <AlertTriangle size={10} />,
  },
  medium: {
    label: 'Média',
    badgeClass: 'badge badge-done',
    icon: null,
  },
  low: {
    label: 'Baixa',
    badgeClass: 'badge',
    icon: null,
  },
};

const statusConfig: Record<TaskStatus, { icon: React.ReactNode; color: string }> = {
  todo: { icon: <CheckSquare size={18} />, color: 'var(--color-text-muted)' },
  in_progress: { icon: <Loader size={18} />, color: 'var(--color-brand)' },
  done: { icon: <CheckSquare size={18} />, color: 'var(--color-success)' },
};

function formatDueDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

interface TaskItemProps {
  task: WeddingTask;
  isLast: boolean;
}

function TaskItem({ task, isLast }: TaskItemProps) {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 0',
        borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
        cursor: 'pointer',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      role="listitem"
      aria-label={`Tarefa: ${task.title}`}
    >
      {/* Status icon */}
      <div style={{ color: status.color, marginTop: '2px', flexShrink: 0 }}>
        {status.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: '0 0 4px 0',
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={task.title}
        >
          {task.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className={priority.badgeClass}>
            {priority.icon}
            {priority.label}
          </span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '0.68rem',
              color: 'var(--color-text-muted)',
            }}
          >
            <Calendar size={10} />
            {formatDueDate(task.dueDate)}
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              color: 'var(--color-text-muted)',
              background: 'var(--color-surface-2)',
              padding: '1px 7px',
              borderRadius: '999px',
            }}
          >
            {task.category}
          </span>
        </div>
      </div>

      <ChevronRight size={14} color="var(--color-text-muted)" style={{ marginTop: '3px', flexShrink: 0 }} />
    </div>
  );
}

export function TasksWidget({ tasks }: TasksWidgetProps) {
  return (
    <article
      className="card animate-fade-in-up delay-200"
      style={{ padding: '1.5rem', height: '100%' }}
      aria-label="Ações prioritárias da semana"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={18} color="var(--color-danger)" />
          </div>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
              Ações Prioritárias
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Top {tasks.length} tarefas desta semana
            </p>
          </div>
        </div>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--color-brand)',
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          Ver todas →
        </span>
      </div>

      {/* Task list */}
      <div role="list">
        {tasks.map((task, idx) => (
          <TaskItem key={task.id} task={task} isLast={idx === tasks.length - 1} />
        ))}
      </div>
    </article>
  );
}
