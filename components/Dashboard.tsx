import React from 'react';
import { UserProfile, Difficulty } from '../types';
import { ELEMENTS } from '../shared';
import { CosmicBG, PeriodicTile, HomeFooter } from './HomeMenu';
import { useIsMobile } from '../utils/mobile';

export interface DashboardProps {
  userProfile: UserProfile;
  isAdmin: boolean;
  difficulty: Difficulty;
  onStartGame: () => void;
  onStartMultiplayer: () => void;
  onSetDifficulty: (d: Difficulty) => void;
  onGoToRanking: () => void;
  onGoToAdmin: () => void;
  onGoToCollection: () => void;
  onGoToRules: () => void;
  onLogout: () => void;
}

// ─── Style tokens ───────────────────────────────────────────
const panelBtnGhost: React.CSSProperties = {
  padding: '10px 18px', background: 'transparent',
  border: '1px solid rgba(244,195,73,.35)', color: '#fff8e1',
  fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 10, letterSpacing: '.3em', cursor: 'pointer',
};
const panelBtnPrimary: React.CSSProperties = {
  padding: '10px 18px',
  background: 'linear-gradient(180deg,#f4c349,#8a6a2a)', color: '#1a0e04',
  border: '1px solid #f4c349',
  fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 10, letterSpacing: '.3em', cursor: 'pointer',
  boxShadow: '0 0 14px rgba(244,195,73,.4)',
};

// ─── Currency chip ───────────────────────────────────────────
const Currency: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px',
    border: '1px solid rgba(244,195,73,.3)', background: 'rgba(244,195,73,.05)',
  }}>
    <span style={{ color: '#f4c349', fontSize: 14 }}>{icon}</span>
    <div>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '.3em', color: 'rgba(244,195,73,.6)', lineHeight: 1 }}>{label}</div>
      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, fontSize: 13, color: '#fff8e1', marginTop: 2 }}>{value}</div>
    </div>
  </div>
);

// ─── Header ─────────────────────────────────────────────────
export interface LoggedHeaderProps {
  userProfile: UserProfile;
  onStartGame: () => void;
  onGoToRanking: () => void;
  onGoToCollection?: () => void;
  onGoToRules?: () => void;
  onLogout?: () => void;
}
export const LoggedHeader: React.FC<LoggedHeaderProps> = ({ userProfile, onStartGame, onGoToRanking, onGoToCollection, onGoToRules, onLogout }) => {
  const isMobile = useIsMobile();
  const initials = userProfile.name.slice(0, 2).toUpperCase();
  const displayName = userProfile.name.toUpperCase();
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      display: 'grid', gridTemplateColumns: isMobile ? 'auto 1fr' : 'auto 1fr auto', alignItems: 'center', gap: isMobile ? 12 : 24,
      padding: isMobile ? '12px 16px' : '14px 36px',
      background: 'rgba(10,5,0,.9)',
      borderBottom: '2px solid #f4c349',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%',
          background: 'linear-gradient(135deg,#f4c349,#6a4f1e)',
          border: '2px solid #f4c349',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', boxShadow: '0 0 0 1px #1a0e04, 0 0 20px rgba(244,195,73,.5)',
        }}>
          <div style={{ position: 'absolute', inset: 5, border: '1px solid #f4c349', borderRadius: '50%' }} />
          <div style={{ color: '#f4c349', fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 16 }}>Ω</div>
        </div>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 15, letterSpacing: '.18em', color: '#fff8e1' }}>
            CAVALEIROS
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '.4em', color: '#f4c349' }}>
            · DOS ELEMENTOS ·
          </div>
        </div>
      </div>

      {!isMobile && <nav style={{ display: 'flex', justifyContent: 'center', gap: 28 }}>
        {([
          ['◇', 'JOGAR',   true,  onStartGame],
          ['◈', 'COLEÇÃO', false, onGoToCollection],
          ['♛', 'RANKING', false, onGoToRanking],
          ['?', 'REGRAS',  false, onGoToRules],
          ['✦', 'CONFIG',  false, undefined],
        ] as [string, string, boolean, (() => void) | undefined][]).map(([g, n, active, action]) => (
          <a key={n} href="#" onClick={(e) => { e.preventDefault(); action?.(); }} style={{
            display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
            fontFamily: 'Cinzel, serif', fontWeight: active ? 700 : 400, fontSize: 10, letterSpacing: '.3em',
            color: active ? '#fff8e1' : 'rgba(255,236,196,.6)',
            borderBottom: active ? '1px solid #f4c349' : 'none', paddingBottom: 3,
          }}>
            <span style={{ color: '#f4c349' }}>{g}</span>{n}
          </a>
        ))}
      </nav>}

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14, justifyContent: 'flex-end' }}>
        {!isMobile && <Currency icon="✦" label="COSMO" value="1,240" />}
        {!isMobile && <Currency icon="◆" label="PÓ" value="385" />}
        <div style={{ position: 'relative' }}>
          <button style={{
            width: 38, height: 38, border: '1px solid rgba(244,195,73,.4)',
            background: 'transparent', color: '#f4c349', cursor: 'pointer',
            fontSize: 16,
          }}>♪</button>
          <div style={{
            position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%',
            background: '#d94a4a', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 10,
            border: '1px solid #1a0e04',
          }}>3</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px 4px 4px',
          border: '1px solid rgba(244,195,73,.3)', background: 'rgba(244,195,73,.05)',
        }}>
          {userProfile.picture ? (
            <img src={userProfile.picture} alt="" style={{
              width: 34, height: 34, borderRadius: '50%',
              border: '2px solid #1a0e04',
            }} />
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,#f4c349,#6a4f1e)', color: '#1a0e04',
              fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 2px #1a0e04',
            }}>{initials}</div>
          )}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 11, letterSpacing: '.15em', color: '#fff8e1' }}>
              {displayName}
            </div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '.3em', color: 'rgba(244,195,73,.7)' }}>
              BRONZE III · LV 4
            </div>
          </div>
        </div>
        {onLogout && (
          <button onClick={onLogout} style={{
            padding: '8px 14px', background: 'transparent',
            border: '1px solid rgba(217,74,74,.4)', color: 'rgba(217,74,74,.8)',
            fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 9, letterSpacing: '.3em',
            cursor: 'pointer',
          }}>SAIR</button>
        )}
      </div>
    </header>
  );
};

