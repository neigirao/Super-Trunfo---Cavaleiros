
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

export const AdminPanel: React.FC<AdminPanelProps> = ({ cards, onSave, onDelete, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | Omit<CardData, 'id'>>({ ...emptyCard });
  const [isNew, setIsNew] = useState(true);

  const handleOpenModal = (card?: CardData) => {
    if (card) {
      setEditingCard(JSON.parse(JSON.stringify(card))); // Deep copy
      setIsNew(false);
    } else {
      setEditingCard({ ...emptyCard });
      setIsNew(true);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    const isAttribute = Object.values(Attribute).includes(name as Attribute);

    if (isAttribute) {
        setEditingCard(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [name]: Number(value) || 0, // Fallback para 0 se o campo estiver vazio
            },
        }));
    } else if (type === 'checkbox') {
        setEditingCard(prev => ({
            ...prev,
            [name]: (e.target as HTMLInputElement).checked,
        }));
    } else {
        setEditingCard(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let cardToSave = editingCard as CardData;
    if (isNew) {
      // Find the highest numeric ID and add 1
      const highestId = cards.reduce((maxId, card) => {
          const cardId = parseInt(card.id, 10);
          return !isNaN(cardId) && cardId > maxId ? cardId : maxId;
      }, 0);
      
      cardToSave = {
          ...editingCard,
          id: (highestId + 1).toString(),
      } as CardData;
    }
    onSave(cardToSave);
    handleCloseModal();
  };

  return (
    <div className="w-full max-w-6xl p-6 bg-slate-800/50 rounded-xl border border-slate-700 shadow-2xl">
      <h1 className="text-5xl font-bold font-cinzel mb-6 text-center text-yellow-300">Painel do Administrador</h1>
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105">
            ← Voltar ao Menu
        </button>
         <div className="text-center">
            <p className="text-xl font-bold">{cards.length} Cartas no Baralho</p>
            <p className="text-sm text-slate-400">O jogo está configurado com o baralho completo da Tabela Periódica.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105">
            + Adicionar Nova Carta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-4 bg-slate-900/50 rounded-lg">
        {cards.map(card => (
          <div key={card.id} className="bg-slate-800 rounded-lg p-3 flex flex-col">
            <p className="text-xs font-bold text-cyan-400">{card.id} {card.isSuperTrunfo ? ' (ST)' : ''}</p>
            <h3 className="font-semibold truncate">{card.name}</h3>
            <div className="flex-grow"></div>
            <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => handleOpenModal(card)} className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 rounded">Editar</button>
                <button onClick={() => onDelete(card.id)} className="text-sm bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded">Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-20" onClick={handleCloseModal}>
          <div className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-cinzel mb-4">{isNew ? 'Criar Nova Carta' : 'Editar Carta'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-slate-300">Nome</label>
                    <input type="text" name="name" value={editingCard.name} onChange={handleChange} className="w-full bg-slate-700 rounded p-2 mt-1" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300">URL da Imagem</label>
                    <input type="text" name="imageUrl" value={editingCard.imageUrl} onChange={handleChange} className="w-full bg-slate-700 rounded p-2 mt-1" required/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300">Grupo Químico</label>
                    <select name="element" value={editingCard.element} onChange={handleChange} className="w-full bg-slate-700 rounded p-2 mt-1">
                        {Object.values(ElementType).map(el => <option key={el} value={el}>{el}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {(Object.keys(editingCard.attributes) as Attribute[]).map(attr => (
                         <div key={attr}>
                            <label htmlFor={attr} className="block text-sm font-medium text-slate-300">{attr}</label>
                            <input
                                type="number"
                                id={attr}
                                name={attr}
                                value={editingCard.attributes[attr as keyof typeof editingCard.attributes]}
                                onChange={handleChange}
                                className="w-full bg-slate-700 rounded p-2 mt-1"
                            />
                        </div>
                    ))}
                </div>
                 <div className="flex items-center pt-2">
                    <input type="checkbox" id="isSuperTrunfo" name="isSuperTrunfo" checked={editingCard.isSuperTrunfo} onChange={handleChange} className="h-4 w-4 rounded bg-slate-700 text-cyan-500 focus:ring-cyan-600"/>
                    <label htmlFor="isSuperTrunfo" className="ml-2 block text-sm text-slate-200">É Super Trunfo?</label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={handleCloseModal} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                    <button type="submit" className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded">Salvar</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};