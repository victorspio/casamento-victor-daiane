import type { CountdownData } from '../types/wedding';

interface HeroBannerProps {
  groom: string;
  bride: string;
  venue: string;
  city: string;
  weddingDate: string;
  countdown: CountdownData;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown-unit">
      <span className="countdown-number">{String(value).padStart(2, '0')}</span>
      <span className="countdown-label">{label}</span>
    </div>
  );
}

function Separator() {
  return (
    <span
      className="countdown-number"
      style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '20px', fontSize: '2rem' }}
    >
      :
    </span>
  );
}

export function HeroBanner({ groom, bride, venue, city, weddingDate, countdown }: HeroBannerProps) {
  const coupleLabel = groom && bride ? `${groom} & ${bride}` : 'Seu Casamento';
  const hasDate = !!weddingDate;

  const formattedDate = hasDate
    ? new Date(weddingDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const locationLine = [venue, city].filter(Boolean).join(' · ');

  return (
    <div
      className="animate-fade-in-up relative w-full overflow-hidden"
      style={{
        borderRadius: '20px',
        minHeight: '340px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: 'url(/hero-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
      }}
      role="banner"
      aria-label="Hero do casamento com contagem regressiva"
    >
      {/* Cinematic overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,8,6,0.45) 0%, rgba(10,8,6,0.65) 50%, rgba(10,8,6,0.80) 100%)',
          borderRadius: 'inherit',
        }}
      />

      {/* Film grain */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'saturate\' values=\'0\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.035\'/%3E%3C/svg%3E")',
          borderRadius: 'inherit', opacity: 0.4, mixBlendMode: 'overlay',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '2.5rem 2rem', width: '100%' }}>
        {/* Eyebrow */}
        <p style={{
          fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: '1rem',
        }}>
          ✦ Planejamento do Casamento ✦
        </p>

        {/* Names */}
        <h1 className="font-display animate-fade-in-up delay-100" style={{
          fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 700, color: '#fff',
          lineHeight: 1.1, marginBottom: '0.5rem', textShadow: '0 2px 24px rgba(0,0,0,0.4)',
        }}>
          {coupleLabel.includes('&')
            ? <>
                {groom} <span style={{ color: 'var(--color-brand-light)' }}>&</span> {bride}
              </>
            : coupleLabel}
        </h1>

        {/* Date + Venue */}
        {(formattedDate || locationLine) && (
          <div className="hero-divider animate-fade-in-up delay-200" style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', fontWeight: 400, letterSpacing: '0.05em' }}>
              {[formattedDate, locationLine].filter(Boolean).join(' · ')}
            </p>
          </div>
        )}

        {/* Countdown */}
        {hasDate && (
          <div
            className="animate-fade-in-up delay-300"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}
            aria-label={`Faltam ${countdown.days} dias para o casamento`}
          >
            <CountdownUnit value={countdown.days} label="Dias" />
            <Separator />
            <CountdownUnit value={countdown.hours} label="Horas" />
            <Separator />
            <CountdownUnit value={countdown.minutes} label="Minutos" />
            <Separator />
            <CountdownUnit value={countdown.seconds} label="Segundos" />
          </div>
        )}

        {!hasDate && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '1rem' }}>
            Configure a data em ⚙️ Configurações
          </p>
        )}
      </div>
    </div>
  );
}
