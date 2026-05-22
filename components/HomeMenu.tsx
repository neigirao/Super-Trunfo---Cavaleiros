import React, { CSSProperties } from 'react';
import { UserProfile } from '../types';
import { ELEMENTS, ATTR, PERIODIC, FORMULAS, ElementData, fmt } from '../shared';

// ─── helpers ────────────────────────────────────────────────
const el2num = (el: ElementData, key: string): number =>
  (el as unknown as Record<string, number>)[key] ?? 0;

const triggerGoogleSignIn = () => {
  (window as any).google?.accounts?.id?.prompt?.();
};

// ─── CosmicBG ───────────────────────────────────────────────
export const CosmicBG: React.FC = () => (
  <>
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundImage: `
        radial-gradient(2px 2px at 20px 30px, #f4c349, transparent),
        radial-gradient(1px 1px at 40px 70px, #fff8e1, transparent),
        radial-gradient(1px 1px at 50px 160px, #f4c349, transparent),
        radial-gradient(2px 2px at 130px 40px, #fff, transparent),
        radial-gradient(1px 1px at 80px 220px, #f4c349, transparent),
        radial-gradient(1px 1px at 200px 90px, #fff8e1, transparent),
        radial-gradient(2px 2px at 340px 200px, #f4c349, transparent),
        radial-gradient(1px 1px at 290px 130px, #fff, transparent),
        radial-gradient(1px 1px at 150px 280px, #f4c349, transparent)
      `,
      backgroundSize: '400px 320px', opacity: 0.35,
    }} />
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      background: `
        radial-gradient(ellipse 700px 500px at 10% 10%, rgba(244,195,73,.1), transparent),
        radial-gradient(ellipse 800px 600px at 90% 50%, rgba(217,74,74,.04), transparent),
        radial-gradient(ellipse 500px 400px at 30% 90%, rgba(244,195,73,.06), transparent)
      `,
    }} />
  </>
);

// ─── PeriodicTile ────────────────────────────────────────────
export const PeriodicTile: React.FC<{ opacity?: number }> = ({ opacity = 0.04 }) => (
  <div style={{
    position: 'absolute', inset: 0, opacity, pointerEvents: 'none',
    display: 'grid', gridTemplateColumns: 'repeat(18,1fr)', gridTemplateRows: 'repeat(7,1fr)',
    color: '#f4c349', fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 16,
  }}>
    {PERIODIC.map(([p, g, s], i) => (
      <div key={i} style={{
        gridColumn: g, gridRow: p,
        border: '1.5px solid currentColor',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        aspectRatio: '1/1', maxWidth: 64, maxHeight: 64,
      }}>{s}</div>
    ))}
  </div>
);

// ─── FloatingFormulasBG ──────────────────────────────────────
const FloatingFormulasBG: React.FC<{ count?: number }> = ({ count = 8 }) => {
  const positions: CSSProperties[] = [
    { top: '8%',  left: '3%',  transform: 'rotate(-12deg)' },
    { top: '14%', right: '4%', transform: 'rotate(8deg)'   },
    { top: '46%', left: '2%',  transform: 'rotate(-4deg)'  },
    { top: '52%', right: '3%', transform: 'rotate(6deg)'   },
    { top: '78%', left: '4%',  transform: 'rotate(-8deg)'  },
    { top: '82%', right: '5%', transform: 'rotate(10deg)'  },
    { top: '30%', left: '6%',  transform: 'rotate(90deg)'  },
    { top: '66%', right: '2%', transform: 'rotate(-90deg)' },
  ];
  return (
    <>
      {FORMULAS.slice(0, count).map((f, i) => (
        <div key={i} style={{
          position: 'absolute', ...positions[i] ?? {},
          fontFamily: 'IBM Plex Mono, monospace', fontSize: 18,
          color: 'rgba(244,195,73,.07)', fontWeight: 500,
          pointerEvents: 'none', userSelect: 'none',
        }}>{f}</div>
      ))}
    </>
  );
};

// ─── SectionLabel ────────────────────────────────────────────
const SectionLabel: React.FC<{ preLabel: string; title: string; sub: string }> = ({ preLabel, title, sub }) => (
  <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto' }}>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 18 }}>
      <span style={{ width: 36, height: 1, background: '#f4c349', display: 'block' }} />
      <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.5em', color: '#f4c349' }}>{preLabel}</span>
      <span style={{ width: 36, height: 1, background: '#f4c349', display: 'block' }} />
    </div>
    <h2 style={{
      fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 'clamp(32px,3.5vw,52px)',
      letterSpacing: '.04em', color: '#fff8e1', margin: '0 0 14px', lineHeight: 1.1,
    }}>{title}</h2>
    <p style={{ fontFamily: 'Spectral, serif', fontSize: 17, lineHeight: 1.55, color: 'rgba(255,236,196,.7)', margin: 0 }}>
      {sub}
    </p>
  </div>
);

// ─── HomeHeader ──────────────────────────────────────────────
interface HeaderProps {
  userProfile: UserProfile | null;
  isAdmin: boolean;
  onStartGame: () => void;
  onGoToRanking: () => void;
  onGoToAdmin: () => void;
  onGoToRules?: () => void;
}