// ─── Continue banner ─────────────────────────────────────────
interface ContinueBannerProps { userName: string; onStartGame: () => void; }
const ContinueBanner: React.FC<ContinueBannerProps> = ({ userName, onStartGame }) => {
  const isMobile = useIsMobile();
  return (
  <div style={{
    background: 'linear-gradient(90deg, rgba(244,195,73,.18), rgba(244,195,73,.05) 40%, transparent)',
    borderBottom: '1px solid rgba(244,195,73,.3)',
    padding: isMobile ? '10px 16px' : '12px 36px',
    display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 12,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: 'rgba(244,195,73,.15)', border: '1px solid #f4c349',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#f4c349', fontSize: 14,
        boxShadow: '0 0 14px rgba(244,195,73,.4)',
      }}>⚔</div>
      <div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.4em', color: 'rgba(244,195,73,.8)' }}>
          · PARTIDA EM ANDAMENTO ·
        </div>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 13, letterSpacing: '.1em', color: '#fff8e1', marginTop: 2 }}>
          {userName} <span style={{ color: '#f4c349' }}>vs</span> SELENE · Round II/V · Aguardando sua jogada
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.7)' }}>02:14 RESTANTES</div>
      <a href="#" onClick={(e) => { e.preventDefault(); onStartGame(); }} style={{
        padding: '10px 22px', textDecoration: 'none',
        background: 'linear-gradient(180deg,#f4c349,#8a6a2a)', color: '#1a0e04',
        border: '1px solid #f4c349',
        fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 10, letterSpacing: '.32em',
        boxShadow: '0 0 16px rgba(244,195,73,.5)',
      }}>RETORNAR AO DUELO →</a>
    </div>
  </div>
  );
};

