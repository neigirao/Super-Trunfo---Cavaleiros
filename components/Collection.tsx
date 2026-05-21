import React, { useState } from 'react';
import { UserProfile } from '../types';
import { PERIODIC, fmt } from '../shared';
import { CosmicBG, PeriodicTile, HomeFooter } from './HomeMenu';
import { LoggedHeader } from './Dashboard';

export interface CollectionProps {
  userProfile: UserProfile;
  onStartGame: () => void;
  onGoToRanking: () => void;
  onGoToCollection: () => void;
  onBack: () => void;
}

// ─── Static roster data ──────────────────────────────────────
interface RosterEntry {
  sym: string;
  name: string;
  atomic: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  type: string;
  mass: number;
  density: number;
  hue: number;
  owned: boolean;
  dup: number;
  featured?: boolean;
  art?: string;
}

const ROSTER: RosterEntry[] = [
  { sym: 'H',  name: 'Cavaleiro do Hidrogênio',    atomic: 1,  rarity: 'Common',    type: 'Não-Metal',      mass: 1.008,   density: 0.0899,  hue: 190, owned: true,  dup: 1 },
  { sym: 'He', name: 'Cavaleiro do Hélio',         atomic: 2,  rarity: 'Rare',      type: 'Gás Nobre',      mass: 4.003,   density: 0.18,    hue: 50,  owned: true,  dup: 1 },
  { sym: 'Li', name: 'Cavaleiro do Lítio',         atomic: 3,  rarity: 'Common',    type: 'Metal Alcalino', mass: 6.941,   density: 0.534,   hue: 268, owned: true,  dup: 3, featured: true, art: 'assets/cavaleiro-litio.png' },
  { sym: 'Be', name: 'Cavaleiro do Berílio',       atomic: 4,  rarity: 'Common',    type: 'Alcalino Terr.', mass: 9.012,   density: 1.85,    hue: 140, owned: false, dup: 0 },
  { sym: 'B',  name: 'Cavaleiro do Boro',          atomic: 5,  rarity: 'Rare',      type: 'Metaloide',      mass: 10.81,   density: 2.34,    hue: 30,  owned: false, dup: 0 },
  { sym: 'C',  name: 'Cavaleiro do Carbono',       atomic: 6,  rarity: 'Epic',      type: 'Não-Metal',      mass: 12.011,  density: 2.267,   hue: 0,   owned: true,  dup: 1 },
  { sym: 'N',  name: 'Cavaleiro do Nitrogênio',    atomic: 7,  rarity: 'Common',    type: 'Não-Metal',      mass: 14.007,  density: 1.25,    hue: 210, owned: true,  dup: 2 },
  { sym: 'O',  name: 'Cavaleiro do Oxigênio',      atomic: 8,  rarity: 'Rare',      type: 'Não-Metal',      mass: 15.999,  density: 1.429,   hue: 180, owned: true,  dup: 1 },
  { sym: 'F',  name: 'Cavaleiro do Flúor',         atomic: 9,  rarity: 'Rare',      type: 'Halogênio',      mass: 18.998,  density: 1.696,   hue: 90,  owned: false, dup: 0 },
  { sym: 'Ne', name: 'Cavaleiro do Neônio',        atomic: 10, rarity: 'Epic',      type: 'Gás Nobre',      mass: 20.180,  density: 0.9,     hue: 300, owned: false, dup: 0 },
  { sym: 'Na', name: 'Cavaleiro do Sódio',         atomic: 11, rarity: 'Common',    type: 'Metal Alcalino', mass: 22.99,   density: 0.971,   hue: 320, owned: true,  dup: 2 },
  { sym: 'Mg', name: 'Cavaleiro do Magnésio',      atomic: 12, rarity: 'Common',    type: 'Alcalino Terr.', mass: 24.305,  density: 1.738,   hue: 120, owned: true,  dup: 1 },
  { sym: 'Al', name: 'Cavaleiro do Alumínio',      atomic: 13, rarity: 'Common',    type: 'Metal',          mass: 26.982,  density: 2.7,     hue: 200, owned: true,  dup: 1 },
  { sym: 'Si', name: 'Cavaleiro do Silício',       atomic: 14, rarity: 'Rare',      type: 'Metaloide',      mass: 28.085,  density: 2.329,   hue: 240, owned: true,  dup: 1 },
  { sym: 'P',  name: 'Cavaleiro do Fósforo',       atomic: 15, rarity: 'Common',    type: 'Não-Metal',      mass: 30.974,  density: 1.823,   hue: 20,  owned: false, dup: 0 },
  { sym: 'S',  name: 'Cavaleiro do Enxofre',       atomic: 16, rarity: 'Common',    type: 'Não-Metal',      mass: 32.06,   density: 2.07,    hue: 55,  owned: true,  dup: 1 },
  { sym: 'Cl', name: 'Cavaleiro do Cloro',         atomic: 17, rarity: 'Rare',      type: 'Halogênio',      mass: 35.45,   density: 3.214,   hue: 80,  owned: false, dup: 0 },
  { sym: 'Ar', name: 'Cavaleiro do Argônio',       atomic: 18, rarity: 'Epic',      type: 'Gás Nobre',      mass: 39.948,  density: 1.784,   hue: 170, owned: false, dup: 0 },
  { sym: 'K',  name: 'Rei Potássio, o Explosivo',  atomic: 19, rarity: 'Common',    type: 'Metal Alcalino', mass: 39.098,  density: 0.862,   hue: 280, owned: true,  dup: 1 },
  { sym: 'Ca', name: 'Guardião Cálcio',            atomic: 20, rarity: 'Common',    type: 'Alcalino Terr.', mass: 40.078,  density: 1.54,    hue: 160, owned: true,  dup: 1 },
  { sym: 'Fe', name: 'Cavaleiro do Ferro',         atomic: 26, rarity: 'Rare',      type: 'Transição',      mass: 55.845,  density: 7.874,   hue: 14,  owned: true,  dup: 2 },
  { sym: 'Ni', name: 'Escudo Inoxidável',          atomic: 28, rarity: 'Common',    type: 'Transição',      mass: 58.693,  density: 8.908,   hue: 130, owned: true,  dup: 1 },
  { sym: 'Cu', name: 'Cavaleiro do Cobre',         atomic: 29, rarity: 'Rare',      type: 'Transição',      mass: 63.546,  density: 8.96,    hue: 25,  owned: false, dup: 0 },
  { sym: 'Ag', name: 'Cavaleiro da Prata',         atomic: 47, rarity: 'Epic',      type: 'Transição',      mass: 107.87,  density: 10.49,   hue: 0,   owned: false, dup: 0 },
  { sym: 'Au', name: 'Cavaleiro do Ouro',          atomic: 79, rarity: 'Legendary', type: 'Transição',      mass: 196.97,  density: 19.32,   hue: 44,  owned: true,  dup: 1 },
  { sym: 'Hg', name: 'Cavaleiro do Mercúrio',      atomic: 80, rarity: 'Epic',      type: 'Transição',      mass: 200.59,  density: 13.534,  hue: 200, owned: false, dup: 0 },
  { sym: 'Pt', name: 'Cavaleiro da Platina',       atomic: 78, rarity: 'Legendary', type: 'Transição',      mass: 195.084, density: 21.45,   hue: 200, owned: false, dup: 0 },
  { sym: 'U',  name: 'Cavaleiro do Urânio',        atomic: 92, rarity: 'Legendary', type: 'Actinídeo',      mass: 238.029, density: 19.1,    hue: 90,  owned: false, dup: 0 },
];