const HomeHeader: React.FC<HeaderProps> = ({ userProfile, isAdmin, onStartGame, onGoToRanking, onGoToAdmin, onGoToRules }) => (
  <header style={{
    position: 'sticky', top: 0, zIndex: 50,
    display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', alignItems: 'center',
    padding: '16px 48px',
    background: 'rgba(10,5,0,.85)',
    borderBottom: '2px solid #f4c349',
    backdropFilter: 'blur(10px)',
  }}>
    {/* Logo */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 54, height: 54, borderRadius: '50%',
        background: 'linear-gradient(135deg,#f4c349,#6a4f1e)',
        border: '2px solid #f4c349',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        boxShadow: '0 0 0 1px #1a0e04, 0 0 24px rgba(244,195,73,.6)',
      }}>
        <div style={{ position: 'absolute', inset: 6, border: '1px solid #f4c349', borderRadius: '50%' }} />
        <div style={{ color: '#f4c349', fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 20 }}>Ω</div>
      </div>
      <div>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 19, letterSpacing: '.18em', color: '#fff8e1' }}>
          CAVALEIROS
        </div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.4em', color: '#f4c349' }}>
          · DOS ELEMENTOS ·
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav style={{ display: 'flex', justifyContent: 'center', gap: 26 }}>
      {([
        ['JOGAR',   '◇', onStartGame,   !!userProfile],
        ['RANKING', '♛', onGoToRanking, true         ],
        ['REGRAS',  '?', onGoToRules,   true         ],
        ['ADMIN',   '✦', onGoToAdmin,   isAdmin      ],
      ] as [string, string, (() => void) | undefined, boolean][])
        .filter(([,,,show]) => show !== false || true)
        .map(([n, g, cb, visible], i) => (
          visible === false ? null : (
            <button key={n} onClick={cb ?? undefined} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: 'Cinzel, serif',
              fontWeight: i === 0 ? 700 : 400,
              fontSize: 10, letterSpacing: '.3em',
              color: i === 0 ? '#fff8e1' : 'rgba(255,236,196,.6)',
              borderBottom: i === 0 ? '1px solid #f4c349' : 'none',
              paddingBottom: 3,
            }}>
              <span style={{ color: '#f4c349', marginRight: 6 }}>{g}</span>{n}
            </button>
          )
        ))
      }
    </nav>

    {/* Auth area */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
      {/* hidden google button target kept for GSI renderButton */}
      <div id="google-signin-button" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1, overflow: 'hidden' }} />

      {userProfile ? (
        <>
          <img src={userProfile.picture} alt={userProfile.name}
            style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #f4c349' }} />
          <button onClick={onStartGame} style={{
            fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 10, letterSpacing: '.3em',
            color: '#1a0e04', padding: '9px 18px', cursor: 'pointer',
            background: 'linear-gradient(180deg,#f4c349,#8a6a2a)',
            border: '1px solid #f4c349',
            boxShadow: '0 0 16px rgba(244,195,73,.4)',
          }}>JOGAR</button>
        </>
      ) : (
        <>
          <button onClick={triggerGoogleSignIn} style={{
            fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.3em', color: 'rgba(244,195,73,.8)',
            background: 'none', cursor: 'pointer', padding: '8px 16px',
            border: '1px solid rgba(244,195,73,.4)',
          }}>ENTRAR</button>
          <button onClick={triggerGoogleSignIn} style={{
            fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 10, letterSpacing: '.3em',
            color: '#1a0e04', padding: '9px 18px', cursor: 'pointer',
            background: 'linear-gradient(180deg,#f4c349,#8a6a2a)',
            border: '1px solid #f4c349',
            boxShadow: '0 0 16px rgba(244,195,73,.4)',
          }}>CRIAR CONTA</button>
        </>
      )}
    </div>
  </header>
);