// ─── Greeting hero ───────────────────────────────────────────
interface GreetingHeroProps { userName: string; }
const GreetingHero: React.FC<GreetingHeroProps> = ({ userName }) => {
  const isMobile = useIsMobile();
  return (
  <section style={{
    position: 'relative',
    padding: isMobile ? '20px 16px' : '40px 36px', marginTop: 24,
    background: 'linear-gradient(135deg, rgba(20,8,10,.8), rgba(10,5,0,.6))',
    border: '1px solid rgba(244,195,73,.3)',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', top: '50%', right: -200, transform: 'translateY(-50%)',
      width: 600, height: 600,
      background: `
        radial-gradient(circle at center, rgba(244,195,73,.2) 0%, transparent 60%),
        conic-gradient(from 0deg, rgba(244,195,73,.12) 0deg, transparent 10deg, rgba(244,195,73,.12) 20deg, transparent 30deg, rgba(244,195,73,.12) 40deg, transparent 50deg, rgba(244,195,73,.12) 60deg, transparent 70deg, rgba(244,195,73,.12) 80deg, transparent 90deg, rgba(244,195,73,.12) 100deg, transparent 110deg, rgba(244,195,73,.12) 120deg, transparent 130deg, rgba(244,195,73,.12) 140deg, transparent 150deg, rgba(244,195,73,.12) 160deg, transparent 170deg, rgba(244,195,73,.12) 180deg, transparent 190deg, rgba(244,195,73,.12) 200deg, transparent 210deg, rgba(244,195,73,.12) 220deg, transparent 230deg, rgba(244,195,73,.12) 240deg, transparent 250deg, rgba(244,195,73,.12) 260deg, transparent 270deg, rgba(244,195,73,.12) 280deg, transparent 290deg, rgba(244,195,73,.12) 300deg, transparent 310deg, rgba(244,195,73,.12) 320deg, transparent 330deg, rgba(244,195,73,.12) 340deg, transparent 350deg)
      `,
      opacity: .6, pointerEvents: 'none',
    }} />
    <PeriodicTile opacity={0.04} />
    <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto', gap: 30, alignItems: 'center' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <span style={{ width: 32, height: 1, background: '#f4c349', display: 'block' }} />
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.5em', color: '#f4c349' }}>
            · AVE, CAVALEIRO ·
          </span>
        </div>
        <h1 style={{
          fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 42, letterSpacing: '.04em',
          color: '#fff8e1', margin: '0 0 8px', lineHeight: 1,
          textShadow: '0 0 20px rgba(244,195,73,.3)',
        }}>BEM-VINDO DE VOLTA,<br /><span style={{ color: '#f4c349' }}>{userName}</span></h1>
        <p style={{
          fontFamily: 'Spectral, serif', fontSize: 15, lineHeight: 1.5,
          color: 'rgba(255,236,196,.75)', maxWidth: 620, margin: '10px 0 0',
        }}>
          O cosmo despertou. <strong style={{ color: '#f4c349' }}>3 desafios diários</strong> esperam
          sua mão, sua liga acaba em <strong style={{ color: '#f4c349' }}>14 dias</strong>, e
          <strong style={{ color: '#f4c349' }}> Selene</strong> te aguarda na arena.
        </p>
      </div>
      <div style={{
        padding: '18px 26px', textAlign: 'center',
        background: 'rgba(10,5,0,.7)', border: '1px solid rgba(244,195,73,.4)',
        boxShadow: 'inset 0 0 30px rgba(244,195,73,.08)',
      }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.4em', color: 'rgba(244,195,73,.7)' }}>TEMPORADA</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 22, letterSpacing: '.1em', color: '#fff8e1', marginTop: 4 }}>
          ATHENA · II
        </div>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.6)', marginTop: 4 }}>
          14d 06h restantes
        </div>
        <div style={{ marginTop: 10, height: 4, background: 'rgba(244,195,73,.15)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, width: '62%', background: '#f4c349', boxShadow: '0 0 10px #f4c349' }} />
        </div>
      </div>
    </div>
  </section>
  );
};

// ─── Difficulty selector ─────────────────────────────────────
interface DifficultySelectorProps { difficulty: Difficulty; onSetDifficulty: (d: Difficulty) => void; }
const DifficultySelector: React.FC<DifficultySelectorProps> = ({ difficulty, onSetDifficulty }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 16, padding: '10px 14px',
    background: 'rgba(244,195,73,.04)', border: '1px solid rgba(244,195,73,.18)',
    marginBottom: 16,
  }}>
    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.4em', color: 'rgba(244,195,73,.65)', whiteSpace: 'nowrap' }}>
      · DIFICULDADE ·
    </span>
    <div style={{ display: 'flex', gap: 4 }}>
      {([Difficulty.Easy, Difficulty.Normal, Difficulty.Hard] as const).map(d => (
        <button key={d} onClick={() => onSetDifficulty(d)} style={{
          padding: '5px 12px', cursor: 'pointer',
          fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 9, letterSpacing: '.22em',
          background: difficulty === d ? 'linear-gradient(180deg,#f4c349,#8a6a2a)' : 'transparent',
          color: difficulty === d ? '#1a0e04' : 'rgba(244,195,73,.55)',
          border: difficulty === d ? '1px solid #f4c349' : '1px solid rgba(244,195,73,.2)',
          boxShadow: difficulty === d ? '0 0 8px rgba(244,195,73,.3)' : 'none',
        }}>{d.toUpperCase()}</button>
      ))}
    </div>
    <span style={{ fontFamily: 'Spectral, serif', fontSize: 12, color: 'rgba(255,236,196,.5)', marginLeft: 4 }}>
      {difficulty === Difficulty.Easy && 'IA escolhe atributo aleatório'}
      {difficulty === Difficulty.Normal && 'IA escolhe maior atributo bruto'}
      {difficulty === Difficulty.Hard && 'IA considera vantagem elemental'}
    </span>
  </div>
);

