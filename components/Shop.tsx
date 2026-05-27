import React, { useState } from 'react';
import { CardData, Attribute } from '../types';
import { PlayerCurrency } from '../utils/supabase';
import { useIsMobile } from '../utils/mobile';

interface ShopProps {
  deck: CardData[];
  currency: PlayerCurrency;
  onForge: (cardId: string, attr: Attribute) => void;
  onBack: () => void;
}

const FORGE_COSTS: [number, number, number] = [100, 250, 500];
const FORGE_BONUS = 8;

const attributeIcons: Record<Attribute, string> = {
  [Attribute.Reatividade]:    '⚡',
  [Attribute.MassaAtomica]:   '⊕',
  [Attribute.Radioatividade]: '☢',
  [Attribute.Condutividade]:  '◈',
  [Attribute.Dureza]:         '◆',
};

const ForgeLevelBadge: React.FC<{ level: number }> = ({ level }) => {
  if (!level) return null;
  return (
    <div style={{
      position: 'absolute', top: 3, left: 3, zIndex: 2,
      background: 'linear-gradient(135deg,#f4c349,#8a6a2a)',
      color: '#1a0e04', fontFamily: 'IBM Plex Mono, monospace',
      fontWeight: 900, fontSize: 8, padding: '1px 5px', letterSpacing: '.1em',
    }}>⚡{level}</div>
  );
};