// ─── HeroCard ────────────────────────────────────────────────
const HeroCard: React.FC = () => {
  const el = ELEMENTS.Li;
  return (
    <div style={{ position: 'relative', width: 480, height: 680, margin: '0 auto', transform: 'rotate(-2deg)' }}>
      {/* Aura */}
      <div style={{
        position: 'absolute', inset: -80,
        background: 'radial-gradient(ellipse, rgba(244,195,73,.4) 0%, transparent 65%)',
        filter: 'blur(8px)',
      }} />

      {/* Card */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #f5ecd4 0%, #e8dab8 30%, #f5ecd4 60%, #d8c89a 100%)',
        border: '2px solid #c9a14a',
        boxShadow: `
          0 0 0 1px #1a0e04,
          0 0 0 5px #f4c349,
          0 0 0 6px #1a0e04,
          0 30px 60px rgba(0,0,0,.6),
          0 0 100px rgba(244,195,73,.5)
        `,
      }}>
        {/* Pediment */}
        <div style={{
          position: 'absolute', top: -1, left: -1, right: -1, height: 42,
          background: 'linear-gradient(180deg,#f4c349,#8a6a2a)',
          clipPath: 'polygon(0 100%, 50% 0, 100% 100%)', zIndex: 2,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 5,
        }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.4em', color: '#1a0e04', fontWeight: 900 }}>
            LEGENDARY
          </span>
        </div>

        <div style={{
          position: 'absolute', inset: '50px 22px 30px',
          border: '1px solid #c9a14a80',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Title */}
          <div style={{
            padding: '12px 16px 9px', textAlign: 'center',
            borderBottom: '1px solid #c9a14a40', background: 'rgba(138,107,42,.07)',
          }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.4em', color: '#8a6a2a' }}>
              · {el.greek} ·
            </div>
            <div style={{
              fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 22, color: '#1a0e04',
              letterSpacing: '.05em', marginTop: 2,
            }}>CAVALEIRO DO {el.name.toUpperCase()}</div>
          </div>

          {/* Portrait */}
          <div style={{
            margin: '12px 12px 8px', position: 'relative', height: 380,
            border: '2px solid #1a0e04',
            background: `radial-gradient(circle at 50% 70%, hsl(${el.hue} 60% 30%) 0%, hsl(${el.hue} 50% 15%) 100%)`,
            overflow: 'hidden',
            boxShadow: 'inset 0 0 0 1px #c9a14a, 0 0 24px rgba(244,195,73,.4)',
          }}>
            <div style={{ position: 'absolute', inset: 6, border: '1px solid rgba(244,195,73,.5)', zIndex: 3, pointerEvents: 'none' }} />
            <img
              src="assets/cavaleiro-litio.png"
              alt="Cavaleiro do Lítio"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: '50% 0%', zIndex: 1,
              }}
            />
            {/* Atomic number badge */}
            <div style={{
              position: 'absolute', top: 10, left: 10, zIndex: 4,
              padding: '3px 10px', background: 'rgba(0,0,0,.65)', border: '1px solid #f4c349',
              fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 11, letterSpacing: '.2em', color: '#f4c349',
            }}>Nº {String(el.atomic).padStart(3, '0')}</div>
            {/* Symbol badge */}
            <div style={{
              position: 'absolute', bottom: 10, left: 10, zIndex: 4,
              width: 42, height: 42, background: '#f4c349', color: '#1a0e04', border: '1px solid #1a0e04',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 20,
              boxShadow: '0 0 14px #f4c349',
            }}>{el.symbol}</div>
            {/* Mass label */}
            <div style={{
              position: 'absolute', bottom: 10, right: 10, zIndex: 4,
              fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: '#fff8e1',
              padding: '3px 8px', background: 'rgba(0,0,0,.5)', borderLeft: '2px solid #f4c349',
            }}>{fmt(el.mass)} u</div>
          </div>

          {/* Stats */}
          <div style={{ padding: '0 12px 4px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 3 }}>
            {Object.keys(ATTR).map(k => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 12px', background: 'rgba(201,161,74,.12)', border: '1px solid #8a6a2a40',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#8a6a2a', fontSize: 13 }}>{ATTR[k].icon}</span>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.18em', color: '#1a0e04', fontWeight: 700 }}>
                    {ATTR[k].label.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 14, color: '#1a0e04' }}>
                    {fmt(el2num(el, k))}
                  </span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#8a6a2a' }}>
                    {ATTR[k].unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: -1, right: -1, height: 26,
          background: 'linear-gradient(180deg,#f4c349,#8a6a2a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.35em', color: '#1a0e04', fontWeight: 700,
        }}>
          · {el.symbol} · {fmt(el.mass)} u · CONFIG [He] 2s¹ ·
        </div>
      </div>

      {/* Decorative tag */}
      <div style={{
        position: 'absolute', top: -12, right: -30,
        padding: '8px 18px', background: '#1a0e04', border: '1px solid #f4c349',
        fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.4em', color: '#f4c349',
        transform: 'rotate(8deg)', boxShadow: '0 0 20px rgba(244,195,73,.4)',
        zIndex: 5,
      }}>· CARTA EM DESTAQUE ·</div>
    </div>
  );
};

// ─── HomeHero ────────────────────────────────────────────────
interface HeroProps {
  userProfile: UserProfile | null;
  onStartGame: () => void;
}

const HomeHero: React.FC<HeroProps> = ({ userProfile, onStartGame }) => {
  const handlePlay = () => {
    if (userProfile) {
      onStartGame();
    } else {
      triggerGoogleSignIn();
    }
  };

  return (
    <section style={{
      position: 'relative',
      minHeight: 780, padding: '80px 48px 60px', overflow: 'hidden',
      background: 'radial-gradient(ellipse at 50% 20%, rgba(42,26,8,.6) 0%, transparent 60%)',
    }}>
      {/* Sun-burst */}
      <div style={{
        position: 'absolute', top: '10%', right: '-100px', width: 900, height: 900,
        background: `
          radial-gradient(circle at center, rgba(244,195,73,.4) 0%, rgba(244,195,73,.1) 35%, transparent 70%),
          conic-gradient(from 0deg,
            rgba(244,195,73,.3) 0deg, transparent 8deg, rgba(244,195,73,.3) 16deg, transparent 24deg,
            rgba(244,195,73,.3) 32deg, transparent 40deg, rgba(244,195,73,.3) 48deg, transparent 56deg,
            rgba(244,195,73,.3) 64deg, transparent 72deg, rgba(244,195,73,.3) 80deg, transparent 88deg,
            rgba(244,195,73,.3) 96deg, transparent 104deg, rgba(244,195,73,.3) 112deg, transparent 120deg,
            rgba(244,195,73,.3) 128deg, transparent 136deg, rgba(244,195,73,.3) 144deg, transparent 152deg,
            rgba(244,195,73,.3) 160deg, transparent 168deg, rgba(244,195,73,.3) 176deg, transparent 184deg,
            rgba(244,195,73,.3) 192deg, transparent 200deg, rgba(244,195,73,.3) 208deg, transparent 216deg,
            rgba(244,195,73,.3) 224deg, transparent 232deg, rgba(244,195,73,.3) 240deg, transparent 248deg,
            rgba(244,195,73,.3) 256deg, transparent 264deg, rgba(244,195,73,.3) 272deg, transparent 280deg,
            rgba(244,195,73,.3) 288deg, transparent 296deg, rgba(244,195,73,.3) 304deg, transparent 312deg,
            rgba(244,195,73,.3) 320deg, transparent 328deg, rgba(244,195,73,.3) 336deg, transparent 344deg,
            rgba(244,195,73,.3) 352deg)
        `,
        opacity: 0.6, pointerEvents: 'none',
      }} />

      {/* Constellation lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18, pointerEvents: 'none' }}
        viewBox="0 0 1700 800" preserveAspectRatio="none">
        <g stroke="#f4c349" strokeWidth="0.5" fill="#f4c349">
          <line x1="120" y1="180" x2="220" y2="240" />
          <line x1="220" y1="240" x2="180" y2="340" />
          <line x1="180" y1="340" x2="290" y2="380" />
          <line x1="290" y1="380" x2="320" y2="280" />
          <circle cx="120" cy="180" r="2" /><circle cx="220" cy="240" r="2" />
          <circle cx="180" cy="340" r="2" /><circle cx="290" cy="380" r="2" />
          <circle cx="320" cy="280" r="2" />
          <line x1="1380" y1="500" x2="1480" y2="560" />
          <line x1="1480" y1="560" x2="1560" y2="480" />
          <circle cx="1380" cy="500" r="2" /><circle cx="1480" cy="560" r="2" />
          <circle cx="1560" cy="480" r="2" />
        </g>
      </svg>

      <FloatingFormulasBG count={6} />

      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: 1400, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 60, alignItems: 'center',
      }}>
        {/* LEFT copy */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
            <span style={{ width: 48, height: 1, background: '#f4c349', display: 'block' }} />
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.5em', color: '#f4c349' }}>
              · DUELO DE COSMOS ·
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Cinzel, serif', fontWeight: 900,
            fontSize: 'clamp(48px, 6vw, 84px)',
            lineHeight: 0.98, letterSpacing: '.02em',
            color: '#fff8e1', margin: '0 0 8px',
            textShadow: '0 0 30px rgba(244,195,73,.3)',
          }}>
            CAVALEIROS<br />
            <span style={{ color: '#f4c349' }}>DOS ELEMENTOS</span>
          </h1>

          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 14, letterSpacing: '.4em', color: '#f4c349', marginBottom: 24 }}>
            · TABULA PERIODICA · ARMA TUA ·
          </div>

          <p style={{
            fontFamily: 'Spectral, serif', fontSize: 19, lineHeight: 1.55,
            color: 'rgba(255,236,196,.85)', maxWidth: 520, marginBottom: 36,
          }}>
            A tabela periódica vira campo de batalha. Invoque cavaleiros forjados nas
            estrelas, aposte em <strong style={{ color: '#f4c349' }}>massa</strong>,{' '}
            <strong style={{ color: '#f4c349' }}>densidade</strong> ou{' '}
            <strong style={{ color: '#f4c349' }}>ponto de fusão</strong> — e prove que conhece o
            cosmos melhor que seu adversário.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 40 }}>
            <button onClick={handlePlay} style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              padding: '18px 36px', cursor: 'pointer',
              background: 'linear-gradient(180deg,#f4c349,#8a6a2a)',
              color: '#1a0e04',
              border: '2px solid #f4c349',
              fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 13, letterSpacing: '.32em',
              boxShadow: '0 0 0 1px #1a0e04, 0 0 36px rgba(244,195,73,.7)',
            }}>
              <span style={{ fontSize: 18 }}>⚔</span>
              {userProfile ? 'JOGAR AGORA' : 'ENTRAR PARA JOGAR'}
            </button>
            <a href="#como" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '18px 28px', textDecoration: 'none',
              color: '#fff8e1', border: '1px solid rgba(244,195,73,.4)',
              fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 12, letterSpacing: '.3em',
            }}>
              <span style={{ color: '#f4c349' }}>▷</span>COMO SE JOGA
            </a>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4,auto)', gap: 36,
            paddingTop: 24, borderTop: '1px solid rgba(244,195,73,.2)',
          }}>
            {([
              ['12.4K', 'CAVALEIROS ATIVOS'],
              ['87',    'ELEMENTOS FORJADOS'],
              ['5',     'MODOS DE DUELO'],
              ['F2P',   'GRATUITO PARA JOGAR'],
            ] as [string, string][]).map(([v, k]) => (
              <div key={k}>
                <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 24, color: '#fff8e1' }}>{v}</div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.3em', color: 'rgba(244,195,73,.7)', marginTop: 2 }}>{k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT card */}
        <HeroCard />
      </div>
    </section>
  );
};