// ─── Quick actions ───────────────────────────────────────────
interface QuickActionsProps { onStartGame: () => void; onStartMultiplayer: () => void; onGoToCollection: () => void; difficulty: Difficulty; onSetDifficulty: (d: Difficulty) => void; }
const QuickActions: React.FC<QuickActionsProps> = ({ onStartGame, onStartMultiplayer, onGoToCollection, difficulty, onSetDifficulty }) => {
  const isMobile = useIsMobile();
  const items = [
    { tag: 'I',   name: 'BATALHA vs IA',    sub: 'Solo · vs Oráculo',          icon: '⚔', primary: true,  meta: 'Jogue contra a IA',                 action: onStartGame },
    { tag: 'II',  name: 'TREINO LOCAL',     sub: '2 Jogadores · mesma tela',   icon: '◇', primary: false, meta: 'Multiplayer local sem ranking',      action: onStartMultiplayer },
    { tag: 'III', name: 'TORNEIO DE SEXTA', sub: 'Bracket · 32 vagas',         icon: '♛', primary: false, meta: 'Abre em 02d 14h', locked: true,       action: undefined },
    { tag: 'IV',  name: 'EXPLORAR COLEÇÃO', sub: '18 / 87 cavaleiros',         icon: '◈', primary: false, meta: '2 pacotes não abertos',              action: onGoToCollection },
  ];
  return (
    <section style={{ marginTop: 24 }}>
      <DifficultySelector difficulty={difficulty} onSetDifficulty={onSetDifficulty} />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : '1.4fr 1fr 1fr 1fr', gap: 18 }}>
      {items.map(a => (
        <a key={a.name} href="#" onClick={(e) => { e.preventDefault(); if (!a.locked) a.action?.(); }} style={{
          position: 'relative', padding: '24px 22px', textDecoration: 'none',
          background: a.primary
            ? 'linear-gradient(160deg, rgba(244,195,73,.95), rgba(138,107,42,.85))'
            : 'linear-gradient(180deg, rgba(20,8,10,.85), rgba(10,5,0,.7))',
          border: a.primary ? '2px solid #f4c349' : '1px solid rgba(244,195,73,.3)',
          color: a.primary ? '#1a0e04' : '#fff8e1',
          boxShadow: a.primary ? '0 0 0 1px #1a0e04, 0 0 40px rgba(244,195,73,.5)' : 'none',
          opacity: a.locked ? .55 : 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{
              width: 44, height: 44,
              background: a.primary ? 'rgba(26,14,4,.2)' : 'rgba(244,195,73,.12)',
              border: a.primary ? '1.5px solid #1a0e04' : '1.5px solid #f4c349',
              clipPath: 'polygon(20% 0,80% 0,100% 50%,80% 100%,20% 100%,0 50%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: a.primary ? '#1a0e04' : '#f4c349',
            }}>{a.icon}</div>
            <span style={{
              fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 24,
              color: a.primary ? 'rgba(26,14,4,.35)' : 'rgba(244,195,73,.25)',
              letterSpacing: '.05em',
            }}>{a.tag}</span>
          </div>
          <h3 style={{
            fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: a.primary ? 17 : 15, letterSpacing: '.18em',
            margin: '0 0 6px', lineHeight: 1.15,
          }}>{a.name}</h3>
          <div style={{
            fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.3em',
            color: a.primary ? 'rgba(26,14,4,.7)' : 'rgba(244,195,73,.7)', marginBottom: 14,
          }}>{a.sub}</div>
          <div style={{
            paddingTop: 12, borderTop: `1px solid ${a.primary ? 'rgba(26,14,4,.25)' : 'rgba(244,195,73,.2)'}`,
            fontFamily: 'IBM Plex Mono, monospace', fontSize: 11,
            color: a.primary ? 'rgba(26,14,4,.7)' : 'rgba(255,236,196,.55)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>{a.locked ? '🔒 ' : ''}{a.meta}</span>
            <span style={{ fontSize: 14 }}>→</span>
          </div>
        </a>
      ))}
      </div>
    </section>
  );
};

// ─── Panel primitives ────────────────────────────────────────
interface PanelHeaderProps {
  preLabel: string;
  title: string;
  sub?: string;
  right?: React.ReactNode;
}
const PanelHeader: React.FC<PanelHeaderProps> = ({ preLabel, title, sub, right }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 14 }}>
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.45em', color: '#f4c349',
      }}>
        <span style={{ width: 24, height: 1, background: '#f4c349', display: 'block' }} />
        {preLabel}
      </div>
      <h2 style={{
        fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 22, letterSpacing: '.1em',
        color: '#fff8e1', margin: '8px 0 4px', lineHeight: 1,
      }}>{title}</h2>
      {sub && <div style={{ fontFamily: 'Spectral, serif', fontSize: 13, color: 'rgba(255,236,196,.6)' }}>{sub}</div>}
    </div>
    {right}
  </div>
);

interface PanelProps {
  preLabel: string;
  title: string;
  sub?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}
const Panel: React.FC<PanelProps> = ({ preLabel, title, sub, right, children }) => (
  <section>
    <PanelHeader preLabel={preLabel} title={title} sub={sub} right={right} />
    <div style={{
      padding: '20px 22px',
      background: 'linear-gradient(180deg, rgba(20,8,10,.65), rgba(10,5,0,.45))',
      border: '1px solid rgba(244,195,73,.25)',
    }}>{children}</div>
  </section>
);

