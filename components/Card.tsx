
import React from 'react';
import { CardData, Attribute, ElementType } from '../types';
import { ReactivityIcon, AtomicMassIcon, RadioactivityIcon, ConductivityIcon, HardnessIcon } from '../constants';

interface CardProps {
  card: CardData | null;
  isFaceDown?: boolean;
  onAttributeSelect?: (attribute: Attribute) => void;
  isPlayerTurn?: boolean;
  highlightedAttribute?: Attribute | null;
  isWinner?: boolean;
  isLoser?: boolean;
  advantageBonus?: { attribute: Attribute; bonus: number };
}

const attributeIcons: Record<Attribute, React.ReactNode> = {
  [Attribute.Reatividade]:  <ReactivityIcon />,
  [Attribute.MassaAtomica]: <AtomicMassIcon />,
  [Attribute.Radioatividade]: <RadioactivityIcon />,
  [Attribute.Condutividade]: <ConductivityIcon />,
  [Attribute.Dureza]: <HardnessIcon />,
};

const elementHue: Partial<Record<ElementType, number>> = {
  [ElementType.AlkaliMetal]:        5,
  [ElementType.Halogen]:           280,
  [ElementType.Actinide]:          100,
  [ElementType.TransitionMetal]:   220,
  [ElementType.NobleGas]:          180,
  [ElementType.AlkalineEarthMetal]: 30,
  [ElementType.Lanthanide]:        250,
  [ElementType.PostTransitionMetal]:200,
  [ElementType.Metalloid]:         140,
  [ElementType.ReactiveNonmetal]:   55,
};