// ─── ExampleClash ────────────────────────────────────────────
const ExampleClash: React.FC<{ el: ElementData; attr: string; winner?: boolean }> = ({ el, attr, winner }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: winner ? 1 : 0.7 }}>
    <div style={{
      width: 36, height: 36,
      background: winner ? '#f4c349' : 'rgba(244,195,73,.2)',
      color: winner ? '#1a0e04' : '#f4c349',
      border: '1px solid #f4c349',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 16,
      boxShadow: winner ? '0 0 16px #f4c349' : 'none',
    }}>{el.symbol}</div>
    <div>
      <div style={{ fontSize: 9, letterSpacing: '.3em', color: 'rgba(244,195,73,.7)' }}>
        {ATTR[attr]?.label.toUpperCase()}
      </div>
      <div style={{ color: '#fff8e1', fontWeight: 700, fontSize: 14 }}>
        {fmt(el2num(el, attr))} {ATTR[attr]?.unit}
      </div>
    </div>
  </div>
);

// ─── HomeGameplay ────────────────────────────────────────────
const HomeGameplay: React.FC = () => {
  const steps = [
    { n: 'I',   icon: '◇', title: 'INVOQUE',   body: 'Escolha um Cavaleiro da sua mão. Cada um carrega os atributos reais do seu elemento — número atômico, massa, densidade, ponto de fusão.' },
    { n: 'II',  icon: '⚔', title: 'APOSTE',    body: 'Selecione o atributo onde seu Cavaleiro vence. O Ouro é denso e pesado. O Hidrogênio é leve e frio. Use a química a seu favor.' },
    { n: 'III', icon: '✦', title: 'ORÁCULO',   body: 'O atributo é revelado simultaneamente. O maior valor vence o round — exceto na fusão, onde o mais quente prevalece.' },
    { n: 'IV',  icon: '♛', title: 'CONQUISTE', body: 'Primeiro a vencer 5 rounds leva o duelo, sobe no ranking e desbloqueia novos elementos.' },
  ];

  return (
    <section id="como" style={{
      position: 'relative', padding: '120px 48px',
      borderTop: '1px solid rgba(244,195,73,.2)',
      borderBottom: '1px solid rgba(244,195,73,.2)',
      background: 'rgba(10,5,0,.4)',
    }}>
      <PeriodicTile opacity={0.04} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1300, margin: '0 auto' }}>
        <SectionLabel preLabel="· LEX LUDI ·" title="COMO SE JOGA" sub="Quatro passos. Cinco rounds. Um vencedor." />

        <div style={{ marginTop: 60, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {steps.map(s => (
            <article key={s.title} style={{
              position: 'relative', padding: '32px 26px 28px',
              background: 'linear-gradient(180deg, rgba(20,8,10,.85), rgba(10,5,0,.7))',
              border: '1px solid rgba(244,195,73,.35)',
              boxShadow: '0 0 30px rgba(244,195,73,.08)',
            }}>
              <div style={{
                position: 'absolute', top: -1, left: -1, right: -1, height: 6,
                background: 'linear-gradient(90deg, transparent, #f4c349, transparent)',
              }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{
                  fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 42,
                  color: 'rgba(244,195,73,.2)', letterSpacing: '.05em', lineHeight: 1,
                }}>{s.n}</div>
                <div style={{
                  width: 54, height: 54, borderRadius: '50%',
                  background: 'radial-gradient(circle,rgba(244,195,73,.2),transparent)',
                  border: '1.5px solid #f4c349',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, color: '#f4c349',
                  boxShadow: '0 0 16px rgba(244,195,73,.4)',
                }}>{s.icon}</div>
              </div>

              <h3 style={{
                fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 18, letterSpacing: '.18em',
                color: '#fff8e1', margin: '0 0 10px',
              }}>{s.title}</h3>

              <div style={{ width: 36, height: 1, background: '#f4c349', marginBottom: 14 }} />

              <p style={{ fontFamily: 'Spectral, serif', fontSize: 14, lineHeight: 1.55, color: 'rgba(255,236,196,.7)', margin: 0 }}>
                {s.body}
              </p>
            </article>
          ))}
        </div>

        {/* Example clash strip */}
        <div style={{
          marginTop: 60, padding: '24px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32,
          background: 'rgba(244,195,73,.05)', border: '1px solid rgba(244,195,73,.25)',
          fontFamily: 'IBM Plex Mono, monospace',
        }}>
          <span style={{ fontSize: 11, letterSpacing: '.35em', color: 'rgba(244,195,73,.7)' }}>EXEMPLO:</span>
          <ExampleClash el={ELEMENTS.Li} attr="density" />
          <span style={{ color: '#f4c349', fontSize: 18 }}>×</span>
          <ExampleClash el={ELEMENTS.Au} attr="density" winner />
          <span style={{
            padding: '4px 12px', background: '#f4c349', color: '#1a0e04',
            fontWeight: 700, fontSize: 11, letterSpacing: '.25em',
          }}>OURO VENCE +1 ROUND</span>
        </div>
      </div>
    </section>
  );
};

