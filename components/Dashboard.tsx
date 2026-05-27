import React from 'react';
import { UserProfile, Difficulty, RoundResult, CardData } from '../types';
import { ELEMENTS } from '../shared';
import { CosmicBG, PeriodicTile, HomeFooter } from './HomeMenu';
import { useIsMobile } from '../utils/mobile';
import { QUESTS } from '../utils/quests';
import { PlayerCurrency, PlayerStats } from '../utils/supabase';

export interface DashboardProps {
  userProfile: UserProfile;
  isAdmin: boolean;
  difficulty: Difficulty;
  muted: boolean;
  hasSavedGame: boolean;
  savedGameInfo: { round: number; isMultiplayer: boolean } | null;
  questProgress: Record<string, number>;
  currency: PlayerCurrency;
  matchHistory: RoundResult[];
  activeDeck: CardData[];
  playerStats: PlayerStats | null;
  onStartGame: () => void;
  onStartMultiplayer: () => void;
  onContinueGame: () => void;
  onSetDifficulty: (d: Difficulty) => void;
  onGoToRanking: () => void;
  onGoToAdmin: () => void;
  onGoToCollection: () => void;
  onGoToRules: () => void;
  onGoToDeckEditor: () => void;
  onGoToShop: () => void;
  onLogout: () => void;
  onToggleMute: () => void;
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
  muted?: boolean;
  currency?: PlayerCurrency;
  playerStats?: PlayerStats | null;
  onStartGame: () => void;
  onGoToRanking: () => void;
  onGoToCollection?: () => void;
  onGoToRules?: () => void;
  onLogout?: () => void;
  onToggleMute?: () => void;
}
export const LoggedHeader: React.FC<LoggedHeaderProps> = ({ userProfile, muted, currency, playerStats, onStartGame, onGoToRanking, onGoToCollection, onGoToRules, onLogout, onToggleMute }) => {
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
        {!isMobile && <Currency icon="✦" label="COSMO" value={(currency?.cosmo ?? 0).toLocaleString('pt-BR')} />}
        {!isMobile && <Currency icon="◆" label="PÓ" value={(currency?.po ?? 0).toLocaleString('pt-BR')} />}
        <button onClick={onToggleMute} title={muted ? 'Ativar som' : 'Silenciar'} style={{
          width: 38, height: 38, border: `1px solid ${muted ? 'rgba(217,74,74,.5)' : 'rgba(244,195,73,.4)'}`,
          background: muted ? 'rgba(217,74,74,.1)' : 'transparent',
          color: muted ? '#d94a4a' : '#f4c349', cursor: 'pointer',
          fontSize: 16,
        }}>{muted ? '🔇' : '♪'}</button>
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
              {playerStats
                ? `${playerStats.gamesWon}V · ${playerStats.gamesLost}D · ${Math.round(playerStats.winRate)}%`
                : '— partidas'}
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
interface ContinueBannerProps {
  userName: string;
  hasSavedGame: boolean;
  savedGameInfo: { round: number; isMultiplayer: boolean } | null;
  onContinueGame: () => void;
}
const ContinueBanner: React.FC<ContinueBannerProps> = ({ userName, hasSavedGame, savedGameInfo, onContinueGame }) => {
  const isMobile = useIsMobile();
  if (!hasSavedGame) return null;
  const opponentLabel = savedGameInfo?.isMultiplayer ? 'JOGADOR 2' : 'IA';
  const roundLabel = savedGameInfo ? `Rodada ${savedGameInfo.round}` : '';
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
          {userName} <span style={{ color: '#f4c349' }}>vs</span> {opponentLabel} · {roundLabel} · Aguardando sua jogada
        </div>
      </div>
    </div>
    <button onClick={onContinueGame} style={{
      padding: '10px 22px',
      background: 'linear-gradient(180deg,#f4c349,#8a6a2a)', color: '#1a0e04',
      border: '1px solid #f4c349', cursor: 'pointer',
      fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 10, letterSpacing: '.32em',
      boxShadow: '0 0 16px rgba(244,195,73,.5)',
    }}>RETORNAR AO DUELO →</button>
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
          sua mão. Complete missões para acumular <strong style={{ color: '#f4c349' }}>Cosmo</strong> e
          fortalecer seu arsenal elemental.
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
interface QuickActionsProps { onStartGame: () => void; onStartMultiplayer: () => void; onGoToCollection: () => void; onGoToShop: () => void; difficulty: Difficulty; onSetDifficulty: (d: Difficulty) => void; }
const QuickActions: React.FC<QuickActionsProps> = ({ onStartGame, onStartMultiplayer, onGoToCollection, onGoToShop, difficulty, onSetDifficulty }) => {
  const isMobile = useIsMobile();
  const items = [
    { tag: 'I',   name: 'BATALHA vs IA',    sub: 'Solo · vs Oráculo',          icon: '⚔', primary: true,  meta: 'Jogue contra a IA',                 action: onStartGame },
    { tag: 'II',  name: 'TREINO LOCAL',     sub: '2 Jogadores · mesma tela',   icon: '◇', primary: false, meta: 'Multiplayer local sem ranking',      action: onStartMultiplayer },
    { tag: 'III', name: 'FORJA',             sub: 'Melhore seus cavaleiros',    icon: '⚡', primary: false, meta: 'Gasta Cosmo · bônus permanente',     action: onGoToShop },
    { tag: 'IV',  name: 'EXPLORAR COLEÇÃO', sub: 'Seus cavaleiros',            icon: '◈', primary: false, meta: 'Gerenciar cartas',                    action: onGoToCollection },
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
interface DailyQuestsProps { progress: Record<string, number>; }
const DailyQuests: React.FC<DailyQuestsProps> = ({ progress }) => {
  const completedCount = QUESTS.filter(q => (progress[q.id] ?? 0) >= q.total).length;
  return (
    <Panel preLabel="· MISSIONES DIARIAE ·" title="DESAFIOS DO DIA" sub={`Renovam à meia-noite · ${completedCount} de ${QUESTS.length} concluídos`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {QUESTS.map(q => {
          const prog = progress[q.id] ?? 0;
          const done = prog >= q.total;
          return (
          <div key={q.id} style={{
            display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: 14,
            padding: '12px 16px',
            background: done ? 'rgba(244,195,73,.1)' : 'rgba(244,195,73,.04)',
            border: `1px solid ${done ? 'rgba(244,195,73,.45)' : 'rgba(244,195,73,.15)'}`,
          }}>
            <div style={{
              width: 36, height: 36,
              background: done ? '#f4c349' : 'rgba(244,195,73,.1)',
              border: `1px solid ${done ? '#f4c349' : 'rgba(244,195,73,.4)'}`,
              clipPath: 'polygon(50% 0,100% 30%,80% 100%,20% 100%,0 30%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: done ? '#1a0e04' : '#f4c349',
            }}>{done ? '✓' : q.icon}</div>
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 13, letterSpacing: '.08em', color: '#fff8e1' }}>
                {q.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <div style={{ height: 3, flex: 1, background: 'rgba(244,195,73,.15)', position: 'relative', maxWidth: 200 }}>
                  <div style={{
                    position: 'absolute', inset: 0, width: `${Math.min((prog / q.total) * 100, 100)}%`,
                    background: done ? '#f4c349' : 'rgba(244,195,73,.7)',
                    boxShadow: done ? '0 0 8px #f4c349' : 'none',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'rgba(244,195,73,.7)' }}>
                  {prog} / {q.total}
                </span>
              </div>
            </div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.18em', color: '#f4c349', fontWeight: 700 }}>
              {q.rwd}
            </div>
            <button style={{
              padding: '8px 16px',
              background: done ? 'linear-gradient(180deg,#f4c349,#8a6a2a)' : 'transparent',
              color: done ? '#1a0e04' : 'rgba(244,195,73,.4)',
              border: done ? '1px solid #f4c349' : '1px solid rgba(244,195,73,.2)',
              fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 9, letterSpacing: '.3em',
              cursor: done ? 'pointer' : 'default',
              boxShadow: done ? '0 0 14px rgba(244,195,73,.4)' : 'none',
            }}>{done ? 'RECEBER' : 'EM PROGRESSO'}</button>
          </div>
          );
        })}
      </div>
    </Panel>
  );
};

// ─── Rank progress ───────────────────────────────────────────
interface RankProgressProps { playerStats: PlayerStats | null; onGoToRanking: () => void; }
const RankProgress: React.FC<RankProgressProps> = ({ playerStats, onGoToRanking }) => {
  const wins = playerStats?.gamesWon ?? null;
  const losses = playerStats?.gamesLost ?? null;
  const streak = playerStats?.currentStreak ?? null;
  const score = playerStats?.totalScore ?? null;
  const winRate = playerStats?.winRate ?? null;

  const statsRow: [string, string][] = [
    ['VITÓRIAS',  wins   !== null ? String(wins)   : '—'],
    ['DERROTAS',  losses !== null ? String(losses) : '—'],
    ['STREAK',    streak !== null ? `${streak} W`  : '—'],
  ];

  return (
    <Panel preLabel="· ORDO ·" title="SUA POSIÇÃO" sub="Estatísticas acumuladas">
      <div style={{
        padding: '18px 20px', marginBottom: 14,
        background: 'rgba(10,5,0,.6)', border: '1px solid rgba(244,195,73,.3)',
        display: 'flex', alignItems: 'center', gap: 18,
      }}>
        <div style={{
          width: 78, height: 78,
          background: score !== null ? 'linear-gradient(135deg,#c98449,#6a3f24)' : 'rgba(100,80,50,.3)',
          border: '2px solid rgba(212,154,100,.6)',
          clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#1a0e04', fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 11,
          boxShadow: '0 0 0 1px #1a0e04, 0 0 24px rgba(212,154,100,.4)',
          flexShrink: 0, textAlign: 'center',
        }}>
          {score !== null ? score.toLocaleString('pt-BR') : '—'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 13, letterSpacing: '.15em', color: '#fff8e1' }}>
              PONTUAÇÃO TOTAL
            </span>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.7)' }}>
              {winRate !== null ? `${Math.round(winRate)}% win rate` : '—'}
            </span>
          </div>
          <div style={{ height: 8, background: 'rgba(244,195,73,.12)', border: '1px solid rgba(244,195,73,.2)', position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: 0,
              width: `${winRate !== null ? Math.round(winRate) : 0}%`,
              background: 'linear-gradient(90deg,#c98449,#f4c349)',
              boxShadow: winRate ? '0 0 12px rgba(244,195,73,.5)' : 'none',
              transition: 'width 0.4s',
            }} />
          </div>
          <div style={{ marginTop: 6, fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.25em', color: 'rgba(244,195,73,.6)' }}>
            {playerStats
              ? `${playerStats.totalGames} partida${playerStats.totalGames !== 1 ? 's' : ''} jogada${playerStats.totalGames !== 1 ? 's' : ''}`
              : 'Jogue para ver suas estatísticas'}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {statsRow.map(([k, v]) => (
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
};

// ─── Deck slot ───────────────────────────────────────────────
const DeckSlot: React.FC<{ card: CardData | null }> = ({ card }) => {
  if (!card) {
    return (
      <div style={{
        width: 64, height: 90,
        border: '1px dashed rgba(244,195,73,.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(244,195,73,.4)', fontSize: 22,
      }}>+</div>
    );
  }
  const rc = card.isSuperTrunfo ? '#f4c349' : '#9aa6c4';
  const initials = card.name.slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: 64, height: 90, position: 'relative',
      background: 'linear-gradient(180deg,#f5ecd4,#d8c89a)',
      border: `1.5px solid ${rc}`,
      boxShadow: `0 0 0 1px #1a0e04, 0 0 0 2px ${rc}, 0 4px 12px rgba(0,0,0,.4)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 4,
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img src={card.imageUrl} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%', opacity: .85 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(245,236,212,.7))' }} />
      </div>
      <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center', zIndex: 2 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 18, color: '#1a0e04', lineHeight: 1 }}>
          {card.isSuperTrunfo ? '♛' : initials}
        </div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 7, letterSpacing: '.12em', color: '#8a6a2a', fontWeight: 700, marginTop: 2 }}>
          {card.name.slice(0, 4).toUpperCase()}
        </div>
      </div>
    </div>
  );
};

// ─── Active deck ─────────────────────────────────────────────
interface ActiveDeckProps { deck: CardData[]; onGoToDeckEditor: () => void; }
const ActiveDeck: React.FC<ActiveDeckProps> = ({ deck, onGoToDeckEditor }) => {
  const isMobile = useIsMobile();
  const SLOT_COUNT = 9;
  const slots: (CardData | null)[] = [
    ...deck.slice(0, SLOT_COUNT),
    ...Array(Math.max(0, SLOT_COUNT - deck.length)).fill(null),
  ];
  const superTrunfoCount = deck.filter(c => c.isSuperTrunfo).length;
  const avgPower = deck.length > 0
    ? Math.round(deck.reduce((sum, c) => sum + Object.values(c.attributes).reduce((s, v) => s + v, 0), 0) / deck.length)
    : 0;

  return (
    <section style={{ marginTop: 30 }}>
      <PanelHeader preLabel="· ARSENAL ·" title={`DECK ATIVO · ${deck.length} CARTAS`}
        right={
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onGoToDeckEditor} style={panelBtnPrimary}>✎ EDITAR DECK</button>
          </div>
        }
      />
      <div style={{
        padding: '24px 26px',
        background: 'linear-gradient(180deg, rgba(20,8,10,.7), rgba(10,5,0,.5))',
        border: '1px solid rgba(244,195,73,.3)',
        display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined,
        gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center',
      }}>
        <div style={{ textAlign: 'center', padding: '14px 20px', background: 'rgba(244,195,73,.06)', border: '1px solid rgba(244,195,73,.3)' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.35em', color: 'rgba(244,195,73,.7)' }}>PODER</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 32, color: '#fff8e1' }}>{avgPower}</div>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#f4c349' }}>média/carta</div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', overflowX: 'auto' }}>
          {slots.map((card, i) => <DeckSlot key={i} card={card} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 160 }}>
          {[
            ['CARTAS', `${deck.length}`],
            ['SUPER TRUNFO', superTrunfoCount > 0 ? `${superTrunfoCount}` : 'Nenhum'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.2em', color: 'rgba(244,195,73,.7)' }}>
              <span>{k}</span>
              <span style={{ color: '#fff8e1' }}>{v}</span>
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
interface RecentMatchesProps { userName: string; matchHistory: RoundResult[]; }
const RecentMatches: React.FC<RecentMatchesProps> = ({ userName, matchHistory }) => {
  const rounds = matchHistory.slice(0, 5);
  const wins = rounds.filter(r => r.winner === 'player').length;
  const sub = rounds.length > 0
    ? `Última partida · ${wins}V ${rounds.length - wins}D`
    : 'Nenhuma partida registrada';

  return (
    <Panel preLabel="· HISTORIA ·" title="ÚLTIMA PARTIDA" sub={sub}>
      {rounds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: 'Spectral, serif', fontSize: 15, color: 'rgba(255,236,196,.45)' }}>
          Jogue uma partida para ver o histórico de rodadas aqui.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rounds.map((r, i) => {
            const isWin = r.winner === 'player';
            const isDraw = r.winner === 'tie';
            const borderColor = isWin ? '#a8e6c4' : isDraw ? 'rgba(244,195,73,.5)' : '#ff7a7a';
            const bgColor = isWin ? 'rgba(168,230,196,.06)' : isDraw ? 'rgba(244,195,73,.04)' : 'rgba(217,74,74,.06)';
            const label = isWin ? 'V' : isDraw ? '=' : 'D';
            const badgeColor = isWin ? '#a8e6c4' : isDraw ? 'rgba(244,195,73,.6)' : 'rgba(217,74,74,.8)';
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center',
                padding: '10px 14px',
                background: bgColor,
                border: `1px solid ${borderColor}22`,
                borderLeft: `3px solid ${borderColor}`,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: badgeColor, color: '#1a0e04',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 13,
                }}>{label}</div>
                <div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 12, letterSpacing: '.1em', color: '#fff8e1' }}>
                    {r.attribute.toUpperCase()} · <span style={{ color: 'rgba(255,236,196,.7)', fontWeight: 400 }}>{r.playerCard.name}</span>
                    <span style={{ color: 'rgba(244,195,73,.5)' }}> vs </span>
                    <span style={{ color: 'rgba(255,236,196,.7)', fontWeight: 400 }}>{r.aiCard.name}</span>
                  </div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'rgba(244,195,73,.55)', marginTop: 2 }}>
                    {userName} {r.playerValue} × {r.aiValue} ORÁCULO
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 700, color: borderColor }}>
                  {r.playerValue} × {r.aiValue}
                </div>
              </div>
            );
          })}
        </div>
      )}
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

// ─── Dashboard (main export) ─────────────────────────────────
const Dashboard: React.FC<DashboardProps> = ({
  userProfile, isAdmin, difficulty, muted,
  hasSavedGame, savedGameInfo, questProgress, currency,
  matchHistory, activeDeck, playerStats,
  onStartGame, onStartMultiplayer, onContinueGame, onSetDifficulty,
  onGoToRanking, onGoToAdmin, onGoToCollection, onGoToRules, onGoToDeckEditor, onGoToShop,
  onLogout, onToggleMute,
}) => {
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
        <LoggedHeader
          userProfile={userProfile} muted={muted} currency={currency} playerStats={playerStats}
          onStartGame={onStartGame} onGoToRanking={onGoToRanking} onGoToCollection={onGoToCollection}
          onGoToRules={onGoToRules} onLogout={onLogout} onToggleMute={onToggleMute}
        />
        <ContinueBanner userName={userName} hasSavedGame={hasSavedGame} savedGameInfo={savedGameInfo} onContinueGame={onContinueGame} />
        <main style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '16px 16px 40px' : '24px 36px 60px' }}>
          <GreetingHero userName={userName} />
          <QuickActions onStartGame={onStartGame} onStartMultiplayer={onStartMultiplayer} onGoToCollection={onGoToCollection} onGoToShop={onGoToShop} difficulty={difficulty} onSetDifficulty={onSetDifficulty} />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr', gap: 24, marginTop: 30 }}>
            <DailyQuests progress={questProgress} />
            <RankProgress playerStats={playerStats} onGoToRanking={onGoToRanking} />
          </div>
          <ActiveDeck deck={activeDeck} onGoToDeckEditor={onGoToDeckEditor} />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr', gap: 24, marginTop: 30 }}>
            <RecentMatches userName={userName} matchHistory={matchHistory} />
            <SeasonReward />
          </div>
        </main>
        <HomeFooter />
      </div>
    </div>
  );
};

export default Dashboard;
