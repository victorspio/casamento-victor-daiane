import { useState } from 'react';
import { CheckSquare, Plus, Pencil, Trash2, X, Save, Check } from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import type { WeddingTask, TaskPriority, TaskStatus } from '../types/wedding';
import { PageHeader, EmptyState, FormField, primaryBtnStyle, secondaryBtnStyle, iconBtnStyle } from './ConvidadosPage';

// ─── Modal ────────────────────────────────────────────────────────────────────
interface TaskModalProps {
  initial?: WeddingTask;
  onSave: (data: Omit<WeddingTask, 'id'>) => void;
  onClose: () => void;
}

function TaskModal({ initial, onSave, onClose }: TaskModalProps) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    priority: initial?.priority ?? 'medium' as TaskPriority,
    status: initial?.status ?? 'todo' as TaskStatus,
    dueDate: initial?.dueDate ? initial.dueDate.slice(0, 10) : '',
    category: initial?.category ?? '',
    assignee: initial?.assignee ?? '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, dueDate: form.dueDate ? `${form.dueDate}T12:00:00` : '' });
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
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {initial ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button onClick={onClose} style={iconBtnStyle} aria-label="Fechar"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <FormField label="Título *" id="t-title">
            <input id="t-title" required value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Confirmar menu com buffet" />
          </FormField>

          <FormField label="Descrição" id="t-desc">
            <textarea id="t-desc" rows={2} value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Detalhes da tarefa..." style={{ resize: 'vertical' }} />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <FormField label="Status" id="t-status">
              <select id="t-status" value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}>
                <option value="todo">A fazer</option>
                <option value="in_progress">Em andamento</option>
                <option value="done">Concluído</option>
              </select>
            </FormField>
            <FormField label="Prazo" id="t-due">
              <input id="t-due" type="date" value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <FormField label="Responsável" id="t-assignee">
              <input id="t-assignee" value={form.assignee}
                onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}
                placeholder="Ex: Noiva" />
            </FormField>
            <FormField label="Categoria" id="t-category">
              <input id="t-category" value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Ex: Catering, Música, Vestimenta..." />
            </FormField>
          </div>

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
const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  urgent: { label: 'Urgente',    color: 'var(--color-danger)',  bg: '#fef2f2' },
  high:   { label: 'Alta',       color: 'var(--color-warning)', bg: '#fffbeb' },
  medium: { label: 'Média',      color: '#7c6aaf',              bg: '#f5f3ff' },
  low:    { label: 'Baixa',      color: 'var(--color-success)', bg: '#f0fdf4' },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  todo:        { label: 'A fazer',      color: 'var(--color-text-muted)' },
  in_progress: { label: 'Em andamento', color: 'var(--color-warning)' },
  done:        { label: 'Concluído',    color: 'var(--color-success)' },
};

export function TarefasPage() {
  const { tasks, addTask, updateTask, deleteTask } = useWedding();
  const [modal, setModal] = useState<{ open: boolean; editing?: WeddingTask }>({ open: false });
  const [filterStatus, setFilterStatus] = useState<'all' | TaskStatus>('all');

  const done = tasks.filter((t) => t.status === 'done').length;
  const pending = tasks.filter((t) => t.status !== 'done').length;

  const filtered = filterStatus === 'all' ? tasks : tasks.filter((t) => t.status === filterStatus);

  function handleSave(data: Omit<WeddingTask, 'id'>) {
    if (modal.editing) {
      updateTask(modal.editing.id, data);
    } else {
      addTask(data);
    }
    setModal({ open: false });
  }

  function toggleDone(task: WeddingTask) {
    updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' });
  }

  return (
    <div>
      <PageHeader
        icon={<CheckSquare size={22} color="var(--color-brand)" />}
        title="Tarefas"
        sub={`${tasks.length} tarefas · ${done} concluídas · ${pending} pendentes`}
        action={
          <button id="btn-add-task" onClick={() => setModal({ open: true })} style={primaryBtnStyle}>
            <Plus size={16} /> Tarefa
          </button>
        }
      />

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {(['all', 'todo', 'in_progress', 'done'] as const).map((s) => {
          const labels = { all: 'Todas', todo: 'A fazer', in_progress: 'Em andamento', done: 'Concluídas' };
          const count = s === 'all' ? tasks.length : tasks.filter((t) => t.status === s).length;
          return (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: '5px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
              border: `1px solid ${filterStatus === s ? 'var(--color-brand)' : 'var(--color-border)'}`,
              background: filterStatus === s ? 'var(--color-brand-bg)' : 'transparent',
              color: filterStatus === s ? 'var(--color-brand)' : 'var(--color-text-secondary)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {labels[s]} ({count})
            </button>
          );
        })}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={40} color="var(--color-border)" />}
          message={tasks.length === 0 ? 'Nenhuma tarefa criada ainda.' : 'Nenhuma tarefa com esse filtro.'}
          action={tasks.length === 0 ? (
            <button onClick={() => setModal({ open: true })} style={primaryBtnStyle}><Plus size={14} /> Criar primeira tarefa</button>
          ) : undefined}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((task) => {
            const p = PRIORITY_CONFIG[task.priority];
            const s = STATUS_CONFIG[task.status];
            return (
              <div key={task.id} className="card" style={{
                padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem',
                opacity: task.status === 'done' ? 0.6 : 1, transition: 'opacity 0.2s',
              }}>
                {/* Done toggle */}
                <button onClick={() => toggleDone(task)} style={{
                  flexShrink: 0, marginTop: '2px',
                  width: '22px', height: '22px', borderRadius: '6px',
                  border: `2px solid ${task.status === 'done' ? 'var(--color-success)' : 'var(--color-border)'}`,
                  background: task.status === 'done' ? 'var(--color-success)' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} aria-label="Marcar como concluída">
                  {task.status === 'done' && <Check size={13} color="#fff" strokeWidth={3} />}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-text-primary)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
                      {task.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, color: p.color, background: p.bg }}>{p.label}</span>
                      <span style={{ fontSize: '0.72rem', color: s.color, fontWeight: 500 }}>{s.label}</span>
                    </div>
                  </div>

                  {task.description && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{task.description}</p>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {task.category && <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>📁 {task.category}</span>}
                    {task.assignee && <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>👤 {task.assignee}</span>}
                    {task.dueDate && <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>📅 {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => setModal({ open: true, editing: task })} style={iconBtnStyle} title="Editar"><Pencil size={14} /></button>
                  <button onClick={() => deleteTask(task.id)} style={{ ...iconBtnStyle, color: 'var(--color-danger)' }} title="Excluir"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal.open && (
        <TaskModal
          initial={modal.editing}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