// ─── MiniCard ────────────────────────────────────────────────
const MiniCard: React.FC<{ el: ElementData; featured?: boolean; art?: string }> = ({ el, featured, art }) => {
  const rarityColor: Record<string, string> = { Common: '#9aa6c4', Rare: '#9bd5ff', Epic: '#c995ff', Legendary: '#f4c349' };
  const rc = rarityColor[el.rarity] ?? '#9aa6c4';

  return (
    <div style={{
      position: 'relative', aspectRatio: '2/3',
      transform: featured ? 'scale(1.05) translateY(-8px)' : 'none',
      transition: 'transform .2s', cursor: 'pointer',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #f5ecd4 0%, #e8dab8 30%, #f5ecd4 60%, #d8c89a 100%)',
        border: `2px solid ${featured ? '#f4c349' : '#c9a14a'}`,
        boxShadow: featured
          ? '0 0 0 1px #1a0e04, 0 0 0 4px #f4c349, 0 0 0 5px #1a0e04, 0 0 40px rgba(244,195,73,.6)'
          : '0 0 0 1px #1a0e04, 0 0 0 3px #c9a14a, 0 4px 16px rgba(0,0,0,.5)',
      }}>
        {/* Pediment */}
        <div style={{
          position: 'absolute', top: -1, left: -1, right: -1, height: 18,
          background: 'linear-gradient(180deg,#f4c349,#8a6a2a)',
          clipPath: 'polygon(0 100%, 50% 0, 100% 100%)', zIndex: 2,
        }} />

        <div style={{
          position: 'absolute', inset: '22px 8px 14px',
          border: '1px solid #c9a14a80',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '6px 6px 4px', textAlign: 'center',
            borderBottom: '1px solid #c9a14a40', background: 'rgba(138,107,42,.05)',
          }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 10, color: '#1a0e04', letterSpacing: '.05em' }}>
              CAVALEIRO DO {el.name.toUpperCase()}
            </div>
          </div>

          {/* Portrait */}
          <div style={{
            flex: 1, margin: '6px',
            background: `radial-gradient(circle at 50% 70%, hsl(${el.hue} 60% 30%) 0%, hsl(${el.hue} 50% 15%) 100%)`,
            border: '1px solid #1a0e04', overflow: 'hidden', position: 'relative',
          }}>
            {art ? (
              <img src={art} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: '50% 0%',
              }} />
            ) : (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 60, color: '#fff',
                textShadow: `0 0 16px ${rc}`,
              }}>{el.symbol}</div>
            )}
            <div style={{
              position: 'absolute', top: 4, left: 4,
              fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 9, letterSpacing: '.1em', color: '#f4c349',
              padding: '1px 5px', background: 'rgba(0,0,0,.6)',
            }}>Nº {el.atomic}</div>
            <div style={{
              position: 'absolute', bottom: 4, left: 4,
              width: 22, height: 22, background: '#f4c349', color: '#1a0e04',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 11,
            }}>{el.symbol}</div>
            <div style={{
              position: 'absolute', top: 4, right: 4,
              width: 8, height: 8, background: rc, borderRadius: '50%',
              boxShadow: `0 0 6px ${rc}`,
            }} />
          </div>

          {/* Mini stats */}
          <div style={{
            padding: '4px 8px', display: 'flex', justifyContent: 'space-between',
            fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#1a0e04',
          }}>
            <span>{fmt(el.mass)}u</span>
            <span>{fmt(el.density)}g/cm³</span>
          </div>
        </div>
      </div>

      {featured && (
        <div style={{
          position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)',
          padding: '4px 10px', background: '#f4c349', color: '#1a0e04',
          fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 9, letterSpacing: '.3em',
          boxShadow: '0 0 14px rgba(244,195,73,.6)', whiteSpace: 'nowrap',
        }}>EM DESTAQUE</div>
      )}
    </div>
  );
};

