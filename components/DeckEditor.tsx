import React, { useState } from 'react';
import { CardData } from '../types';
import { useIsMobile } from '../utils/mobile';

interface DeckEditorProps {
  cardPool: CardData[];
  onSave: (selected: CardData[]) => void;
  onBack: () => void;
}

const rarityColor = (card: CardData) =>
  card.isSuperTrunfo ? '#f4c349' : '#9aa6c4';

const CardMini: React.FC<{ card: CardData; selected: boolean; onClick: () => void }> = ({ card, selected, onClick }) => {
  const rc = rarityColor(card);
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', padding: '10px 8px', cursor: 'pointer',
        background: selected
          ? 'linear-gradient(180deg, rgba(244,195,73,.18), rgba(10,5,0,.7))'
          : 'linear-gradient(180deg, rgba(20,8,10,.85), rgba(10,5,0,.6))',
        border: selected ? `2px solid ${rc}` : '1px solid rgba(244,195,73,.2)',
        boxShadow: selected ? `0 0 12px ${rc}44` : 'none',
        opacity: selected ? 1 : 0.5,
        transition: 'all 0.2s',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}
    >
      {selected && (
        <div style={{
          position: 'absolute', top: 4, right: 4,
          width: 16, height: 16, borderRadius: '50%',
          background: '#f4c349', color: '#1a0e04',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 10,
        }}>✓</div>
      )}
      <div style={{
        width: 48, height: 68, overflow: 'hidden', position: 'relative',
        border: `1.5px solid ${rc}`,
      }}>
        <img
          src={card.imageUrl}
          alt={card.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        {card.isSuperTrunfo && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(244,195,73,.2)',
            fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 20, color: '#f4c349',
          }}>♛</div>
        )}
      </div>
      <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 9, letterSpacing: '.12em', color: '#fff8e1', textAlign: 'center', lineHeight: 1.2 }}>
        {card.name.toUpperCase()}
      </div>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 7, letterSpacing: '.2em', color: rc }}>
        {card.isSuperTrunfo ? 'LENDÁRIO' : card.element.toUpperCase().slice(0, 8)}
      </div>
    </div>
  );
};

export const DeckEditor: React.FC<DeckEditorProps> = ({ cardPool, onSave, onBack }) => {
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<Set<string>>(new Set(cardPool.map(c => c.id)));

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 2) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedCards = cardPool.filter(c => selected.has(c.id));
  const superTrunfoCount = selectedCards.filter(c => c.isSuperTrunfo).length;
  const canSave = selected.size >= 2 && superTrunfoCount <= 1;

  const validationMsg = superTrunfoCount > 1
    ? 'Máximo 1 Super Trunfo por deck'
    : selected.size < 2
    ? 'Selecione pelo menos 2 cartas'
    : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #06030a 0%, #0a0500 40%, #06030a 100%)',
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
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.4em', color: '#f4c349' }}>· EDITOR DE BARALHO ·</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: isMobile ? 16 : 22, letterSpacing: '.08em', color: '#fff8e1', marginTop: 2 }}>
            {selected.size} <span style={{ color: 'rgba(255,236,196,.5)', fontWeight: 400, fontSize: 14 }}>de</span> {cardPool.length} CARTAS
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {validationMsg && (
            <span style={{ fontFamily: 'Spectral, serif', fontSize: 12, color: '#d94a4a', maxWidth: 200, textAlign: 'right' }}>
              {validationMsg}
            </span>
          )}
          <button
            onClick={() => canSave && onSave(selectedCards)}
            disabled={!canSave}
            style={{
              padding: '10px 22px', cursor: canSave ? 'pointer' : 'not-allowed',
              fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 10, letterSpacing: '.3em',
              background: canSave ? 'linear-gradient(180deg,#f4c349,#8a6a2a)' : 'rgba(244,195,73,.2)',
              color: canSave ? '#1a0e04' : 'rgba(244,195,73,.4)',
              border: '1px solid rgba(244,195,73,.4)',
              boxShadow: canSave ? '0 0 14px rgba(244,195,73,.4)' : 'none',
            }}
          >SALVAR</button>
          <button
            onClick={onBack}
            style={{
              padding: '10px 18px', cursor: 'pointer',
              fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 10, letterSpacing: '.3em',
              background: 'transparent', color: '#fff8e1', border: '1px solid rgba(244,195,73,.35)',
            }}
          >← VOLTAR</button>
        </div>
      </div>

      {/* Controls */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '16px 16px 40px' : '24px 36px 60px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelected(new Set(cardPool.map(c => c.id)))}
            style={{
              padding: '6px 14px', cursor: 'pointer',
              fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.3em',
              background: 'transparent', color: 'rgba(244,195,73,.7)', border: '1px solid rgba(244,195,73,.25)',
            }}
          >SELECIONAR TODOS</button>
          <button
            onClick={() => setSelected(new Set(cardPool.filter(c => c.isSuperTrunfo).map(c => c.id).slice(0, 1)))}
            style={{
              padding: '6px 14px', cursor: 'pointer',
              fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.3em',
              background: 'transparent', color: 'rgba(244,195,73,.7)', border: '1px solid rgba(244,195,73,.25)',
            }}
          >LIMPAR</button>
        </div>

        {/* Card grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: 10,
        }}>
          {cardPool.map(card => (
            <CardMini
              key={card.id}
              card={card}
              selected={selected.has(card.id)}
              onClick={() => toggle(card.id)}
            />
          ))}
        </div>

        {cardPool.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: 'Spectral, serif', fontSize: 16, color: 'rgba(255,236,196,.5)' }}>
            Nenhuma carta disponível. O administrador deve adicionar cartas primeiro.
          </div>
        )}
      </div>
    </div>
  );
};