const CardFaceUp: React.FC<Omit<CardProps, 'isFaceDown'>> = ({
  card, onAttributeSelect, isPlayerTurn, highlightedAttribute, isWinner, isLoser, advantageBonus,
}) => {
  if (!card) return null;

  const hue = elementHue[card.element] ?? 220;
  const isST = !!card.isSuperTrunfo;

  const glow = isWinner
    ? '0 0 0 1px #1a0e04, 0 0 0 4px #50dc78, 0 0 0 5px #1a0e04, 0 0 40px rgba(80,220,120,.6)'
    : isLoser
    ? '0 0 0 1px #1a0e04, 0 0 0 3px #d94a4a, 0 0 0 4px #1a0e04, 0 0 30px rgba(217,74,74,.5)'
    : isST
    ? '0 0 0 1px #1a0e04, 0 0 0 4px #f4c349, 0 0 0 5px #1a0e04, 0 0 30px rgba(244,195,73,.7)'
    : '0 0 0 1px #1a0e04, 0 0 0 3px #c9a14a, 0 0 0 4px #1a0e04, 0 8px 24px rgba(0,0,0,.6)';

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #f5ecd4 0%, #e8dab8 30%, #f5ecd4 60%, #d8c89a 100%)',
      border: '2px solid #c9a14a',
      boxShadow: glow,
      display: 'flex', flexDirection: 'column',
      position: 'relative',
      opacity: isLoser ? 0.75 : 1,
      transition: 'box-shadow 0.5s, opacity 0.5s',
    }}>
      {/* Pediment triangle cap */}
      <div style={{
        position: 'absolute', top: -1, left: -1, right: -1, height: 28,
        background: isST
          ? 'linear-gradient(180deg,#f4c349,#8a6a2a)'
          : 'linear-gradient(180deg,#c9a14a,#6a4010)',
        clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
        zIndex: 2,
      }} />

      {/* Header */}
      <div style={{
        padding: '28px 10px 5px', textAlign: 'center',
        borderBottom: '1px solid rgba(201,161,74,.3)',
        background: 'rgba(138,107,42,.06)',
      }}>
        <div style={{
          fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '.35em',
          color: isST ? '#f4c349' : '#8a6a2a', fontWeight: 700,
        }}>
          {isST ? '★ SUPER TRUNFO ★' : `Nº ${card.id.padStart(3, '0')}`}
        </div>
        <div style={{
          fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 13, color: '#1a0e04',
          letterSpacing: '.03em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          paddingTop: 1,
        }}>{card.name.toUpperCase()}</div>
      </div>

      {/* Portrait */}
      <div style={{
        flex: 1, margin: '6px 8px', position: 'relative',
        background: `radial-gradient(circle at 50% 60%, hsl(${hue} 50% 22%) 0%, hsl(${hue} 40% 10%) 100%)`,
        border: '2px solid #1a0e04',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 0 1px rgba(201,161,74,.5)',
        minHeight: 0,
      }}>
        <div style={{ position: 'absolute', inset: 4, border: '1px solid rgba(244,195,73,.2)', zIndex: 3, pointerEvents: 'none' }} />
        <img src={card.imageUrl} alt={card.name} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: '50% 0%', zIndex: 1,
        }} />
      </div>

      {/* Attribute rows */}
      <div style={{ padding: '0 8px 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Object.entries(card.attributes).map(([key, value]) => {
          const attribute = key as Attribute;
          const canSelect = !!(onAttributeSelect && isPlayerTurn);
          const isHigh = attribute === highlightedAttribute;
          const hasAdv = advantageBonus?.attribute === attribute;

          return (
            <button
              key={attribute}
              onClick={() => canSelect && onAttributeSelect!(attribute)}
              disabled={!canSelect}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '4px 8px',
                background: isHigh
                  ? 'linear-gradient(90deg, rgba(244,195,73,.28), rgba(244,195,73,.1))'
                  : 'rgba(201,161,74,.1)',
                border: isHigh
                  ? '1px solid rgba(244,195,73,.75)'
                  : hasAdv
                  ? '1px solid rgba(80,220,120,.55)'
                  : '1px solid rgba(138,107,42,.2)',
                boxShadow: isHigh ? '0 0 8px rgba(244,195,73,.35)' : 'none',
                cursor: canSelect ? 'pointer' : 'default',
                transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6a4a10' }}>
                {attributeIcons[attribute]}
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.1em', color: '#3a2a0a', fontWeight: 700 }}>
                  {attribute}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {hasAdv && (
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#50dc78', fontWeight: 700 }}>
                    +{advantageBonus!.bonus}
                  </span>
                )}
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 14, color: '#1a0e04' }}>
                  {value}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const CardFaceDown: React.FC = () => (
  <div style={{
    width: '100%', height: '100%',
    background: 'linear-gradient(135deg, #0e0608 0%, #06030a 50%, #0a0305 100%)',
    border: '2px solid #c9a14a',
    boxShadow: '0 0 0 1px #1a0e04, 0 0 0 3px #c9a14a, 0 0 0 4px #1a0e04, 0 0 20px rgba(244,195,73,.15)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  }}>
    <div style={{ position: 'absolute', inset: 8,  border: '1px solid rgba(244,195,73,.12)' }} />
    <div style={{ position: 'absolute', inset: 18, border: '1px solid rgba(244,195,73,.06)' }} />
    <div style={{
      width: 68, height: 68, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(244,195,73,.2) 0%, transparent 70%)',
      border: '1px solid rgba(244,195,73,.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 20px rgba(244,195,73,.15)',
      marginBottom: 12,
    }}>
      <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 30, color: 'rgba(244,195,73,.7)' }}>Ω</span>
    </div>
    <div style={{
      fontFamily: 'Cinzel, serif', fontSize: 7, letterSpacing: '.3em',
      color: 'rgba(244,195,73,.4)', textAlign: 'center', lineHeight: 2,
    }}>CAVALEIROS<br />DOS ELEMENTOS</div>
  </div>
);

export const Card: React.FC<CardProps> = (props) => {
  const { card, isFaceDown } = props;
  if (!card && !isFaceDown) return <div style={{ width: 288, height: 448 }} />;

  return (
    <div className="w-72 h-[28rem] card-container">
      <div className={`card-flipper ${isFaceDown ? 'is-flipped' : ''}`}>
        <div className="card-face">
          <CardFaceUp {...props} />
        </div>
        <div className="card-face card-back">
          <CardFaceDown />
        </div>
      </div>
    </div>
  );
};