// ─── Daily quests ────────────────────────────────────────────
const DailyQuests: React.FC = () => {
  const quests = [
    { icon: '⚔', name: 'Vença 3 duelos ranqueados',    prog: 2, total: 3, rwd: '+120 Cosmo', done: false },
    { icon: '◇', name: 'Jogue um Cavaleiro do grupo 1', prog: 1, total: 1, rwd: '+45 Pó',      done: true  },
    { icon: '✦', name: 'Aposte em Densidade 5×',        prog: 3, total: 5, rwd: '+90 Cosmo',   done: false },
    { icon: '♛', name: 'Vença com cavaleiro Legendary', prog: 0, total: 1, rwd: '+1 Pacote',   done: false },
  ];
  return (
    <Panel preLabel="· MISSIONES DIARIAE ·" title="DESAFIOS DO DIA" sub="Renovam em 06h 24min · 3 de 4 reivindicáveis">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {quests.map((q, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: 14,
            padding: '12px 16px',
            background: q.done ? 'rgba(244,195,73,.1)' : 'rgba(244,195,73,.04)',
            border: `1px solid ${q.done ? 'rgba(244,195,73,.45)' : 'rgba(244,195,73,.15)'}`,
          }}>
            <div style={{
              width: 36, height: 36,
              background: q.done ? '#f4c349' : 'rgba(244,195,73,.1)',
              border: `1px solid ${q.done ? '#f4c349' : 'rgba(244,195,73,.4)'}`,
              clipPath: 'polygon(50% 0,100% 30%,80% 100%,20% 100%,0 30%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: q.done ? '#1a0e04' : '#f4c349',
            }}>{q.done ? '✓' : q.icon}</div>
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 13, letterSpacing: '.08em', color: '#fff8e1' }}>
                {q.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <div style={{ height: 3, flex: 1, background: 'rgba(244,195,73,.15)', position: 'relative', maxWidth: 200 }}>
                  <div style={{
                    position: 'absolute', inset: 0, width: `${(q.prog / q.total) * 100}%`,
                    background: q.done ? '#f4c349' : 'rgba(244,195,73,.7)',
                    boxShadow: q.done ? '0 0 8px #f4c349' : 'none',
                  }} />
                </div>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'rgba(244,195,73,.7)' }}>
                  {q.prog} / {q.total}
                </span>
              </div>
            </div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.18em', color: '#f4c349', fontWeight: 700 }}>
              {q.rwd}
            </div>
            <button style={{
              padding: '8px 16px',
              background: q.done ? 'linear-gradient(180deg,#f4c349,#8a6a2a)' : 'transparent',
              color: q.done ? '#1a0e04' : 'rgba(244,195,73,.4)',
              border: q.done ? '1px solid #f4c349' : '1px solid rgba(244,195,73,.2)',
              fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 9, letterSpacing: '.3em',
              cursor: q.done ? 'pointer' : 'default',
              boxShadow: q.done ? '0 0 14px rgba(244,195,73,.4)' : 'none',
            }}>{q.done ? 'RECEBER' : 'EM PROGRESSO'}</button>
          </div>
        ))}
      </div>
    </Panel>
  );
};