const RARITY_COLOR: Record<string, string> = {
  Common: '#9aa6c4', Rare: '#9bd5ff', Epic: '#c995ff', Legendary: '#f4c349',
};

// ─── CollectionHero ───────────────────────────────────────────
const CollectionHero: React.FC = () => (
  <section style={{
    position: 'relative', padding: '40px 36px 30px', overflow: 'hidden',
    borderBottom: '1px solid rgba(244,195,73,.2)',
    background: 'radial-gradient(ellipse at 50% 0%, rgba(244,195,73,.15) 0%, transparent 60%)',
  }}>
    <PeriodicTile opacity={0.05} />
    <div style={{ position: 'relative', zIndex: 2, maxWidth: 1500, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <span style={{ width: 40, height: 1, background: '#f4c349', display: 'block' }} />
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.5em', color: '#f4c349' }}>· LEGIO ·</span>
        <span style={{ width: 40, height: 1, background: '#f4c349', display: 'block' }} />
      </div>
      <h1 style={{
        fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 46, letterSpacing: '.04em',
        color: '#fff8e1', margin: '0 0 10px', lineHeight: 1,
        textShadow: '0 0 30px rgba(244,195,73,.3)',
      }}>COLEÇÃO DE CAVALEIROS</h1>
      <p style={{ fontFamily: 'Spectral, serif', fontSize: 16, color: 'rgba(255,236,196,.7)', margin: '0 auto', maxWidth: 560 }}>
        Cada cavaleiro forjado, cada elemento conquistado. Gerencie sua coleção e construa
        decks dignos do cosmos.
      </p>
    </div>
  </section>
);

// ─── CollectionStats ─────────────────────────────────────────
const CollectionStats: React.FC = () => {
  const stats = [
    { icon: '♛', label: 'CAVALEIROS COLETADOS', value: '18', sub: '21% da coleção', color: '#f4c349', bar: 21 },
    { icon: '◇', label: 'COMUNS',               value: '12', sub: '67% coletados',  color: '#9aa6c4', bar: 67 },
    { icon: '◈', label: 'RAROS / ÉPICOS',        value: '5',  sub: '14% coletados',  color: '#9bd5ff', bar: 14 },
    { icon: '✦', label: 'LENDÁRIOS',             value: '1',  sub: '20% coletados',  color: '#c995ff', bar: 20 },
  ];
  return (
    <section style={{ marginTop: 30, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
      {stats.map(s => (
        <div key={s.label} style={{
          position: 'relative', padding: '20px 22px',
          background: 'linear-gradient(180deg, rgba(20,8,10,.85), rgba(10,5,0,.65))',
          border: '1px solid rgba(244,195,73,.3)', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -20, right: -30,
            width: 140, height: 140, borderRadius: '50%',
            background: `radial-gradient(circle, ${s.color}30, transparent 70%)`,
          }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{
              width: 42, height: 42,
              background: `linear-gradient(135deg, ${s.color}, rgba(0,0,0,.5))`,
              border: `1.5px solid ${s.color}`,
              clipPath: 'polygon(20% 0,80% 0,100% 50%,80% 100%,20% 100%,0 50%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#1a0e04', fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 16,
              boxShadow: `0 0 14px ${s.color}80`,
            }}>{s.icon}</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 36, letterSpacing: '.02em', color: '#fff8e1', lineHeight: 1 }}>{s.value}</div>
          </div>
          <div style={{ position: 'relative', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.3em', color: 'rgba(244,195,73,.8)', fontWeight: 600 }}>{s.label}</div>
          <div style={{ position: 'relative', fontFamily: 'Spectral, serif', fontSize: 12, color: 'rgba(255,236,196,.55)', marginTop: 4 }}>{s.sub}</div>
          <div style={{ position: 'relative', marginTop: 14, height: 4, background: 'rgba(244,195,73,.1)' }}>
            <div style={{ width: `${s.bar}%`, height: '100%', background: s.color, boxShadow: `0 0 8px ${s.color}80` }} />
          </div>
        </div>
      ))}
    </section>
  );
};

// ─── FilterGroup ─────────────────────────────────────────────
interface FilterGroupProps {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: [string, string][];
}
const FilterGroup: React.FC<FilterGroupProps> = ({ label, value, setValue, options }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 6, padding: '4px',
    background: 'rgba(10,5,0,.5)', border: '1px solid rgba(244,195,73,.2)',
  }}>
    <span style={{ padding: '0 10px', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.3em', color: 'rgba(244,195,73,.6)', fontWeight: 700 }}>{label}</span>
    {options.map(([v, l]) => (
      <button key={v} onClick={() => setValue(v)} style={{
        padding: '6px 12px',
        background: value === v ? '#f4c349' : 'transparent',
        color: value === v ? '#1a0e04' : 'rgba(255,236,196,.7)',
        border: 0, cursor: 'pointer',
        fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 10, letterSpacing: '.15em',
      }}>{l}</button>
    ))}
  </div>
);

// ─── CollectionToolbar ────────────────────────────────────────
interface ToolbarProps {
  tab: string; setTab: (v: string) => void;
  view: string; setView: (v: string) => void;
  rarity: string; setRarity: (v: string) => void;
  type: string; setType: (v: string) => void;
}
const CollectionToolbar: React.FC<ToolbarProps> = ({ tab, setTab, view, setView, rarity, setRarity, type, setType }) => (
  <section style={{ marginTop: 30 }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: 16, marginBottom: 16 }}>
      <div style={{ position: 'relative', background: 'rgba(10,5,0,.7)', border: '1px solid rgba(244,195,73,.3)' }}>
        <span style={{ position: 'absolute', top: '50%', left: 18, transform: 'translateY(-50%)', color: '#f4c349', fontSize: 16 }}>⌕</span>
        <input
          type="text"
          placeholder="Buscar cavaleiro, elemento, símbolo (ex: Au, Ouro, Ferro...)"
          style={{
            width: '100%', padding: '14px 16px 14px 48px', background: 'transparent', border: 0, outline: 'none',
            fontFamily: 'Spectral, serif', fontSize: 14, color: '#fff8e1',
          }}
        />
        <span style={{
          position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)',
          padding: '4px 8px', border: '1px solid rgba(244,195,73,.3)',
          fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'rgba(244,195,73,.6)',
        }}>⌘ K</span>
      </div>
      <div style={{
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(10,5,0,.7)', border: '1px solid rgba(244,195,73,.3)', cursor: 'pointer',
        fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.3em', color: '#fff8e1', fontWeight: 700,
      }}>
        <span style={{ color: '#f4c349' }}>⇅</span>NÚMERO ATÔMICO <span style={{ color: 'rgba(244,195,73,.5)' }}>▾</span>
      </div>
      <div style={{ display: 'flex', background: 'rgba(10,5,0,.7)', border: '1px solid rgba(244,195,73,.3)' }}>
        {([['grid', '◰ GRADE'], ['table', '⌬ TABELA PERIÓDICA']] as [string, string][]).map(([v, l]) => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '14px 18px',
            background: view === v ? '#f4c349' : 'transparent',
            color: view === v ? '#1a0e04' : '#fff8e1',
            border: 0, cursor: 'pointer',
            fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 10, letterSpacing: '.28em',
          }}>{l}</button>
        ))}
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <FilterGroup label="RARIDADE" value={rarity} setValue={setRarity} options={[
          ['all', 'Todas'], ['common', 'Common'], ['rare', 'Rare'], ['epic', 'Epic'], ['legendary', 'Legendary'],
        ]} />
        <FilterGroup label="TIPO" value={type} setValue={setType} options={[
          ['all', 'Todos'], ['metal', 'Metal'], ['nonmetal', 'Não-metal'], ['noble', 'Nobre'], ['transition', 'Transição'],
        ]} />
        <FilterGroup label="STATUS" value="all" setValue={() => {}} options={[
          ['all', 'Todos'], ['owned', 'Coletados'], ['missing', 'Faltam'], ['duplicate', 'Duplicatas'],
        ]} />
      </div>
      <div style={{ display: 'flex', background: 'rgba(10,5,0,.7)', border: '1px solid rgba(244,195,73,.3)' }}>
        {([['mine', 'MINHA COLEÇÃO', '18'], ['all', 'TODOS OS CAVALEIROS', '87']] as [string, string, string][]).map(([t, l, n]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '12px 22px',
            background: tab === t ? 'linear-gradient(180deg,#f4c349,#8a6a2a)' : 'transparent',
            color: tab === t ? '#1a0e04' : '#fff8e1',
            border: 0, cursor: 'pointer',
            fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 11, letterSpacing: '.25em',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {l}
            <span style={{
              padding: '2px 8px',
              background: tab === t ? 'rgba(26,14,4,.25)' : 'rgba(244,195,73,.15)',
              fontFamily: 'IBM Plex Mono, monospace', fontSize: 10,
              color: tab === t ? '#1a0e04' : '#f4c349',
            }}>{n}</span>
          </button>
        ))}
      </div>
    </div>
  </section>
);

