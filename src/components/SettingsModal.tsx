import { useState } from 'react';
import { X, Save, Trash2, AlertTriangle } from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import type { WeddingConfig } from '../types/wedding';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { config, updateConfig, resetAll, bulkCreateInvites, addTask, addBudgetItem, addVendor } = useWedding();
  const [form, setForm] = useState<WeddingConfig>({ ...config });
  const [confirmReset, setConfirmReset] = useState(false);

  const [hasLocalData, setHasLocalData] = useState(() => {
    return !!(
      localStorage.getItem('wedding:config') ||
      localStorage.getItem('wedding:guests') ||
      localStorage.getItem('wedding:tasks') ||
      localStorage.getItem('wedding:budgetItems') ||
      localStorage.getItem('wedding:vendors')
    );
  });

  function handleSave() {
    updateConfig(form);
    onClose();
  }

  function handleReset() {
    if (confirmReset) {
      resetAll();
      onClose();
    } else {
      setConfirmReset(true);
    }
  }

  async function handleMigration() {
    try {
      // 1. Config
      const rawConfig = localStorage.getItem('wedding:config');
      if (rawConfig) {
        const parsed = JSON.parse(rawConfig);
        await updateConfig(parsed);
      }

      // 2. Guests
      const rawGuests = localStorage.getItem('wedding:guests');
      if (rawGuests) {
        const parsed = JSON.parse(rawGuests);
        const items = parsed.map((g: any) => {
          const { id, inviteId, ...data } = g;
          return {
            invite: {
              group: data.group || 'Convidados',
              tableNumber: data.tableNumber,
            },
            guest: data,
          };
        });
        await bulkCreateInvites(items);
      }

      // 3. Tasks
      const rawTasks = localStorage.getItem('wedding:tasks');
      if (rawTasks) {
        const parsed = JSON.parse(rawTasks);
        for (const t of parsed) {
          const { id, ...data } = t;
          await addTask(data);
        }
      }

      // 4. Budget Items
      const rawBudget = localStorage.getItem('wedding:budgetItems');
      if (rawBudget) {
        const parsed = JSON.parse(rawBudget);
        for (const b of parsed) {
          const { id, ...data } = b;
          await addBudgetItem(data);
        }
      }

      // 5. Vendors
      const rawVendors = localStorage.getItem('wedding:vendors');
      if (rawVendors) {
        const parsed = JSON.parse(rawVendors);
        for (const v of parsed) {
          const { id, ...data } = v;
          await addVendor(data);
        }
      }

      // Clean local storage
      localStorage.removeItem('wedding:config');
      localStorage.removeItem('wedding:guests');
      localStorage.removeItem('wedding:tasks');
      localStorage.removeItem('wedding:budgetItems');
      localStorage.removeItem('wedding:vendors');

      setHasLocalData(false);
      alert("Migração concluída com sucesso! Seus dados foram importados para o Firebase Firestore em tempo real.");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Erro ao importar dados locais. Verifique o console.");
    }
  }

  // date value for input type="date" (needs YYYY-MM-DD)
  const dateValue = form.weddingDate ? form.weddingDate.slice(0, 10) : '';
  const timeValue = form.weddingDate && form.weddingDate.length > 10
    ? form.weddingDate.slice(11, 16)
    : '16:00';

  function handleDateChange(date: string, time: string) {
    setForm((f) => ({ ...f, weddingDate: date ? `${date}T${time}:00` : '' }));
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)', zIndex: 100,
          animation: 'fadeInUp 0.2s ease both',
        }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Configurações do casamento"
        style={{
          position: 'fixed',
          inset: 0,
          margin: 'auto',
          zIndex: 101,
          width: '90%',
          maxWidth: '480px',
          height: 'fit-content',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--color-surface)',
          borderRadius: '20px',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          padding: '2rem',
          animation: 'fadeInUp 0.25s ease both',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Configurações
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Informações básicas do casamento
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
              borderRadius: '8px', cursor: 'pointer', padding: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Fechar"
          >
            <X size={16} color="var(--color-text-secondary)" />
          </button>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Field label="Nome do Noivo" id="cfg-groom">
              <input
                id="cfg-groom"
                value={form.groom}
                onChange={(e) => setForm((f) => ({ ...f, groom: e.target.value }))}
                placeholder="Ex: Victor"
              />
            </Field>
            <Field label="Nome da Noiva" id="cfg-bride">
              <input
                id="cfg-bride"
                value={form.bride}
                onChange={(e) => setForm((f) => ({ ...f, bride: e.target.value }))}
                placeholder="Ex: Daiane"
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
            <Field label="Data do Casamento" id="cfg-date">
              <input
                id="cfg-date"
                type="date"
                value={dateValue}
                onChange={(e) => handleDateChange(e.target.value, timeValue)}
              />
            </Field>
            <Field label="Horário" id="cfg-time">
              <input
                id="cfg-time"
                type="time"
                value={timeValue}
                onChange={(e) => handleDateChange(dateValue, e.target.value)}
                style={{ width: '100px' }}
              />
            </Field>
          </div>

          <Field label="Local / Espaço" id="cfg-venue">
            <input
              id="cfg-venue"
              value={form.venue}
              onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
              placeholder="Ex: Espaço Villa Jardins"
            />
          </Field>

          <Field label="Cidade" id="cfg-city">
            <input
              id="cfg-city"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="Ex: Fortaleza, CE"
            />
          </Field>
        </div>

        {/* Migration option */}
        {hasLocalData && (
          <div style={{
            background: 'var(--color-brand-bg)',
            border: '1px dashed var(--color-brand)',
            borderRadius: '12px',
            padding: '12px',
            marginTop: '1.25rem',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Encontramos dados salvos localmente. Quer migrá-los para o Firebase Firestore?
            </p>
            <button
              onClick={handleMigration}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--color-brand)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                padding: '8px 14px',
                fontSize: '0.78rem',
                fontWeight: 600,
                width: '100%',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}
            >
              ☁️ Importar dados para nuvem
            </button>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.75rem' }}>
          <button
            id="btn-reset-all"
            onClick={handleReset}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: confirmReset ? '#fef2f2' : 'transparent',
              border: `1px solid ${confirmReset ? '#fecaca' : 'var(--color-border)'}`,
              color: confirmReset ? 'var(--color-danger)' : 'var(--color-text-muted)',
              borderRadius: '10px', cursor: 'pointer', padding: '8px 14px',
              fontSize: '0.78rem', fontWeight: 500, transition: 'all 0.15s',
            }}
          >
            {confirmReset ? <AlertTriangle size={14} /> : <Trash2 size={14} />}
            {confirmReset ? 'Confirmar reset' : 'Resetar tudo'}
          </button>

          <button
            id="btn-save-config"
            onClick={handleSave}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--color-brand)', color: '#fff',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              padding: '9px 20px', fontSize: '0.85rem', fontWeight: 600,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-brand-dark)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-brand)')}
          >
            <Save size={15} />
            Salvar
          </button>
        </div>
      </div>

      <style>{`
        .settings-input {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          font-size: 0.85rem;
          font-family: var(--font-body);
          color: var(--color-text-primary);
          background: var(--color-surface-2);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .settings-input:focus {
          border-color: var(--color-brand);
          box-shadow: 0 0 0 3px rgba(176, 141, 110, 0.15);
        }
      `}</style>
    </>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label htmlFor={id} style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <div className="settings-field">
        {children}
      </div>
      <style>{`
        .settings-field input {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          font-size: 0.85rem;
          font-family: var(--font-body);
          color: var(--color-text-primary);
          background: var(--color-surface-2);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .settings-field input:focus {
          border-color: var(--color-brand);
          box-shadow: 0 0 0 3px rgba(176, 141, 110, 0.15);
        }
      `}</style>
    </div>
  );
}