// ─── Rank progress ───────────────────────────────────────────
interface RankProgressProps { onGoToRanking: () => void; }
const RankProgress: React.FC<RankProgressProps> = ({ onGoToRanking }) => (
  <Panel preLabel="· ORDO ·" title="SUA POSIÇÃO" sub="Liga atual e meta da temporada">
    <div style={{
      padding: '18px 20px',
      background: 'rgba(10,5,0,.6)', border: '1px solid rgba(244,195,73,.3)',
      display: 'flex', alignItems: 'center', gap: 18,
    }}>
      <div style={{
        width: 78, height: 78,
        background: 'linear-gradient(135deg,#c98449,#6a3f24)',
        border: '2px solid #d49a64',
        clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#1a0e04', fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 14,
        boxShadow: '0 0 0 1px #1a0e04, 0 0 24px rgba(212,154,100,.5)',
        flexShrink: 0, textAlign: 'center',
      }}>BRONZE<br />III</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 13, letterSpacing: '.15em', color: '#fff8e1' }}>
            BRONZE III
          </span>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.7)' }}>
            340 / 500 PE
          </span>
        </div>
        <div style={{ height: 8, background: 'rgba(244,195,73,.12)', border: '1px solid rgba(244,195,73,.2)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, width: '68%', background: 'linear-gradient(90deg,#c98449,#f4c349)', boxShadow: '0 0 12px rgba(244,195,73,.5)' }} />
        </div>
        <div style={{ marginTop: 6, fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.25em', color: 'rgba(244,195,73,.6)' }}>
          PRÓXIMA LIGA: <span style={{ color: '#f4c349' }}>BRONZE II</span> em 160 PE
        </div>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 14 }}>
      {[['VITÓRIAS', '9'], ['DERROTAS', '5'], ['STREAK', '3 W']].map(([k, v]) => (
        <div key={k} style={{ padding: '10px 12px', background: 'rgba(244,195,73,.05)', border: '1px solid rgba(244,195,73,.2)' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.3em', color: 'rgba(244,195,73,.7)' }}>{k}</div>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 18, color: '#fff8e1', marginTop: 2 }}>{v}</div>
        </div>
      ))}
    </div>
    <a href="#" onClick={(e) => { e.preventDefault(); onGoToRanking(); }} style={{
      display: 'block', marginTop: 14, padding: '12px', textAlign: 'center', textDecoration: 'none',
      border: '1px solid rgba(244,195,73,.35)', color: '#f4c349',
      fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 10, letterSpacing: '.3em',
    }}>VER RANKING GLOBAL →</a>
  </Panel>
);

// ─── Deck slot ───────────────────────────────────────────────
interface DeckSlotEl { symbol: string; name: string; atomic: number; hue: number; rarity: string; }
interface DeckSlotProps { el: (DeckSlotEl & { art?: string }) | null; }
const DeckSlot: React.FC<DeckSlotProps> = ({ el }) => {
  if (!el) {
    return (
      <div style={{
        width: 64, height: 90,
        border: '1px dashed rgba(244,195,73,.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(244,195,73,.4)', fontSize: 22,
      }}>+</div>
    );
  }
  const rarityColor: Record<string, string> = { Common: '#9aa6c4', Rare: '#9bd5ff', Epic: '#c995ff', Legendary: '#f4c349' };
  const rc = rarityColor[el.rarity] ?? '#9aa6c4';
  return (
    <div style={{
      width: 64, height: 90, position: 'relative',
      background: 'linear-gradient(180deg,#f5ecd4,#d8c89a)',
      border: `1.5px solid ${rc}`,
      boxShadow: `0 0 0 1px #1a0e04, 0 0 0 2px ${rc}, 0 4px 12px rgba(0,0,0,.4)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 4,
      overflow: 'hidden',
    }}>
      <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 9, color: '#8a6a2a', alignSelf: 'flex-start' }}>
        {el.atomic}
      </div>
      {el.art && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img src={el.art} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%', opacity: .85 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(245,236,212,.7))' }} />
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center', zIndex: 2 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 22, color: '#1a0e04', lineHeight: 1 }}>{el.symbol}</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 7, letterSpacing: '.15em', color: '#8a6a2a', fontWeight: 700, marginTop: 2 }}>
          {el.name.slice(0, 4).toUpperCase()}
        </div>
      </div>
    </div>
  );
};

// ─── Active deck ─────────────────────────────────────────────
const ActiveDeck: React.FC = () => {
  const isMobile = useIsMobile();
  const slots: (typeof ELEMENTS[string] & { art?: string } | null)[] = [
    { ...ELEMENTS.Li, art: 'assets/cavaleiro-litio.png' },
    ELEMENTS.H, ELEMENTS.Na, ELEMENTS.O, ELEMENTS.Fe, ELEMENTS.Hg,
    ELEMENTS.Au, null, null,
  ];
  return (
    <section style={{ marginTop: 30 }}>
      <PanelHeader preLabel="· ARSENAL ·" title="DECK ATIVO · AURUM TRINITAS"
        right={
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={panelBtnGhost}>↻ TROCAR DECK</button>
            <button style={panelBtnPrimary}>✎ EDITAR DECK</button>
          </div>
        }
      />
      <div style={{
        padding: '24px 26px',
        background: 'linear-gradient(180deg, rgba(20,8,10,.7), rgba(10,5,0,.5))',
        border: '1px solid rgba(244,195,73,.3)',
        display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center',
      }}>
        <div style={{ textAlign: 'center', padding: '14px 20px', background: 'rgba(244,195,73,.06)', border: '1px solid rgba(244,195,73,.3)' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.35em', color: 'rgba(244,195,73,.7)' }}>PODER</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 32, color: '#fff8e1' }}>842</div>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#f4c349' }}>+14 vs ontem</div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', overflowX: isMobile ? 'auto' : undefined }}>
          {slots.map((s, i) => <DeckSlot key={i} el={s} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 160 }}>
          {[
            ['CARTAS', '07 / 09'],
            ['RARIDADE MÉDIA', 'RARE'],
            ['ESPECIALIDADE', 'DENSIDADE'],
            ['WIN RATE', '64%'],
          ].map(([k, v], i) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.2em', color: 'rgba(244,195,73,.7)' }}>
              <span>{k}</span>
              <span style={{ color: i === 3 ? '#a8e6c4' : i === 2 ? '#f4c349' : '#fff8e1', fontFamily: i === 3 ? 'IBM Plex Mono, monospace' : undefined }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Element chip ─────────────────────────────────────────────
const ElemChip: React.FC<{ s: string }> = ({ s }) => {
  const el = Object.values(ELEMENTS).find(e => e.symbol === s) ?? { symbol: s, hue: 200 };
  return (
    <div style={{
      width: 30, height: 30,
      background: el.symbol === 'Au' ? '#f4c349' : `hsl(${el.hue} 50% 25%)`,
      color: el.symbol === 'Au' ? '#1a0e04' : '#fff8e1',
      border: '1px solid #1a0e04',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 11,
    }}>{s}</div>
  );
};

// ─── Recent matches ──────────────────────────────────────────
interface RecentMatchesProps { userName: string; }
const RecentMatches: React.FC<RecentMatchesProps> = ({ userName }) => {
  const matches = [
    { opp: 'SELENE',   rank: 'PRATA I',    el: 'Au', myEl: 'Li', result: 'L', score: '2 - 5', dur: '9:14',  pe: -18 },
    { opp: 'KRATOS',   rank: 'BRONZE III', el: 'Fe', myEl: 'Hg', result: 'V', score: '5 - 3', dur: '7:22',  pe: +22 },
    { opp: 'NYX',      rank: 'BRONZE III', el: 'Cu', myEl: 'O',  result: 'V', score: '5 - 2', dur: '6:48',  pe: +24 },
    { opp: 'PROMETEU', rank: 'BRONZE II',  el: 'C',  myEl: 'Fe', result: 'L', score: '4 - 5', dur: '10:32', pe: -15 },
    { opp: 'HEKATE',   rank: 'BRONZE IV',  el: 'H',  myEl: 'Au', result: 'V', score: '5 - 1', dur: '5:10',  pe: +28 },
  ];
  return (
    <Panel preLabel="· HISTORIA ·" title="DUELOS RECENTES" sub="Últimos 5 confrontos · 3V 2D">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {matches.map((m, i) => {
          const isWin = m.result === 'V';
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: 'auto auto 1fr auto auto auto', gap: 14, alignItems: 'center',
              padding: '10px 14px',
              background: isWin ? 'rgba(168,230,196,.06)' : 'rgba(217,74,74,.06)',
              border: `1px solid ${isWin ? 'rgba(168,230,196,.2)' : 'rgba(217,74,74,.2)'}`,
              borderLeft: `3px solid ${isWin ? '#a8e6c4' : '#ff7a7a'}`,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isWin ? '#a8e6c4' : 'rgba(217,74,74,.8)',
                color: '#1a0e04',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 13,
              }}>{m.result}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ElemChip s={m.myEl} />
                <span style={{ color: 'rgba(244,195,73,.5)', fontSize: 11 }}>×</span>
                <ElemChip s={m.el} />
              </div>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 12, letterSpacing: '.12em', color: '#fff8e1' }}>
                  {userName} <span style={{ color: 'rgba(244,195,73,.6)' }}>vs</span> {m.opp}
                </div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.25em', color: 'rgba(244,195,73,.55)', marginTop: 2 }}>
                  {m.rank}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 13, color: '#fff8e1' }}>{m.score}</div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'rgba(244,195,73,.6)', marginTop: 1 }}>{m.dur}</div>
              </div>
              <div style={{
                fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 13,
                color: m.pe > 0 ? '#a8e6c4' : '#ff7a7a',
                minWidth: 48, textAlign: 'right',
              }}>{m.pe > 0 ? '+' : ''}{m.pe} PE</div>
              <a href="#" style={{
                fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.25em', color: 'rgba(244,195,73,.7)',
                textDecoration: 'none', padding: '6px 10px', border: '1px solid rgba(244,195,73,.25)',
              }}>REPLAY</a>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

// ─── Season reward ───────────────────────────────────────────
const SeasonReward: React.FC = () => (
  <Panel preLabel="· PRAEMIUM ·" title="RECOMPENSA DA TEMPORADA" sub="Alcance Prata III para resgatar">
    <div style={{
      position: 'relative', padding: '30px 24px 24px', textAlign: 'center',
      background: 'radial-gradient(ellipse at center, rgba(244,195,73,.15), transparent 70%)',
      border: '1px solid rgba(244,195,73,.3)',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: '-30%',
        background: 'conic-gradient(from 0deg, rgba(244,195,73,.15) 0deg, transparent 12deg, rgba(244,195,73,.15) 24deg, transparent 36deg, rgba(244,195,73,.15) 48deg, transparent 60deg, rgba(244,195,73,.15) 72deg, transparent 84deg, rgba(244,195,73,.15) 96deg, transparent 108deg, rgba(244,195,73,.15) 120deg, transparent 132deg, rgba(244,195,73,.15) 144deg, transparent 156deg, rgba(244,195,73,.15) 168deg, transparent 180deg, rgba(244,195,73,.15) 192deg, transparent 204deg, rgba(244,195,73,.15) 216deg, transparent 228deg, rgba(244,195,73,.15) 240deg, transparent 252deg, rgba(244,195,73,.15) 264deg, transparent 276deg, rgba(244,195,73,.15) 288deg, transparent 300deg, rgba(244,195,73,.15) 312deg, transparent 324deg, rgba(244,195,73,.15) 336deg, transparent 348deg)',
        opacity: .7, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'relative', zIndex: 2,
        width: 140, height: 200, margin: '0 auto 18px',
        background: 'linear-gradient(180deg, #f5ecd4, #d8c89a)',
        border: '2px solid #f4c349',
        boxShadow: '0 0 0 1px #1a0e04, 0 0 0 4px #f4c349, 0 0 0 5px #1a0e04, 0 0 40px rgba(244,195,73,.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8,
      }}>
        <div style={{
          position: 'absolute', top: -1, left: -1, right: -1, height: 18,
          background: 'linear-gradient(180deg,#f4c349,#8a6a2a)',
          clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
        }} />
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 50, color: '#1a0e04', marginTop: 14 }}>♛</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.3em', color: '#8a6a2a', fontWeight: 700 }}>LEGENDARY</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 11, color: '#1a0e04' }}>OURO ATHENA</div>
      </div>
      <div style={{ position: 'relative', zIndex: 2, fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 14, letterSpacing: '.15em', color: '#fff8e1' }}>
        CAVALEIRO DO OURO · ATHENA
      </div>
      <div style={{ position: 'relative', zIndex: 2, fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.3em', color: '#f4c349', marginTop: 4 }}>
        + 2 PACOTES + 800 PÓ CÓSMICO
      </div>
      <div style={{ position: 'relative', zIndex: 2, marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {['BRONZE', 'PRATA', 'OURO', 'COSMO'].map((l, i) => (
          <React.Fragment key={l}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 14, height: 14,
                background: i === 0 ? '#f4c349' : 'transparent',
                border: `1.5px solid ${i === 0 ? '#f4c349' : 'rgba(244,195,73,.3)'}`,
                transform: 'rotate(45deg)',
                boxShadow: i === 0 ? '0 0 10px #f4c349' : 'none',
              }} />
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '.25em', color: i === 0 ? '#f4c349' : 'rgba(244,195,73,.4)', marginTop: 6 }}>
                {l}
              </div>
            </div>
            {i < 3 && <div style={{ width: 28, height: 1, background: 'rgba(244,195,73,.25)', marginBottom: 14 }} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  </Panel>
);

// ─── Friends row ─────────────────────────────────────────────
const FriendsRow: React.FC = () => {
  const isMobile = useIsMobile();
  const friends = [
    { name: 'KRATOS',   tag: 'PRATA II',   online: true,  status: 'EM DUELO' },
    { name: 'HEKATE',   tag: 'BRONZE I',   online: true,  status: 'ONLINE'   },
    { name: 'NYX',      tag: 'BRONZE III', online: true,  status: 'NO LOBBY' },
    { name: 'PROMETEU', tag: 'PRATA III',  online: false, status: 'OFFLINE 2h' },
    { name: 'AETHRA',   tag: 'OURO IV',    online: true,  status: 'ONLINE'   },
    { name: 'ATLAS',    tag: 'COSMO',      online: false, status: 'OFFLINE 1d' },
  ];
  return (
    <section style={{ marginTop: 30 }}>
      <PanelHeader preLabel="· CONFRATRES ·" title="CAVALEIROS ALIADOS"
        right={<button style={panelBtnGhost}>+ ADICIONAR AMIGO</button>}
      />
      <div style={{
        padding: '18px 20px', background: 'rgba(20,8,10,.5)', border: '1px solid rgba(244,195,73,.25)',
        display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(6,1fr)', gap: 12,
      }}>
        {friends.map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px',
            background: 'rgba(244,195,73,.04)', border: '1px solid rgba(244,195,73,.15)',
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: f.online ? 'linear-gradient(135deg,#f4c349,#6a4f1e)' : 'rgba(100,80,50,.5)',
                color: '#1a0e04', fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: f.online ? 1 : .5,
              }}>{f.name.slice(0, 2)}</div>
              <div style={{
                position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%',
                background: f.online ? '#a8e6c4' : '#666',
                border: '2px solid #1a0e04',
                boxShadow: f.online ? '0 0 8px #a8e6c4' : 'none',
              }} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 11, letterSpacing: '.12em', color: '#fff8e1',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{f.name}</div>
              <div style={{
                fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '.25em',
                color: f.status === 'EM DUELO' ? '#f4c349' : 'rgba(244,195,73,.6)', marginTop: 2,
              }}>{f.status}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── Dashboard (main export) ─────────────────────────────────
const Dashboard: React.FC<DashboardProps> = ({ userProfile, isAdmin, difficulty, onStartGame, onStartMultiplayer, onSetDifficulty, onGoToRanking, onGoToAdmin, onGoToCollection, onGoToRules, onLogout }) => {
  const isMobile = useIsMobile();
  const userName = userProfile.name.toUpperCase();
  return (
    <div style={{
      position: 'relative', minHeight: '100vh',
      background: 'linear-gradient(180deg, #06030a 0%, #0a0500 30%, #06030a 100%)',
      color: '#fff8e1',
    }}>
      <CosmicBG />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <LoggedHeader userProfile={userProfile} onStartGame={onStartGame} onGoToRanking={onGoToRanking} onGoToCollection={onGoToCollection} onGoToRules={onGoToRules} onLogout={onLogout} />
        <ContinueBanner userName={userName} onStartGame={onStartGame} />
        <main style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '16px 16px 40px' : '24px 36px 60px' }}>
          <GreetingHero userName={userName} />
          <QuickActions onStartGame={onStartGame} onStartMultiplayer={onStartMultiplayer} onGoToCollection={onGoToCollection} difficulty={difficulty} onSetDifficulty={onSetDifficulty} />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr', gap: 24, marginTop: 30 }}>
            <DailyQuests />
            <RankProgress onGoToRanking={onGoToRanking} />
          </div>
          <ActiveDeck />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr', gap: 24, marginTop: 30 }}>
            <RecentMatches userName={userName} />
            <SeasonReward />
          </div>
          <FriendsRow />
        </main>
        <HomeFooter />
      </div>
    </div>
  );
};

export default Dashboard;