// ─── CollectionCard ───────────────────────────────────────────
const CollectionCard: React.FC<{ c: RosterEntry }> = ({ c }) => {
  const rarityColor = RARITY_COLOR[c.rarity] ?? '#9aa6c4';
  const isLocked = !c.owned;
  return (
    <article style={{
      position: 'relative', aspectRatio: '2/3', cursor: 'pointer',
      filter: isLocked ? 'grayscale(.7) brightness(.5)' : 'none',
      opacity: isLocked ? .65 : 1,
      transform: c.featured ? 'translateY(-6px)' : 'none',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: isLocked
          ? 'linear-gradient(135deg, #1a1208 0%, #14080a 60%, #0a0500 100%)'
          : 'linear-gradient(135deg, #f5ecd4 0%, #e8dab8 30%, #f5ecd4 60%, #d8c89a 100%)',
        border: isLocked
          ? '1px solid rgba(244,195,73,.25)'
          : `2px solid ${c.featured ? '#f4c349' : '#c9a14a'}`,
        boxShadow: isLocked
          ? 'inset 0 0 30px rgba(0,0,0,.6)'
          : c.featured
            ? '0 0 0 1px #1a0e04, 0 0 0 4px #f4c349, 0 0 0 5px #1a0e04, 0 0 30px rgba(244,195,73,.5)'
            : '0 0 0 1px #1a0e04, 0 0 0 3px #c9a14a, 0 4px 16px rgba(0,0,0,.5)',
      }}>
        {/* Pediment */}
        <div style={{
          position: 'absolute', top: -1, left: -1, right: -1, height: 22,
          background: isLocked
            ? 'linear-gradient(180deg, rgba(244,195,73,.3), rgba(138,107,42,.2))'
            : 'linear-gradient(180deg,#f4c349,#8a6a2a)',
          clipPath: 'polygon(0 100%, 50% 0, 100% 100%)', zIndex: 2,
        }} />

        {/* Inner frame */}
        <div style={{
          position: 'absolute', inset: '28px 10px 18px',
          border: isLocked ? '1px solid rgba(244,195,73,.2)' : '1px solid #c9a14a80',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Title band */}
          <div style={{
            padding: '8px 8px 6px', textAlign: 'center',
            borderBottom: isLocked ? '1px solid rgba(244,195,73,.1)' : '1px solid #c9a14a40',
            background: isLocked ? 'rgba(244,195,73,.05)' : 'rgba(138,107,42,.06)',
          }}>
            <div style={{
              fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 10, letterSpacing: '.05em',
              color: isLocked ? 'rgba(244,195,73,.5)' : '#1a0e04',
              lineHeight: 1.15, maxHeight: 24, overflow: 'hidden',
            }}>{c.name.toUpperCase()}</div>
          </div>

          {/* Portrait */}
          <div style={{
            flex: 1, margin: '7px',
            background: `radial-gradient(circle at 50% 70%, hsl(${c.hue} 50% 25%) 0%, hsl(${c.hue} 40% 12%) 100%)`,
            border: '1px solid #1a0e04', overflow: 'hidden', position: 'relative',
          }}>
            {c.art && !isLocked ? (
              <img src={c.art} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%' }} />
            ) : (
              <>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 70, height: 70, borderRadius: '50%', border: `1px dashed ${rarityColor}40` }} />
                </div>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 64,
                  color: isLocked ? 'rgba(244,195,73,.25)' : '#fff8e1',
                  textShadow: isLocked ? 'none' : `0 0 18px ${rarityColor}80`,
                }}>{c.sym}</div>
              </>
            )}

            {/* Atomic # */}
            <div style={{
              position: 'absolute', top: 5, left: 5,
              fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 9, letterSpacing: '.1em',
              color: isLocked ? 'rgba(244,195,73,.4)' : '#f4c349',
              padding: '1px 6px', background: 'rgba(0,0,0,.6)',
            }}>#{String(c.atomic).padStart(3, '0')}</div>

            {/* Rarity dot */}
            <div style={{
              position: 'absolute', top: 6, right: 6,
              width: 10, height: 10, background: rarityColor, borderRadius: '50%',
              boxShadow: isLocked ? 'none' : `0 0 8px ${rarityColor}`,
            }} />

            {/* Symbol seal */}
            {!isLocked && (
              <div style={{
                position: 'absolute', bottom: 5, left: 5,
                width: 24, height: 24, background: '#f4c349', color: '#1a0e04',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 11,
                border: '1px solid #1a0e04',
              }}>{c.sym}</div>
            )}

            {/* Duplicates badge */}
            {c.dup > 1 && !isLocked && (
              <div style={{
                position: 'absolute', bottom: 5, right: 5,
                padding: '2px 6px',
                background: '#1a0e04', border: '1px solid #f4c349',
                fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 10, color: '#f4c349',
              }}>×{c.dup}</div>
            )}

            {/* Locked overlay */}
            {isLocked && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: 'rgba(10,5,0,.7)', border: '1px solid rgba(244,195,73,.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: '#f4c349',
                }}>🔒</div>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div style={{
            padding: '4px 8px 0',
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'IBM Plex Mono, monospace', fontSize: 9,
            color: isLocked ? 'rgba(244,195,73,.4)' : '#1a0e04',
          }}>
            <span>{fmt(c.mass)}u</span>
            <span>{fmt(c.density)}</span>
          </div>
          <div style={{
            padding: '2px 8px 4px', display: 'flex', justifyContent: 'space-between',
            fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '.18em',
            color: isLocked ? 'rgba(244,195,73,.35)' : '#8a6a2a', fontWeight: 700,
          }}>
            <span>{c.rarity.toUpperCase()}</span>
            <span>{c.type.toUpperCase()}</span>
          </div>
        </div>

        {/* Stylobate */}
        {!isLocked && (
          <div style={{
            position: 'absolute', bottom: 0, left: -1, right: -1, height: 14,
            background: 'linear-gradient(180deg,#f4c349,#8a6a2a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Cinzel, serif', fontSize: 7, letterSpacing: '.35em', color: '#1a0e04', fontWeight: 700,
          }}>· {c.sym} ·</div>
        )}
      </div>

      {/* Featured banner */}
      {c.featured && (
        <div style={{
          position: 'absolute', top: -10, right: -10,
          padding: '3px 8px', background: '#f4c349', color: '#1a0e04',
          fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 8, letterSpacing: '.3em',
          boxShadow: '0 0 14px rgba(244,195,73,.6)',
          transform: 'rotate(8deg)', zIndex: 5,
        }}>EM DECK</div>
      )}

      {/* Missing banner */}
      {isLocked && (
        <div style={{
          position: 'absolute', bottom: 8, left: 8, right: 8, zIndex: 5,
          padding: '5px 0', textAlign: 'center',
          background: 'rgba(10,5,0,.85)', border: '1px solid rgba(244,195,73,.4)',
          fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 9, letterSpacing: '.3em', color: '#f4c349',
        }}>NÃO COLETADO</div>
      )}
    </article>
  );
};

