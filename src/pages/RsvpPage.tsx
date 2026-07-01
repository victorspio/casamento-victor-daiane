import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, CheckCircle2, ArrowLeft, Check, X } from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import type { Guest } from '../types/wedding';

export function RsvpPage() {
  const { inviteId, guestId } = useParams<{ inviteId?: string; guestId?: string }>();
  const { guests, config, updateGuest } = useWedding();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Armazena as respostas locais do formulário: { [guestId]: 'confirmed' | 'declined' }
  const [responses, setResponses] = useState<Record<string, 'confirmed' | 'declined' | 'pending'>>({});

  // Encontra os convidados pertencentes ao convite
  let inviteGuests: Guest[] = [];

  if (inviteId) {
    inviteGuests = guests.filter((g) => g.inviteId === inviteId);
  } else if (guestId) {
    const singleGuest = guests.find((g) => g.id === guestId);
    if (singleGuest) {
      if (singleGuest.inviteId) {
        inviteGuests = guests.filter((g) => g.inviteId === singleGuest.inviteId);
      } else {
        inviteGuests = [singleGuest];
      }
    }
  }

  // Inicializa o estado local das respostas quando os convidados carregam
  useEffect(() => {
    if (inviteGuests.length > 0 && Object.keys(responses).length === 0) {
      const initial: Record<string, 'confirmed' | 'declined' | 'pending'> = {};
      inviteGuests.forEach((g) => {
        initial[g.id] = g.status;
      });
      setResponses(initial);
    }
  }, [inviteGuests]);

  if (guests.length > 0 && inviteGuests.length === 0) {
    return (
      <div style={containerStyle}>
        <div className="card animate-fade-in-up" style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <Heart size={48} color="var(--color-border)" style={{ marginBottom: '1.5rem' }} />
            <h1 className="font-display" style={{ fontSize: '1.75rem', color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
              Convite não encontrado
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Não conseguimos localizar este convite. Verifique se o link está correto.
            </p>
            <a href="/" style={backLinkStyle}>
              <ArrowLeft size={14} /> Voltar para o início
            </a>
          </div>
        </div>
      </div>
    );
  }

  const coupleLabel = config.groom && config.bride
    ? `${config.groom} & ${config.bride}`
    : 'Victor & Daiane';

  const weddingDateStr = config.weddingDate
    ? new Date(config.weddingDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const weddingTimeStr = config.weddingDate
    ? new Date(config.weddingDate).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  function handleSelectStatus(gId: string, status: 'confirmed' | 'declined') {
    setResponses((prev) => ({ ...prev, [gId]: status }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Salva cada resposta individualmente
      for (const g of inviteGuests) {
        const status = responses[g.id] || 'pending';
        await updateGuest(g.id, { status });
      }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao salvar suas respostas. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Verifica se todos responderam (nenhum pendente na tela)
  const anyUnanswered = inviteGuests.some(g => !responses[g.id] || responses[g.id] === 'pending');

  return (
    <div style={containerStyle}>
      <div className="card animate-fade-in-up" style={cardStyle}>
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={heartIconContainerStyle}>
                <Heart size={24} color="var(--color-brand)" fill="var(--color-brand)" />
              </div>
              <p style={eyebrowStyle}>Você foi convidado para o casamento de</p>
              <h1 className="font-display" style={titleStyle}>
                {coupleLabel}
              </h1>
              {weddingDateStr && (
                <div style={dateBoxStyle}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{weddingDateStr}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', opacity: 0.8 }}>
                    às {weddingTimeStr}h {config.venue ? `· ${config.venue}` : ''}
                  </p>
                </div>
              )}
            </div>

            <p style={{
              fontSize: '0.85rem', color: 'var(--color-text-secondary)',
              textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.5
            }}>
              Por favor, confirme a presença de cada convidado abaixo:
            </p>

            {/* List of Guests in Invite */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {inviteGuests.map((g) => {
                const currentStatus = responses[g.id];
                return (
                  <div
                    key={g.id}
                    style={{
                      background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                      borderRadius: '16px', padding: '16px', display: 'flex',
                      flexDirection: 'column', gap: '12px'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>
                      {g.name}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleSelectStatus(g.id, 'confirmed')}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          padding: '10px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
                          cursor: 'pointer', border: '1.5px solid var(--color-border)',
                          transition: 'all 0.15s',
                          background: currentStatus === 'confirmed' ? '#f0fdf4' : 'transparent',
                          color: currentStatus === 'confirmed' ? 'var(--color-success)' : 'var(--color-text-secondary)',
                          borderColor: currentStatus === 'confirmed' ? 'var(--color-success)' : 'var(--color-border)',
                        }}
                      >
                        <Check size={14} /> Presença Confirmada
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectStatus(g.id, 'declined')}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          padding: '10px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
                          cursor: 'pointer', border: '1.5px solid var(--color-border)',
                          transition: 'all 0.15s',
                          background: currentStatus === 'declined' ? '#fef2f2' : 'transparent',
                          color: currentStatus === 'declined' ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                          borderColor: currentStatus === 'declined' ? 'var(--color-danger)' : 'var(--color-border)',
                        }}
                      >
                        <X size={14} /> Não poderei ir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...submitButtonStyle,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Enviando...' : 'Confirmar Presenças'}
            </button>

            {anyUnanswered && (
              <p style={{
                textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)',
                marginTop: '10px', margin: '10px 0 0 0'
              }}>
                * Responda para todos os convidados acima antes de confirmar.
              </p>
            )}
          </form>
        ) : (
          /* Success Screen */
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={successIconContainerStyle}>
              <CheckCircle2 size={36} color="var(--color-success)" />
            </div>

            <h2 className="font-display" style={{ fontSize: '1.6rem', color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
              Respostas Enviadas!
            </h2>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '2rem' }}>
              Agradecemos imensamente a sua resposta. As confirmações já foram atualizadas no planejamento dos noivos!
            </p>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Quer alterar alguma resposta? Basta acessar este mesmo link novamente a qualquer momento.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--color-bg)',
  padding: '1.5rem',
  boxSizing: 'border-box',
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '460px',
  padding: '2.5rem 2rem',
  background: 'var(--color-surface)',
  borderRadius: '24px',
  boxShadow: '0 12px 48px rgba(10, 8, 6, 0.08)',
  border: '1px solid var(--color-border)',
  boxSizing: 'border-box',
};

const heartIconContainerStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  background: 'var(--color-brand-bg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 1rem',
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.72rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'var(--color-text-muted)',
};

const titleStyle: React.CSSProperties = {
  margin: '4px 0 1rem',
  fontSize: '2rem',
  fontWeight: 700,
  color: 'var(--color-text-primary)',
};

const dateBoxStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: 'var(--color-surface-2)',
  borderRadius: '12px',
  display: 'inline-block',
  fontSize: '0.85rem',
  color: 'var(--color-text-secondary)',
  border: '1px solid var(--color-border)',
};

const submitButtonStyle: React.CSSProperties = {
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--color-brand)',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  padding: '14px',
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const successIconContainerStyle: React.CSSProperties = {
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  background: '#f0fdf4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 1.25rem',
};

const backLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.82rem',
  color: 'var(--color-brand)',
  textDecoration: 'none',
  fontWeight: 500,
};

