
import React, { useState } from 'react';
import { CardData, Attribute, ElementType } from '../types';

interface AdminPanelProps {
  cards: CardData[];
  onSave: (card: CardData) => void;
  onDelete: (cardId: string) => void;
  onBack: () => void;
}

const emptyCard: Omit<CardData, 'id'> = {
  name: '',
  imageUrl: 'https://picsum.photos/seed/new/400/600',
  element: ElementType.TransitionMetal,
  attributes: {
    [Attribute.Reatividade]: 50,
    [Attribute.MassaAtomica]: 50,
    [Attribute.Radioatividade]: 0,
    [Attribute.Condutividade]: 50,
    [Attribute.Dureza]: 50,
  },
  isSuperTrunfo: false,
};

// ─── Aurum Sanctum style helpers ────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px',
  background: 'rgba(10,5,0,.6)',
  border: '1px solid rgba(244,195,73,.25)',
  color: '#fff8e1',
  fontFamily: 'Spectral, serif', fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: 4,
  fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.3em',
  color: 'rgba(244,195,73,.7)', fontWeight: 700,
};

const btnPrimary: React.CSSProperties = {
  fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 10, letterSpacing: '.3em',
  color: '#1a0e04', padding: '10px 20px', cursor: 'pointer',
  background: 'linear-gradient(180deg,#f4c349,#8a6a2a)',
  border: '1px solid #f4c349',
  boxShadow: '0 0 12px rgba(244,195,73,.3)',
};

const btnGhost: React.CSSProperties = {
  fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 10, letterSpacing: '.3em',
  color: '#fff8e1', padding: '10px 20px', cursor: 'pointer',
  background: 'transparent',
  border: '1px solid rgba(244,195,73,.4)',
};

const btnEdit: React.CSSProperties = {
  fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.2em',
  color: '#f4c349', padding: '5px 10px', cursor: 'pointer',
  background: 'transparent',
  border: '1px solid rgba(244,195,73,.5)',
};

const btnDanger: React.CSSProperties = {
  fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.2em',
  color: '#ff8a8a', padding: '5px 10px', cursor: 'pointer',
  background: 'rgba(120,20,20,.4)',
  border: '1px solid rgba(217,74,74,.5)',
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ cards, onSave, onDelete, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | Omit<CardData, 'id'>>({ ...emptyCard });
  const [isNew, setIsNew] = useState(true);

  const handleOpenModal = (card?: CardData) => {
    if (card) {
      setEditingCard(JSON.parse(JSON.stringify(card)));
      setIsNew(false);
    } else {
      setEditingCard({ ...emptyCard });
      setIsNew(true);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isAttribute = Object.values(Attribute).includes(name as Attribute);
    if (isAttribute) {
      setEditingCard(prev => ({ ...prev, attributes: { ...prev.attributes, [name]: Number(value) || 0 } }));
    } else if (type === 'checkbox') {
      setEditingCard(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setEditingCard(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let cardToSave = editingCard as CardData;
    if (isNew) {
      const highestId = cards.reduce((max, c) => {
        const n = parseInt(c.id, 10);
        return !isNaN(n) && n > max ? n : max;
      }, 0);
      cardToSave = { ...editingCard, id: (highestId + 1).toString() } as CardData;
    }
    onSave(cardToSave);
    handleCloseModal();
  };

  return (
    <div style={{
      width: '100%', maxWidth: 1100,
      background: 'linear-gradient(180deg, rgba(20,8,10,.9), rgba(10,5,0,.75))',
      border: '1px solid rgba(244,195,73,.3)',
      padding: '36px 40px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <span style={{ width: 36, height: 1, background: '#f4c349', display: 'block' }} />
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.5em', color: '#f4c349' }}>· ADMIN ·</span>
          <span style={{ width: 36, height: 1, background: '#f4c349', display: 'block' }} />
        </div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 36, letterSpacing: '.08em', color: '#fff8e1', margin: 0 }}>
          PAINEL DO ADMINISTRADOR
        </h1>
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={onBack} style={btnGhost}>← VOLTAR</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 20, color: '#fff8e1' }}>
            {cards.length} cartas
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.3em', color: 'rgba(244,195,73,.6)', marginTop: 2 }}>
            NO BARALHO
          </div>
        </div>
        <button onClick={() => handleOpenModal()} style={btnPrimary}>+ NOVA CARTA</button>
      </div>

      {/* Card grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 10, maxHeight: '55vh', overflowY: 'auto',
        padding: '14px', background: 'rgba(6,3,10,.5)',
        border: '1px solid rgba(244,195,73,.15)',
      }}>
        {cards.map(card => (
          <div key={card.id} style={{
            background: 'linear-gradient(180deg, rgba(20,8,10,.7), rgba(10,5,0,.5))',
            border: '1px solid rgba(244,195,73,.2)',
            padding: '10px 12px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: 'rgba(244,195,73,.6)', letterSpacing: '.15em' }}>
              {card.isSuperTrunfo ? 'SUPER TRUNFO' : card.id.padStart(3, '0')}
            </div>
            <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 12, color: '#fff8e1', letterSpacing: '.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {card.name}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
              <button onClick={() => handleOpenModal(card)} style={btnEdit}>EDITAR</button>
              <button onClick={() => onDelete(card.id)} style={btnDanger}>EXCLUIR</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(6,3,10,.82)',
            backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 50,
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: 'linear-gradient(180deg, rgba(20,8,10,.98), rgba(10,5,0,.95))',
              border: '1px solid rgba(244,195,73,.4)',
              boxShadow: '0 0 60px rgba(244,195,73,.15)',
              padding: '32px 36px', width: '100%', maxWidth: 440,
              maxHeight: '90vh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 20, letterSpacing: '.1em', color: '#fff8e1', margin: '0 0 22px' }}>
              {isNew ? 'CRIAR NOVA CARTA' : 'EDITAR CARTA'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>NOME</label>
                <input type="text" name="name" value={editingCard.name} onChange={handleChange} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>URL DA IMAGEM</label>
                <input type="text" name="imageUrl" value={editingCard.imageUrl} onChange={handleChange} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>GRUPO QUÍMICO</label>
                <select name="element" value={editingCard.element} onChange={handleChange} style={{ ...inputStyle }}>
                  {Object.values(ElementType).map(el => <option key={el} value={el}>{el}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                {(Object.keys(editingCard.attributes) as Attribute[]).map(attr => (
                  <div key={attr}>
                    <label htmlFor={attr} style={labelStyle}>{attr}</label>
                    <input
                      type="number" id={attr} name={attr}
                      value={editingCard.attributes[attr as keyof typeof editingCard.attributes]}
                      onChange={handleChange} style={inputStyle}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
                <input
                  type="checkbox" id="isSuperTrunfo" name="isSuperTrunfo"
                  checked={editingCard.isSuperTrunfo} onChange={handleChange}
                  style={{ width: 16, height: 16, accentColor: '#f4c349' }}
                />
                <label htmlFor="isSuperTrunfo" style={{ ...labelStyle, margin: 0, letterSpacing: '.2em', color: '#fff8e1' }}>
                  É SUPER TRUNFO?
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
                <button type="button" onClick={handleCloseModal} style={btnGhost}>CANCELAR</button>
                <button type="submit" style={btnPrimary}>SALVAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