// ─── CardGrid ────────────────────────────────────────────────
interface CardGridProps { tab: string; rarity: string; type: string; }
const CardGrid: React.FC<CardGridProps> = ({ tab, rarity }) => {
  let cards = [...ROSTER];
  if (tab === 'mine') cards = cards.filter(c => c.owned);
  if (rarity !== 'all') cards = cards.filter(c => c.rarity.toLowerCase() === rarity);
  return (
    <section style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 16 }}>
      {cards.map(c => <CollectionCard key={c.sym} c={c} />)}
    </section>
  );
};

// ─── PeriodicView ─────────────────────────────────────────────
const PeriodicView: React.FC = () => {
  const ownedSyms = new Set(ROSTER.filter(c => c.owned).map(c => c.sym));
  const rarityBySym = Object.fromEntries(ROSTER.map(c => [c.sym, c.rarity]));

  return (
    <section style={{ marginTop: 30 }}>
      <div style={{
        padding: '30px 36px',
        background: 'linear-gradient(180deg, rgba(20,8,10,.7), rgba(10,5,0,.4))',
        border: '1px solid rgba(244,195,73,.3)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.45em', color: '#f4c349' }}>· TABULA PERIODICA ·</div>
            <h3 style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 22, letterSpacing: '.1em', color: '#fff8e1', margin: '6px 0 0' }}>
              MAPA DA COLEÇÃO
            </h3>
          </div>
          <div style={{ display: 'flex', gap: 14, fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.25em' }}>
            {([['#f4c349', 'LEGENDARY'], ['#c995ff', 'EPIC'], ['#9bd5ff', 'RARE'], ['#9aa6c4', 'COMMON'], ['rgba(244,195,73,.15)', 'LOCKED']] as [string, string][]).map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, background: c, boxShadow: c.startsWith('#') ? `0 0 6px ${c}` : 'none' }} />
                <span style={{ color: 'rgba(255,236,196,.7)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(18,1fr)', gridTemplateRows: 'repeat(7,1fr)', gap: 3, aspectRatio: '18 / 7' }}>
          {PERIODIC.map(([p, g, s], i) => {
            const owned = ownedSyms.has(s);
            const color = owned ? RARITY_COLOR[rarityBySym[s]] ?? '#9aa6c4' : 'rgba(244,195,73,.15)';
            return (
              <div key={i} style={{
                gridColumn: g, gridRow: p,
                background: owned ? `linear-gradient(180deg, ${color}30, ${color}10)` : 'rgba(10,5,0,.4)',
                border: owned ? `1.5px solid ${color}` : '1px solid rgba(244,195,73,.12)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: owned ? 'pointer' : 'default', position: 'relative',
                boxShadow: owned ? `inset 0 0 12px ${color}30, 0 0 8px ${color}40` : 'none',
              }}>
                <div style={{
                  fontFamily: 'Cinzel, serif', fontWeight: 900,
                  fontSize: '1.3vw',
                  color: owned ? '#fff8e1' : 'rgba(244,195,73,.3)',
                  textShadow: owned ? `0 0 8px ${color}` : 'none',
                  lineHeight: 1,
                }}>{s}</div>
                {!owned && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8vw', color: 'rgba(244,195,73,.25)' }}>·</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ─── Collection (main export) ─────────────────────────────────
const Collection: React.FC<CollectionProps> = ({ userProfile, onStartGame, onGoToRanking, onGoToCollection, onBack }) => {
  const [tab, setTab] = useState('mine');
  const [view, setView] = useState('grid');
  const [rarity, setRarity] = useState('all');
  const [type, setType] = useState('all');

  return (
    <div style={{
      position: 'relative', minHeight: '100vh',
      background: 'linear-gradient(180deg, #06030a 0%, #0a0500 30%, #06030a 100%)',
      color: '#fff8e1',
    }}>
      <CosmicBG />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <LoggedHeader
          userProfile={userProfile}
          onStartGame={onStartGame}
          onGoToRanking={onGoToRanking}
          onGoToCollection={onGoToCollection}
        />
        <CollectionHero />
        <main style={{ maxWidth: 1500, margin: '0 auto', padding: '0 36px 80px' }}>
          <CollectionStats />
          <CollectionToolbar
            tab={tab} setTab={setTab}
            view={view} setView={setView}
            rarity={rarity} setRarity={setRarity}
            type={type} setType={setType}
          />
          {view === 'grid'
            ? <CardGrid tab={tab} rarity={rarity} type={type} />
            : <PeriodicView />
          }
        </main>
        <HomeFooter />
      </div>
    </div>
  );
};

export default Collection;