export const Shop: React.FC<ShopProps> = ({ deck, currency, onForge, onBack }) => {
  const isMobile = useIsMobile();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<Attribute | null>(null);

  const selectedCard = deck.find(c => c.id === selectedId) ?? null;
  const forgeLevel = selectedCard?.forgeLevel ?? 0;
  const cost = forgeLevel < 3 ? FORGE_COSTS[forgeLevel] : null;
  const canAfford = cost !== null && currency.cosmo >= cost;
  const maxed = forgeLevel >= 3;

  const handleConfirm = () => {
    if (!selectedCard || !confirming || !canAfford) return;
    onForge(selectedCard.id, confirming);
    setConfirming(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg,#06030a 0%,#0a0300 50%,#06030a 100%)',
      color: '#fff8e1',
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: isMobile ? '12px 16px' : '14px 36px',
        background: 'rgba(10,5,0,.95)', borderBottom: '2px solid #f4c349',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.4em', color: '#f4c349' }}>· FORJA DOS CAVALEIROS ·</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: isMobile ? 16 : 20, color: '#fff8e1', marginTop: 2 }}>
            MELHORIAS PERMANENTES
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', background: 'rgba(244,195,73,.1)', border: '1px solid rgba(244,195,73,.3)',
          }}>
            <span style={{ fontSize: 14 }}>🪙</span>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 15, color: '#f4c349' }}>{currency.cosmo}</span>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '.2em', color: 'rgba(244,195,73,.6)' }}>COSMO</span>
          </div>
          <button onClick={onBack} style={{
            padding: '10px 18px', cursor: 'pointer',
            fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 10, letterSpacing: '.3em',
            background: 'transparent', color: '#fff8e1', border: '1px solid rgba(244,195,73,.35)',
          }}>← VOLTAR</button>
        </div>
      </div>

      <div style={{
        maxWidth: 1400, margin: '0 auto',
        padding: isMobile ? '16px' : '24px 36px',
        display: 'grid',
        gridTemplateColumns: selectedCard && !isMobile ? '1fr 320px' : '1fr',
        gap: 24, alignItems: 'start',
      }}>
        {/* Card grid */}
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.4em', color: 'rgba(244,195,73,.5)', marginBottom: 12 }}>
            · SELECIONE UM CAVALEIRO PARA FORJAR ·
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(3,1fr)' : 'repeat(auto-fill,minmax(105px,1fr))',
            gap: 8,
          }}>
            {deck.map(card => {
              const lvl = card.forgeLevel ?? 0;
              const isSelected = card.id === selectedId;
              return (
                <div
                  key={card.id}
                  onClick={() => { setSelectedId(card.id === selectedId ? null : card.id); setConfirming(null); }}
                  style={{
                    position: 'relative', padding: '8px 6px', cursor: 'pointer',
                    background: isSelected
                      ? 'linear-gradient(180deg,rgba(244,195,73,.22),rgba(10,5,0,.7))'
                      : 'linear-gradient(180deg,rgba(20,8,10,.85),rgba(10,5,0,.6))',
                    border: isSelected ? '2px solid #f4c349' : lvl > 0 ? '1px solid rgba(244,195,73,.4)' : '1px solid rgba(244,195,73,.15)',
                    boxShadow: isSelected ? '0 0 14px rgba(244,195,73,.3)' : 'none',
                    transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  }}
                >
                  <ForgeLevelBadge level={lvl} />
                  <div style={{ width: 48, height: 66, overflow: 'hidden', border: `1.5px solid ${lvl > 0 ? '#f4c349' : 'rgba(201,161,74,.4)'}` }}>
                    <img src={card.imageUrl} alt={card.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 8, letterSpacing: '.1em', color: '#fff8e1', textAlign: 'center', lineHeight: 1.2 }}>
                    {card.name.toUpperCase()}
                  </div>
                  {lvl >= 3 && (
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 7, color: '#f4c349' }}>MÁXIMO</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Forge panel */}
        {selectedCard && (
          <div style={{
            background: 'rgba(10,5,0,.8)', border: '1px solid rgba(244,195,73,.3)',
            padding: isMobile ? '16px' : '20px',
            position: isMobile ? 'static' : 'sticky', top: 80,
          }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '.4em', color: '#f4c349', marginBottom: 4 }}>· FORJA ·</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 18, color: '#fff8e1', marginBottom: 4 }}>
              {selectedCard.name.toUpperCase()}
            </div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.2em', color: 'rgba(244,195,73,.55)', marginBottom: 16 }}>
              {selectedCard.element.toUpperCase()}
            </div>

            {/* Forge level indicator */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  flex: 1, height: 4,
                  background: i < forgeLevel ? '#f4c349' : 'rgba(244,195,73,.2)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'rgba(244,195,73,.6)', marginBottom: 20 }}>
              {maxed ? 'NÍVEL MÁXIMO ATINGIDO' : `NÍVEL ${forgeLevel}/3 · PRÓXIMO: ${cost} Cosmo`}
            </div>

            {!maxed && (
              <>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '.3em', color: 'rgba(255,236,196,.5)', marginBottom: 10 }}>
                  ESCOLHA O ATRIBUTO A MELHORAR (+{FORGE_BONUS})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {(Object.keys(selectedCard.attributes) as Attribute[]).map(attr => {
                    const current = selectedCard.attributes[attr];
                    const isConfirming = confirming === attr;
                    return (
                      <button
                        key={attr}
                        onClick={() => setConfirming(isConfirming ? null : attr)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 10px', cursor: 'pointer',
                          background: isConfirming ? 'rgba(244,195,73,.15)' : 'rgba(201,161,74,.07)',
                          border: isConfirming ? '1px solid rgba(244,195,73,.7)' : '1px solid rgba(138,107,42,.25)',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.1em', color: '#fff8e1' }}>
                          {attributeIcons[attr]} {attr}
                        </span>
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: isConfirming ? '#f4c349' : 'rgba(255,236,196,.7)' }}>
                          {current}
                          {isConfirming && <span style={{ color: '#50dc78' }}> → {current + FORGE_BONUS}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {confirming && (
                  <button
                    onClick={handleConfirm}
                    disabled={!canAfford}
                    style={{
                      width: '100%', padding: '12px', cursor: canAfford ? 'pointer' : 'not-allowed',
                      fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 11, letterSpacing: '.3em',
                      background: canAfford
                        ? 'linear-gradient(180deg,#f4c349,#8a6a2a)'
                        : 'rgba(244,195,73,.15)',
                      color: canAfford ? '#1a0e04' : 'rgba(244,195,73,.4)',
                      border: '1px solid rgba(244,195,73,.4)',
                      boxShadow: canAfford ? '0 0 14px rgba(244,195,73,.35)' : 'none',
                    }}
                  >
                    {canAfford
                      ? `⚡ FORJAR — ${cost} Cosmo`
                      : `Cosmo insuficiente (${cost} necessário)`}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        maxWidth: 1400, margin: '0 auto', padding: isMobile ? '0 16px 40px' : '0 36px 40px',
      }}>
        <div style={{
          padding: '12px 16px', background: 'rgba(10,5,0,.5)', border: '1px solid rgba(244,195,73,.12)',
          fontFamily: 'Spectral, serif', fontSize: 12, color: 'rgba(255,236,196,.55)', lineHeight: 1.7,
        }}>
          <strong style={{ color: 'rgba(244,195,73,.7)', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.3em' }}>· COMO FUNCIONA ·</strong><br />
          Cada cavaleiro pode ser forjado até 3 vezes. Cada forja adiciona +{FORGE_BONUS} a um atributo de sua escolha, de forma permanente.
          O custo aumenta por forja: {FORGE_COSTS[0]} · {FORGE_COSTS[1]} · {FORGE_COSTS[2]} Cosmo.
          Cartas forjadas exibem um badge ⚡ com o nível de forja.
        </div>
      </div>
    </div>
  );
};
