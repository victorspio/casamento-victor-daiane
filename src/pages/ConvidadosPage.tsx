import { useState } from 'react';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  CheckCircle,
  Clock,
  XCircle,
  Link2,
  Check,
  Upload,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Scissors
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import type { Guest, Invite, InviteWithGuests, RsvpStatus } from '../types/wedding';

// ─── Modal para Criar/Editar Convite ou Convidado ───────────────────────────
interface GuestOrInviteModalProps {
  mode: 'create' | 'edit_invite' | 'edit_guest' | 'add_guest_to_invite';
  inviteId?: string;
  initialInvite?: Invite;
  initialGuest?: Guest;
  onClose: () => void;
}

function GuestOrInviteModal({ mode, inviteId, initialInvite, initialGuest, onClose }: GuestOrInviteModalProps) {
  const { createInvite, updateInvite, updateGuest, addPersonToInvite } = useWedding();

  const [inviteForm, setInviteForm] = useState({
    displayName: initialInvite?.displayName ?? '',
    group: initialInvite?.group ?? 'Convidados do Noivo',
    tableNumber: initialInvite?.tableNumber ?? '' as number | '',
  });

  const [guestForm, setGuestForm] = useState({
    name: initialGuest?.name ?? '',
    status: (initialGuest?.status ?? 'pending') as RsvpStatus,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formattedTable = inviteForm.tableNumber === '' ? undefined : Number(inviteForm.tableNumber);

    if (mode === 'create') {
      if (!guestForm.name.trim()) return;
      createInvite(
        {
          displayName: inviteForm.displayName.trim() || undefined,
          group: inviteForm.group,
          tableNumber: formattedTable,
        },
        {
          name: guestForm.name.trim(),
          group: inviteForm.group,
          status: guestForm.status,
          plusOne: false,
          tableNumber: formattedTable,
        }
      );
    } else if (mode === 'edit_invite' && initialInvite) {
      updateInvite(initialInvite.id, {
        displayName: inviteForm.displayName.trim() || undefined,
        group: inviteForm.group,
        tableNumber: formattedTable,
      });
    } else if (mode === 'edit_guest' && initialGuest) {
      if (!guestForm.name.trim()) return;
      updateGuest(initialGuest.id, {
        name: guestForm.name.trim(),
        status: guestForm.status,
      });
    } else if (mode === 'add_guest_to_invite' && inviteId) {
      if (!guestForm.name.trim()) return;
      addPersonToInvite(inviteId, {
        name: guestForm.name.trim(),
        group: initialInvite?.group ?? 'Outros',
        status: guestForm.status,
        plusOne: false,
        tableNumber: initialInvite?.tableNumber,
      });
    }

    onClose();
  }

  const showInviteFields = mode === 'create' || mode === 'edit_invite';
  const showGuestFields = mode === 'create' || mode === 'edit_guest' || mode === 'add_guest_to_invite';

  let title = 'Novo Convite';
  if (mode === 'edit_invite') title = 'Editar Convite';
  if (mode === 'edit_guest') title = 'Editar Convidado';
  if (mode === 'add_guest_to_invite') title = 'Adicionar Pessoa ao Convite';

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 100 }} aria-hidden="true" />
      <div role="dialog" aria-modal="true" style={{
        position: 'fixed', inset: 0, margin: 'auto',
        zIndex: 101, width: '100%', maxWidth: '440px', height: 'fit-content',
        background: 'var(--color-surface)', borderRadius: '20px',
        border: '1px solid var(--color-border)', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        padding: '2rem', animation: 'fadeInUp 0.2s ease both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {title}
          </h2>
          <button onClick={onClose} style={iconBtnStyle} aria-label="Fechar"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {showInviteFields && (
            <>
              <FormField label="Nome do Convite (ex: Família Silva - Opcional)" id="inv-disp">
                <input id="inv-disp" value={inviteForm.displayName}
                  onChange={(e) => setInviteForm((f) => ({ ...f, displayName: e.target.value }))}
                  placeholder="Gerado automaticamente se vazio" />
              </FormField>

              <FormField label="Grupo / Origem" id="inv-group">
                <select id="inv-group" value={inviteForm.group}
                  onChange={(e) => setInviteForm((f) => ({ ...f, group: e.target.value }))}>
                  <option value="Convidados do Noivo">Convidados do Noivo</option>
                  <option value="Convidados da Noiva">Convidados da Noiva</option>
                  <option value="Família do Noivo">Família do Noivo</option>
                  <option value="Família da Noiva">Família da Noiva</option>
                  <option value="Outros">Outros</option>
                </select>
              </FormField>

              <FormField label="Mesa nº" id="inv-table">
                <input id="inv-table" type="number" min={1}
                  value={inviteForm.tableNumber}
                  onChange={(e) => setInviteForm((f) => ({ ...f, tableNumber: e.target.value ? Number(e.target.value) : '' }))}
                  placeholder="—" />
              </FormField>
            </>
          )}

          {showGuestFields && (
            <>
              <FormField label="Nome da Pessoa *" id="gst-name">
                <input id="gst-name" required value={guestForm.name}
                  onChange={(e) => setGuestForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Ana Silva" />
              </FormField>

              <FormField label="Status RSVP" id="gst-status">
                <select id="gst-status" value={guestForm.status}
                  onChange={(e) => setGuestForm((f) => ({ ...f, status: e.target.value as RsvpStatus }))}>
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="declined">Recusado</option>
                </select>
              </FormField>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={secondaryBtnStyle}>Cancelar</button>
            <button type="submit" style={primaryBtnStyle}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Modal para Juntar Convites ─────────────────────────────────────────────
interface MergeModalProps {
  selectedIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

function MergeModal({ selectedIds, onClose, onSuccess }: MergeModalProps) {
  const { invitesWithGuests, mergeInvites } = useWedding();
  const [displayName, setDisplayName] = useState('');

  const selectedInvites = invitesWithGuests.filter(i => selectedIds.includes(i.invite.id));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedIds.length < 2) return;

    // O primeiro ID vira o convite destino, os demais são integrados a ele
    const [targetId, ...sourceIds] = selectedIds;
    mergeInvites(targetId, sourceIds, displayName.trim() || undefined);
    onSuccess();
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 100 }} aria-hidden="true" />
      <div role="dialog" aria-modal="true" style={{
        position: 'fixed', inset: 0, margin: 'auto',
        zIndex: 101, width: '100%', maxWidth: '460px', height: 'fit-content',
        background: 'var(--color-surface)', borderRadius: '20px',
        border: '1px solid var(--color-border)', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        padding: '2rem', animation: 'fadeInUp 0.2s ease both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Agrupar Convites
          </h2>
          <button onClick={onClose} style={iconBtnStyle} aria-label="Fechar"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Você está unindo os seguintes convites em um só convite com RSVP compartilhado:
          </p>

          <div style={{
            background: 'var(--color-surface-2)', padding: '10px 14px', borderRadius: '10px',
            maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--color-border)'
          }}>
            {selectedInvites.map(i => (
              <div key={i.invite.id} style={{ fontSize: '0.8rem', fontWeight: 600, padding: '3px 0' }}>
                • {i.displayName} ({i.guests.length} {i.guests.length === 1 ? 'pessoa' : 'pessoas'})
              </div>
            ))}
          </div>

          <FormField label="Nome personalizado do Convite (ex: Família Silva - Opcional)" id="mrg-name">
            <input id="mrg-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Deixe em branco para gerar ex: João + Maria" />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={secondaryBtnStyle}>Cancelar</button>
            <button type="submit" style={primaryBtnStyle}>
              Confirmar Agrupamento
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Modal de Importação em Lote ──────────────────────────────────────────────
interface BulkImportModalProps {
  onClose: () => void;
}

function BulkImportModal({ onClose }: BulkImportModalProps) {
  const { bulkCreateInvites } = useWedding();
  const [rawText, setRawText] = useState('');
  const [groupMode, setGroupMode] = useState<'groom' | 'bride' | 'custom'>('groom');
  const [customGroup, setCustomGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const names = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const groupLabel =
    groupMode === 'groom' ? 'Convidados do Noivo' :
    groupMode === 'bride' ? 'Convidados da Noiva' :
    customGroup;

  async function handleImport() {
    if (names.length === 0) return;
    setLoading(true);

    const items = names.map((name) => ({
      invite: {
        group: groupLabel,
      },
      guest: {
        name,
        group: groupLabel,
        status: 'pending' as RsvpStatus,
        plusOne: false,
      }
    }));

    await bulkCreateInvites(items);
    setLoading(false);
    setDone(true);
    setTimeout(onClose, 1200);
  }

  const groupOptions = [
    { value: 'groom', label: 'Convidados do Noivo' },
    { value: 'bride', label: 'Convidados da Noiva' },
    { value: 'custom', label: 'Outro grupo…' },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 100 }} aria-hidden="true" />
      <div role="dialog" aria-modal="true" style={{
        position: 'fixed', inset: 0, margin: 'auto',
        zIndex: 101, width: '100%', maxWidth: '520px', height: 'fit-content',
        background: 'var(--color-surface)', borderRadius: '20px',
        border: '1px solid var(--color-border)', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        padding: '2rem', animation: 'fadeInUp 0.2s ease both',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={16} color="var(--color-brand)" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Importar Lista</h2>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Cole os nomes, um por linha</p>
            </div>
          </div>
          <button onClick={onClose} style={iconBtnStyle} aria-label="Fechar"><X size={16} /></button>
        </div>

        {/* Group selector */}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>GRUPO</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {groupOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setGroupMode(opt.value as typeof groupMode)}
                style={{
                  padding: '7px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
                  border: `1.5px solid ${groupMode === opt.value ? 'var(--color-brand)' : 'var(--color-border)'}`,
                  background: groupMode === opt.value ? 'var(--color-brand-bg)' : 'var(--color-surface-2)',
                  color: groupMode === opt.value ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {groupMode === 'custom' && (
            <input
              style={{ marginTop: '8px', width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '0.85rem', background: 'var(--color-surface-2)', color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' }}
              placeholder="Nome do grupo…"
              value={customGroup}
              onChange={(e) => setCustomGroup(e.target.value)}
              autoFocus
            />
          )}
        </div>

        {/* Textarea */}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>LISTA DE NOMES</p>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Ana Silva\nBruno Santos\nCarla Mendes\n…`}
            rows={8}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '12px',
              border: '1px solid var(--color-border)', fontSize: '0.85rem',
              fontFamily: 'var(--font-body)', lineHeight: 1.6,
              background: 'var(--color-surface-2)', color: 'var(--color-text-primary)',
              outline: 'none', resize: 'vertical', boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-brand)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
          />
          {names.length > 0 && (
            <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: 'var(--color-brand)', fontWeight: 600 }}>
              ✓ {names.length} {names.length === 1 ? 'pessoa detectada' : 'pessoas detectadas'} (criará {names.length} convites)
            </p>
          )}
        </div>

        {/* Preview pill */}
        {names.length > 0 && (
          <div style={{ marginBottom: '1rem', padding: '10px 14px', borderRadius: '10px', background: 'var(--color-brand-bg)', border: '1px solid color-mix(in srgb, var(--color-brand) 20%, transparent)', fontSize: '0.8rem', color: 'var(--color-brand)' }}>
            <strong>{names.length} convites</strong> serão adicionados ao grupo <strong>&ldquo;{groupLabel || '—'}&rdquo;</strong> com status <strong>Pendente</strong>.
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" onClick={onClose} style={secondaryBtnStyle}>Cancelar</button>
          <button
            onClick={handleImport}
            disabled={names.length === 0 || loading || done || (groupMode === 'custom' && !customGroup.trim())}
            style={{
              ...primaryBtnStyle,
              opacity: (names.length === 0 || loading || done || (groupMode === 'custom' && !customGroup.trim())) ? 0.5 : 1,
              cursor: (names.length === 0 || loading || done) ? 'not-allowed' : 'pointer',
              minWidth: '130px', justifyContent: 'center',
            }}
          >
            {done ? <><CheckCircle size={14} /> Importado!</> :
             loading ? 'Importando…' :
             <><Upload size={14} /> Importar {names.length > 0 ? `(${names.length})` : ''}</>}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export function ConvidadosPage() {
  const { guests, invitesWithGuests, deleteInvite, deleteGuest, splitGuest } = useWedding();
  const [filter, setFilter] = useState<'all' | RsvpStatus>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modais
  const [modal, setModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit_invite' | 'edit_guest' | 'add_guest_to_invite';
    inviteId?: string;
    editingInvite?: Invite;
    editingGuest?: Guest;
  }>({ open: false, mode: 'create' });

  const [bulkModal, setBulkModal] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);

  // Seleção múltipla para Agrupamento (Merge)
  const [selectedInviteIds, setSelectedInviteIds] = useState<string[]>([]);

  // Accordion de convites
  const [expandedInvites, setExpandedInvites] = useState<Record<string, boolean>>({});

  // Contadores
  const totalInvites = invitesWithGuests.length;
  const totalGuests = guests.length;
  const confirmed = guests.filter((g) => g.status === 'confirmed').length;
  const pending = guests.filter((g) => g.status === 'pending').length;
  const declined = guests.filter((g) => g.status === 'declined').length;

  // Filtragem
  const filtered = invitesWithGuests.filter((iwg) => {
    if (filter === 'all') return true;
    return iwg.guests.some((g) => g.status === filter);
  });

  function toggleExpand(inviteId: string) {
    setExpandedInvites((prev) => ({ ...prev, [inviteId]: !prev[inviteId] }));
  }

  function handleSelectInvite(inviteId: string, checked: boolean) {
    if (checked) {
      setSelectedInviteIds((prev) => [...prev, inviteId]);
    } else {
      setSelectedInviteIds((prev) => prev.filter((id) => id !== inviteId));
    }
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedInviteIds(filtered.map(i => i.invite.id));
    } else {
      setSelectedInviteIds([]);
    }
  }

  function copyRsvpLink(inviteId: string) {
    const link = `${window.location.origin}/rsvp/invite/${inviteId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(inviteId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <div>
      <PageHeader
        icon={<Users size={22} color="var(--color-brand)" />}
        title="Convidados"
        sub={`${totalInvites} convites · ${totalGuests} pessoas no total · ${confirmed} confirmados`}
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              id="btn-bulk-import"
              onClick={() => setBulkModal(true)}
              style={secondaryBtnStyle}
              title="Importar lista de nomes em lote"
            >
              <Upload size={15} /> Importar lista
            </button>
            <button
              id="btn-add-guest"
              onClick={() => setModal({ open: true, mode: 'create' })}
              style={primaryBtnStyle}
            >
              <Plus size={16} /> Novo Convite
            </button>
          </div>
        }
      />

      {selectedInviteIds.length >= 2 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--color-brand-bg)', border: '1px solid rgba(176,141,110,0.3)',
          padding: '12px 20px', borderRadius: '12px', marginBottom: '1.5rem',
          animation: 'fadeInUp 0.15s ease'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-brand)' }}>
            {selectedInviteIds.length} convites selecionados
          </span>
          <button
            onClick={() => setMergeModalOpen(true)}
            style={{
              ...primaryBtnStyle,
              padding: '6px 12px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Juntar em um convite
          </button>
        </div>
      )}

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { label: 'Todos', value: 'all', count: totalGuests, color: 'var(--color-text-secondary)', bg: 'var(--color-surface-2)' },
          { label: 'Confirmados', value: 'confirmed', count: confirmed, color: 'var(--color-success)', bg: '#f0fdf4' },
          { label: 'Pendentes', value: 'pending', count: pending, color: 'var(--color-warning)', bg: '#fffbeb' },
          { label: 'Recusados', value: 'declined', count: declined, color: 'var(--color-danger)', bg: '#fef2f2' },
        ].map((chip) => (
          <button
            key={chip.value}
            onClick={() => setFilter(chip.value as typeof filter)}
            style={{
              padding: '6px 14px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
              border: `1px solid ${filter === chip.value ? chip.color : 'var(--color-border)'}`,
              background: filter === chip.value ? chip.bg : 'transparent',
              color: filter === chip.value ? chip.color : 'var(--color-text-secondary)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {chip.label} ({chip.count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={40} color="var(--color-border)" />}
          message={totalInvites === 0 ? 'Nenhum convite cadastrado ainda.' : 'Nenhum convite corresponde ao filtro.'}
          action={totalInvites === 0 ? (
            <button onClick={() => setModal({ open: true, mode: 'create' })} style={primaryBtnStyle}>
              <Plus size={14} /> Criar primeiro convite
            </button>
          ) : undefined}
        />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
                <th style={{ padding: '10px 16px', width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedInviteIds.length === filtered.length && filtered.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '10px 16px', width: '40px' }}></th>
                {['Convite / Grupo', 'Pessoas', 'Mesa', 'Confirmação', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((iwg) => {
                const invite = iwg.invite;
                const isMulti = iwg.guests.length > 1;
                const isExpanded = !!expandedInvites[invite.id];

                return (
                  <>
                    <tr
                      key={invite.id}
                      style={{
                        borderBottom: isExpanded ? 'none' : '1px solid var(--color-border)',
                        transition: 'background 0.1s',
                        background: isExpanded ? 'rgba(176,141,110,0.03)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedInviteIds.includes(invite.id)}
                          onChange={(e) => handleSelectInvite(invite.id, e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {isMulti ? (
                          <button
                            onClick={() => toggleExpand(invite.id)}
                            style={{
                              border: 'none', background: 'transparent', cursor: 'pointer',
                              color: 'var(--color-text-secondary)', display: 'inline-flex', padding: 0
                            }}
                          >
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </button>
                        ) : null}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {iwg.displayName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {invite.group}
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                        {iwg.guests.length} {iwg.guests.length === 1 ? 'pessoa' : 'pessoas'}
                      </td>

                      <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                        {invite.tableNumber ?? '—'}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        {isMulti ? (
                          <span style={{
                            display: 'inline-flex', padding: '3px 8px', borderRadius: '12px',
                            fontSize: '0.72rem', fontWeight: 600, background: 'var(--color-surface-2)',
                            color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)'
                          }}>
                            {iwg.confirmedCount} de {iwg.totalCount} confirmados
                          </span>
                        ) : (
                          <StatusBadge status={iwg.guests[0]?.status ?? 'pending'} />
                        )}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => copyRsvpLink(invite.id)}
                            style={{
                              ...iconBtnStyle,
                              color: copiedId === invite.id ? 'var(--color-success)' : 'var(--color-brand)',
                              background: copiedId === invite.id ? '#f0fdf4' : 'var(--color-surface-2)',
                            }}
                            title={copiedId === invite.id ? "Link copiado!" : "Copiar link do convite"}
                          >
                            {copiedId === invite.id ? <Check size={14} /> : <Link2 size={14} />}
                          </button>

                          <button
                            onClick={() => setModal({ open: true, mode: 'add_guest_to_invite', inviteId: invite.id, editingInvite: invite })}
                            style={iconBtnStyle}
                            title="Adicionar convidado a este convite"
                          >
                            <UserPlus size={14} />
                          </button>

                          <button
                            onClick={() => setModal({ open: true, mode: 'edit_invite', editingInvite: invite })}
                            style={iconBtnStyle}
                            title="Editar Convite"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm('Deseja excluir este convite e todas as pessoas vinculadas a ele?')) {
                                deleteInvite(invite.id);
                              }
                            }}
                            style={{ ...iconBtnStyle, color: 'var(--color-danger)' }}
                            title="Excluir Convite"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isMulti && isExpanded && (
                      <tr style={{ background: 'rgba(176,141,110,0.015)' }}>
                        <td colSpan={7} style={{ padding: '0 0 16px 0' }}>
                          <div style={{
                            margin: '0 16px 0 64px', border: '1px solid var(--color-border)',
                            borderRadius: '12px', background: 'var(--color-surface)', overflow: 'hidden'
                          }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <tbody>
                                {iwg.guests.map((guest, idx) => (
                                  <tr
                                    key={guest.id}
                                    style={{
                                      borderBottom: idx === iwg.guests.length - 1 ? 'none' : '1px solid var(--color-border)',
                                    }}
                                  >
                                    <td style={{ padding: '10px 16px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                      {guest.name}
                                    </td>
                                    <td style={{ padding: '10px 16px', width: '140px' }}>
                                      <StatusBadge status={guest.status} />
                                    </td>
                                    <td style={{ padding: '10px 16px', width: '120px' }}>
                                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                        <button
                                          onClick={() => setModal({ open: true, mode: 'edit_guest', editingGuest: guest })}
                                          style={{ ...iconBtnStyle, width: '26px', height: '26px' }}
                                          title="Editar Nome/Status"
                                        >
                                          <Pencil size={12} />
                                        </button>

                                        <button
                                          onClick={() => {
                                            if (confirm(`Deseja separar ${guest.name} em um convite individual próprio?`)) {
                                              splitGuest(guest.id);
                                            }
                                          }}
                                          style={{ ...iconBtnStyle, width: '26px', height: '26px' }}
                                          title="Desmembrar do convite"
                                        >
                                          <Scissors size={12} />
                                        </button>

                                        <button
                                          onClick={() => {
                                            if (confirm(`Remover ${guest.name} do convite?`)) {
                                              deleteGuest(guest.id);
                                            }
                                          }}
                                          style={{ ...iconBtnStyle, width: '26px', height: '26px', color: 'var(--color-danger)' }}
                                          title="Remover pessoa"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <GuestOrInviteModal
          mode={modal.mode}
          inviteId={modal.inviteId}
          initialInvite={modal.editingInvite}
          initialGuest={modal.editingGuest}
          onClose={() => setModal({ open: false, mode: 'create' })}
        />
      )}

      {bulkModal && (
        <BulkImportModal
          onClose={() => setBulkModal(false)}
        />
      )}

      {mergeModalOpen && (
        <MergeModal
          selectedIds={selectedInviteIds}
          onClose={() => setMergeModalOpen(false)}
          onSuccess={() => {
            setMergeModalOpen(false);
            setSelectedInviteIds([]);
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: RsvpStatus }) {
  const map = {
    confirmed: { label: 'Confirmado', color: 'var(--color-success)', bg: '#f0fdf4', icon: <CheckCircle size={12} /> },
    pending:   { label: 'Pendente',   color: 'var(--color-warning)', bg: '#fffbeb', icon: <Clock size={12} /> },
    declined:  { label: 'Recusado',   color: 'var(--color-danger)',  bg: '#fef2f2', icon: <XCircle size={12} /> },
  };
  const s = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, color: s.color, background: s.bg }}>
      {s.icon} {s.label}
    </span>
  );
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────
export function PageHeader({ icon, title, sub, action }: { icon: React.ReactNode; title: string; sub: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--color-brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <div>
          <h1 className="font-display" style={{ margin: 0, fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</h1>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{sub}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, message, action }: { icon: React.ReactNode; message: string; action?: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
      {icon}
      <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{message}</p>
      {action}
    </div>
  );
}

export function FormField({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label htmlFor={id} style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>{label}</label>
      <div className="form-field-wrap">{children}</div>
      <style>{`
        .form-field-wrap input, .form-field-wrap select, .form-field-wrap textarea {
          width: 100%; padding: 9px 12px;
          border: 1px solid var(--color-border); border-radius: 10px;
          font-size: 0.85rem; font-family: var(--font-body);
          color: var(--color-text-primary); background: var(--color-surface-2);
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .form-field-wrap input:focus, .form-field-wrap select:focus, .form-field-wrap textarea:focus {
          border-color: var(--color-brand);
          box-shadow: 0 0 0 3px rgba(176,141,110,0.15);
        }
      `}</style>
    </div>
  );
}

export const primaryBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  background: 'var(--color-brand)', color: '#fff',
  border: 'none', borderRadius: '10px', cursor: 'pointer',
  padding: '9px 18px', fontSize: '0.85rem', fontWeight: 600,
};

export const secondaryBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)',
  border: '1px solid var(--color-border)', borderRadius: '10px', cursor: 'pointer',
  padding: '9px 18px', fontSize: '0.85rem', fontWeight: 500,
};

export const iconBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '30px', height: '30px', borderRadius: '8px',
  background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
  cursor: 'pointer', color: 'var(--color-text-secondary)',
};