// ─── HomeRoster ──────────────────────────────────────────────
const HomeRoster: React.FC = () => {
  const cards: (ElementData & { featured?: boolean; art?: string })[] = [
    { ...ELEMENTS.Li, featured: true, art: 'assets/cavaleiro-litio.png' },
    ELEMENTS.Au,
    ELEMENTS.Hg,
    ELEMENTS.Fe,
    ELEMENTS.H,
    ELEMENTS.Na,
  ];

  return (
    <section style={{ position: 'relative', padding: '120px 48px' }}>
      <FloatingFormulasBG count={4} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1400, margin: '0 auto' }}>
        <SectionLabel
          preLabel="· LEGIO ·"
          title="87 CAVALEIROS FORJADOS NAS ESTRELAS"
          sub="Cada elemento da tabela é um cavaleiro. Cada cavaleiro carrega a verdade física do seu elemento."
        />

        <div style={{ marginTop: 60, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14 }}>
          {cards.map(c => (
            <MiniCard key={c.symbol} el={c} featured={c.featured} art={c.art} />
          ))}
        </div>

        {/* Rarity strip */}
        <div style={{
          marginTop: 50, padding: '24px 32px',
          background: 'rgba(10,5,0,.6)', border: '1px solid rgba(244,195,73,.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        }}>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.35em', color: 'rgba(244,195,73,.7)' }}>
              RARIDADES
            </div>
            <div style={{ display: 'flex', gap: 18, marginTop: 10 }}>
              {([
                ['Common',   '#9aa6c4', '46 cartas'],
                ['Rare',     '#9bd5ff', '24 cartas'],
                ['Epic',     '#c995ff', '12 cartas'],
                ['Legendary','#f4c349', '5 cartas' ],
              ] as [string, string, string][]).map(([r, c, n]) => (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, background: c, borderRadius: '50%', boxShadow: `0 0 8px ${c}` }} />
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: '#fff8e1' }}>{r}</div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.6)' }}>{n}</div>
                </div>
              ))}
            </div>
          </div>
          <button style={{
            padding: '12px 24px', cursor: 'pointer',
            border: '1px solid #f4c349', color: '#f4c349', background: 'none',
            fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 11, letterSpacing: '.3em',
          }}>VER COLEÇÃO COMPLETA →</button>
        </div>
      </div>
    </section>
  );
};

