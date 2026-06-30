import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { useWedding } from '../context/WeddingContext';

export function RsvpPage() {
  const { guestId } = useParams<{ guestId: string }>();
  const { guests, config, updateGuest } = useWedding();
  const [submitted, setSubmitted] = useState(false);
  const [responseStatus, setResponseStatus] = useState<'confirmed' | 'declined' | null>(null);

  // Encontra o convidado
  const guest = guests.find((g) => g.id === guestId);

  if (!guest) {
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

  function handleRsvp(status: 'confirmed' | 'declined') {
    updateGuest(guest!.id, { status, plusOne: false });
    setResponseStatus(status);
    setSubmitted(true);
  }

  return (
    <div style={containerStyle}>
      <div className="card animate-fade-in-up" style={cardStyle}>
        {!submitted ? (
          <div>
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

            {/* Guest Welcome */}
            <div style={welcomeBoxStyle}>
              <p style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Convidado(a)
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-brand)' }}>
                {guest.name}
              </p>
              {guest.group && (
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  {guest.group}
                </p>
              )}
            </div>

            {/* RSVP Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>


              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => handleRsvp('declined')}
                  style={declineButtonStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <XCircle size={16} /> Não poderei ir
                </button>
                <button
                  onClick={() => handleRsvp('confirmed')}
                  style={confirmButtonStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-brand-dark)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-brand)')}
                >
                  <CheckCircle2 size={16} /> Confirmar Presença
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Success/Confirmation Screen */
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={successIconContainerStyle(responseStatus === 'confirmed')}>
              {responseStatus === 'confirmed' ? (
                <CheckCircle2 size={36} color="var(--color-success)" />
              ) : (
                <XCircle size={36} color="var(--color-danger)" />
              )}
            </div>

            <h2 className="font-display" style={{ fontSize: '1.6rem', color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
              {responseStatus === 'confirmed' ? 'Presença Confirmada!' : 'Resposta Enviada'}
            </h2>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '2rem' }}>
              {responseStatus === 'confirmed'
                ? 'Obrigado por confirmar! Estamos ansiosos para celebrar este dia especial com você.'
                : 'Poxa, que pena que não poderá ir. Agradecemos por nos avisar!'}
            </p>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Quer alterar sua resposta? Basta clicar no link do convite novamente a qualquer momento.
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

const welcomeBoxStyle: React.CSSProperties = {
  padding: '1.25rem',
  background: 'var(--color-brand-bg)',
  borderRadius: '16px',
  border: '1px solid rgba(176,141,110,0.15)',
  marginBottom: '1.5rem',
  textAlign: 'center',
};



const confirmButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  background: 'var(--color-brand)',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  padding: '12px',
  fontSize: '0.88rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const declineButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  background: 'transparent',
  color: 'var(--color-danger)',
  border: '1px solid #fecaca',
  borderRadius: '12px',
  padding: '12px',
  fontSize: '0.88rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const successIconContainerStyle = (isConfirmed: boolean): React.CSSProperties => ({
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  background: isConfirmed ? '#f0fdf4' : '#fef2f2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 1.25rem',
});

const backLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.82rem',
  color: 'var(--color-brand)',
  textDecoration: 'none',
  fontWeight: 500,
};