// ─── HomeModes ───────────────────────────────────────────────
const HomeModes: React.FC = () => {
  const modes = [
    {
      tag: 'I',   name: 'DUELO SAGRADO',      sub: 'Casual · 1v1',
      desc: 'Treine sua arte sem custo de ranking. Ideal pra testar novos decks e estudar elementos exóticos.',
      stats: [['DURAÇÃO','5–8 min'],['ENTRADA','Livre']] as [string,string][],
      color: '#f4c349', featured: false,
    },
    {
      tag: 'II',  name: 'ARENA DO OLIMPO',    sub: 'Ranqueada · 1v1',
      desc: 'Suba do Bronze ao Argento, do Argento ao Dourado, do Dourado ao Cosmo. Temporadas mensais.',
      stats: [['DURAÇÃO','8–12 min'],['RECOMP.','Pó cósmico']] as [string,string][],
      color: '#9bd5ff', featured: true,
    },
    {
      tag: 'III', name: 'TORNEIO DAS ESTRELAS', sub: 'Evento · Bracket',
      desc: 'Brackets de 16 ou 32 jogadores. Cartas exclusivas como prêmio. Acontece toda sexta-feira.',
      stats: [['DURAÇÃO','45 min'],['VAGAS','32 / sexta']] as [string,string][],
      color: '#c995ff', featured: false,
    },
  ];

  return (
    <section style={{
      position: 'relative', padding: '120px 48px',
      background: 'linear-gradient(180deg, transparent, rgba(20,8,10,.5), transparent)',
      borderTop: '1px solid rgba(244,195,73,.15)',
    }}>
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1300, margin: '0 auto' }}>
        <SectionLabel preLabel="· LUDI ·" title="MODOS DE COMBATE" sub="Da prática ao topo do ranking. Escolha sua arena." />

        <div style={{ marginTop: 60, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
          {modes.map(m => (
            <article key={m.name} style={{
              position: 'relative', padding: '40px 30px 32px',
              background: m.featured
                ? 'linear-gradient(180deg, rgba(244,195,73,.12), rgba(20,8,10,.8))'
                : 'linear-gradient(180deg, rgba(20,8,10,.7), rgba(10,5,0,.5))',
              border: m.featured ? '2px solid #f4c349' : '1px solid rgba(244,195,73,.3)',
              boxShadow: m.featured ? '0 0 50px rgba(244,195,73,.15), inset 0 0 30px rgba(244,195,73,.05)' : 'none',
            }}>
              {m.featured && (
                <div style={{
                  position: 'absolute', top: -14, left: 30,
                  padding: '5px 12px', background: '#f4c349', color: '#1a0e04',
                  fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 9, letterSpacing: '.3em',
                }}>· POPULAR ·</div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{
                  width: 56, height: 56,
                  background: `linear-gradient(135deg, ${m.color}, rgba(0,0,0,.4))`,
                  border: `2px solid ${m.color}`,
                  clipPath: 'polygon(20% 0,80% 0,100% 50%,80% 100%,20% 100%,0 50%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 18, color: '#1a0e04',
                  boxShadow: `0 0 16px ${m.color}80`,
                }}>{m.tag}</div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.35em', color: 'rgba(244,195,73,.6)' }}>
                  {m.sub}
                </div>
              </div>

              <h3 style={{
                fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 22, letterSpacing: '.1em',
                color: '#fff8e1', margin: '0 0 12px', lineHeight: 1.1,
              }}>{m.name}</h3>

              <p style={{ fontFamily: 'Spectral, serif', fontSize: 14, lineHeight: 1.6, color: 'rgba(255,236,196,.7)', margin: '0 0 22px' }}>
                {m.desc}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 18, borderTop: '1px solid rgba(244,195,73,.2)' }}>
                {m.stats.map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.3em', color: 'rgba(244,195,73,.6)' }}>{k}</div>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 13, color: '#fff8e1', marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── HomeCTA ─────────────────────────────────────────────────
interface CTAProps {
  userProfile: UserProfile | null;
  onStartGame: () => void;
}

const HomeCTA: React.FC<CTAProps> = ({ userProfile, onStartGame }) => (
  <section id="cta" style={{
    position: 'relative', padding: '140px 48px', overflow: 'hidden',
    borderTop: '1px solid rgba(244,195,73,.2)',
    background: 'radial-gradient(ellipse at center, rgba(244,195,73,.15) 0%, rgba(10,5,0,.6) 60%, transparent 100%)',
  }}>
    {/* Big sun-burst */}
    <div style={{
      position: 'absolute', inset: '-10% -20%',
      background: `
        radial-gradient(circle at center, rgba(244,195,73,.25) 0%, transparent 50%),
        conic-gradient(from 0deg,
          rgba(244,195,73,.18) 0deg, transparent 10deg, rgba(244,195,73,.18) 20deg, transparent 30deg,
          rgba(244,195,73,.18) 40deg, transparent 50deg, rgba(244,195,73,.18) 60deg, transparent 70deg,
          rgba(244,195,73,.18) 80deg, transparent 90deg, rgba(244,195,73,.18) 100deg, transparent 110deg,
          rgba(244,195,73,.18) 120deg, transparent 130deg, rgba(244,195,73,.18) 140deg, transparent 150deg,
          rgba(244,195,73,.18) 160deg, transparent 170deg, rgba(244,195,73,.18) 180deg, transparent 190deg,
          rgba(244,195,73,.18) 200deg, transparent 210deg, rgba(244,195,73,.18) 220deg, transparent 230deg,
          rgba(244,195,73,.18) 240deg, transparent 250deg, rgba(244,195,73,.18) 260deg, transparent 270deg,
          rgba(244,195,73,.18) 280deg, transparent 290deg, rgba(244,195,73,.18) 300deg, transparent 310deg,
          rgba(244,195,73,.18) 320deg, transparent 330deg, rgba(244,195,73,.18) 340deg, transparent 350deg)
      `,
      opacity: 0.7, pointerEvents: 'none',
    }} />

    <PeriodicTile opacity={0.04} />

    <div style={{ position: 'relative', zIndex: 2, maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '.5em', color: '#f4c349', marginBottom: 18 }}>
        · FORJE SUA LENDA ·
      </div>

      <h2 style={{
        fontFamily: 'Cinzel, serif', fontWeight: 900,
        fontSize: 'clamp(40px, 5vw, 68px)',
        lineHeight: 1.05, letterSpacing: '.04em',
        color: '#fff8e1', margin: '0 0 22px',
        textShadow: '0 0 40px rgba(244,195,73,.4)',
      }}>
        CONQUISTE O COSMOS.<br />
        <span style={{ color: '#f4c349' }}>UM ELEMENTO POR VEZ.</span>
      </h2>

      <p style={{
        fontFamily: 'Spectral, serif', fontSize: 18, lineHeight: 1.55,
        color: 'rgba(255,236,196,.78)', maxWidth: 620, margin: '0 auto 40px',
      }}>
        Gratuito para jogar, sem download. Crie sua conta em segundos e invoque seu primeiro
        cavaleiro ainda hoje.
      </p>

      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={userProfile ? onStartGame : triggerGoogleSignIn}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '20px 42px', cursor: 'pointer',
            background: 'linear-gradient(180deg,#f4c349,#8a6a2a)', color: '#1a0e04',
            border: '2px solid #f4c349',
            fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 14, letterSpacing: '.35em',
            boxShadow: '0 0 0 1px #1a0e04, 0 0 50px rgba(244,195,73,.8)',
          }}>
          <span style={{ fontSize: 20 }}>⚔</span>
          {userProfile ? 'JOGAR AGORA' : 'CRIAR CONTA E JOGAR'}
        </button>
        {userProfile && (
          <div style={{
            padding: '20px 30px', color: '#f4c349',
            border: '1px solid rgba(244,195,73,.4)',
            fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 12, letterSpacing: '.3em',
          }}>
            {userProfile.name.toUpperCase()}
          </div>
        )}
      </div>

      <div style={{
        marginTop: 36, display: 'flex', gap: 24, justifyContent: 'center',
        fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.3em', color: 'rgba(244,195,73,.5)',
      }}>
        <span>✓ SEM DOWNLOAD</span>
        <span>✓ ROUND EM 90s</span>
        <span>✓ MULTIPLATAFORMA</span>
      </div>
    </div>
  </section>
);

// ─── HomeFooter ──────────────────────────────────────────────
export const HomeFooter: React.FC = () => (
  <footer style={{
    position: 'relative', padding: '60px 48px 40px',
    borderTop: '2px solid #f4c349',
    background: 'rgba(6,3,2,.95)',
  }}>
    <div style={{
      maxWidth: 1300, margin: '0 auto',
      display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40,
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg,#f4c349,#6a4f1e)', border: '1px solid #f4c349',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#1a0e04', fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 16,
          }}>Ω</div>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 14, letterSpacing: '.15em', color: '#fff8e1' }}>
              CAVALEIROS
            </div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '.4em', color: '#f4c349' }}>
              · DOS ELEMENTOS ·
            </div>
          </div>
        </div>
        <p style={{ fontFamily: 'Spectral, serif', fontSize: 13, color: 'rgba(255,236,196,.6)', margin: 0, maxWidth: 340, lineHeight: 1.55 }}>
          Onde a tabela periódica vira campo de batalha. Um jogo de cartas que ensina
          química enquanto você conquista o cosmos.
        </p>
      </div>

      {([
        ['JOGO',       ['Jogar agora','Coleção','Ranking','Modos','Notas de versão']],
        ['APRENDA',    ['Como se joga','Glossário químico','Tabela periódica','FAQ']],
        ['COMUNIDADE', ['Discord','Reddit','Twitter','Suporte']],
      ] as [string, string[]][]).map(([t, items]) => (
        <div key={t}>
          <div style={{
            fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 11, letterSpacing: '.35em', color: '#f4c349',
            marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(244,195,73,.2)',
          }}>{t}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map(item => (
              <a key={item} href="#" style={{ fontFamily: 'Spectral, serif', fontSize: 13, color: 'rgba(255,236,196,.65)', textDecoration: 'none' }}>
                {item}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div style={{
      marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(244,195,73,.15)',
      maxWidth: 1300, margin: '40px auto 0',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.4)',
    }}>
      <span>© MMXXVI · CAVALEIROS DOS ELEMENTOS</span>
      <span style={{ letterSpacing: '.2em' }}>· FORJADO COM Au, Fe E H₂O ·</span>
    </div>
  </footer>
);

// ─── HomeMenu (root export) ──────────────────────────────────
export interface HomeMenuProps {
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isClientIdConfigured: boolean;
  onStartGame: () => void;
  onGoToRanking: () => void;
  onGoToAdmin: () => void;
  onGoToRules?: () => void;
}

const HomeMenu: React.FC<HomeMenuProps> = ({
  userProfile, isAdmin, onStartGame, onGoToRanking, onGoToAdmin, onGoToRules,
}) => (
  <div style={{
    position: 'relative', minHeight: '100vh',
    background: 'linear-gradient(180deg, #06030a 0%, #0a0500 30%, #06030a 100%)',
    color: '#fff8e1', fontFamily: 'Spectral, serif',
  }}>
    <CosmicBG />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <HomeHeader
        userProfile={userProfile}
        isAdmin={isAdmin}
        onStartGame={onStartGame}
        onGoToRanking={onGoToRanking}
        onGoToAdmin={onGoToAdmin}
        onGoToRules={onGoToRules}
      />
      <HomeHero userProfile={userProfile} onStartGame={onStartGame} />
      <HomeGameplay />
      <HomeRoster />
      <HomeModes />
      <HomeCTA userProfile={userProfile} onStartGame={onStartGame} />
      <HomeFooter />
    </div>
  </div>
);

export default HomeMenu;
