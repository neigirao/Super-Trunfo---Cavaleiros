
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


const attributeIcons: { [key in Attribute]: React.ReactNode } = {
  [Attribute.Reatividade]: <ReactivityIcon />,
  [Attribute.MassaAtomica]: <AtomicMassIcon />,
  [Attribute.Radioatividade]: <RadioactivityIcon />,
  [Attribute.Condutividade]: <ConductivityIcon />,
  [Attribute.Dureza]: <HardnessIcon />,
};

const getElementStyles = (element: ElementType) => {
    switch (element) {
        case ElementType.AlkaliMetal: return { // Explosivo / Fogo
            cardClasses: 'border-red-500 bg-gradient-to-b from-red-900/50 to-slate-800',
            headerClasses: 'bg-red-950/50',
            idTextClasses: 'text-red-300'
        };
        case ElementType.Halogen: return { // Corrosivo / Sombra
            cardClasses: 'border-purple-500 bg-gradient-to-b from-purple-900/50 to-slate-800',
            headerClasses: 'bg-purple-950/50',
            idTextClasses: 'text-purple-300'
        };
         case ElementType.Actinide: return { // Radioativo / Sombra esverdeada
            cardClasses: 'border-lime-400 bg-gradient-to-b from-lime-900/50 to-slate-800',
            headerClasses: 'bg-lime-950/50',
            idTextClasses: 'text-lime-300'
        };
        case ElementType.TransitionMetal: return { // Pilar / Terra
            cardClasses: 'border-slate-400 bg-gradient-to-b from-slate-700/50 to-slate-800',
            headerClasses: 'bg-slate-950/50',
            idTextClasses: 'text-slate-300'
        };
         case ElementType.NobleGas: return { // Intocável / Ar
            cardClasses: 'border-cyan-400 bg-gradient-to-b from-cyan-800/50 to-slate-800',
            headerClasses: 'bg-cyan-950/50',
            idTextClasses: 'text-cyan-300'
        };
        // Estilos para os outros grupos (sem vantagens diretas, mas com identidade visual)
        case ElementType.AlkalineEarthMetal: return {
             cardClasses: 'border-orange-400 bg-gradient-to-b from-orange-900/50 to-slate-800',
             headerClasses: 'bg-orange-950/50', idTextClasses: 'text-orange-300'
        };
        case ElementType.Lanthanide: return {
            cardClasses: 'border-indigo-400 bg-gradient-to-b from-indigo-900/50 to-slate-800',
            headerClasses: 'bg-indigo-950/50', idTextClasses: 'text-indigo-300'
        };
        case ElementType.PostTransitionMetal: return {
            cardClasses: 'border-gray-400 bg-gradient-to-b from-gray-600/50 to-slate-800',
            headerClasses: 'bg-gray-800/50', idTextClasses: 'text-gray-300'
        };
        case ElementType.Metalloid: return {
            cardClasses: 'border-green-500 bg-gradient-to-b from-green-900/50 to-slate-800',
            headerClasses: 'bg-green-950/50', idTextClasses: 'text-green-300'
        };
        case ElementType.ReactiveNonmetal: return {
            cardClasses: 'border-yellow-300 bg-gradient-to-b from-yellow-800/40 to-slate-800',
            headerClasses: 'bg-yellow-950/40', idTextClasses: 'text-yellow-200'
        };
        default: return {
            cardClasses: 'border-gray-500 bg-slate-800',
            headerClasses: 'bg-slate-900',
            idTextClasses: 'text-cyan-400'
        };
    }
};

const CardFaceUp: React.FC<Omit<CardProps, 'isFaceDown'>> = ({ card, onAttributeSelect, isPlayerTurn, highlightedAttribute, isWinner, isLoser, advantageBonus }) => {
  if (!card) return null;

  const elementStyles = getElementStyles(card.element);
  
  let animationClasses = '';
  if (isWinner === true) {
      animationClasses = 'border-green-400 animate-pulse ring-4 ring-green-500/50';
  } else if (isLoser === true) {
      animationClasses = 'border-red-400 animate-shake grayscale';
  }

  return (
    <div className={`w-full h-full rounded-xl flex flex-col p-2 shadow-2xl transition-transform duration-500 ${isPlayerTurn ? 'hover:scale-105 hover:shadow-cyan-500/50' : ''} border-4 ${elementStyles.cardClasses} ${animationClasses}`}>
      <div className={`${elementStyles.headerClasses} rounded-t-lg p-2 text-center`}>
        <p className={`text-xs font-bold uppercase ${card.isSuperTrunfo ? 'text-yellow-400' : elementStyles.idTextClasses}`}>{card.isSuperTrunfo ? 'SUPER TRUNFO' : `Elemento #${card.id}`}</p>
        <h3 className="text-lg font-bold font-cinzel truncate">{card.name}</h3>
      </div>
      <div className="flex-grow bg-black rounded-md overflow-hidden my-2">
        <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col space-y-1 text-sm">
        {Object.entries(card.attributes).map(([key, value]) => {
          const attribute = key as Attribute;
          const canSelect = onAttributeSelect && isPlayerTurn;
          const isHighlighted = attribute === highlightedAttribute;
          const hasAdvantage = advantageBonus?.attribute === attribute;

          return (
            <button
              key={attribute}
              onClick={() => canSelect && onAttributeSelect(attribute)}
              disabled={!canSelect}
              className={`flex items-center justify-between p-1.5 rounded-md transition-all duration-200 relative ${
                canSelect ? 'cursor-pointer hover:bg-cyan-500/20' : 'cursor-default'
              } ${
                isHighlighted ? 'bg-yellow-500/30 ring-2 ring-yellow-400' : 'bg-slate-700/50'
              } ${
                hasAdvantage ? 'ring-2 ring-green-400' : ''
              }`}
            >
              <div className="flex items-center">
                {attributeIcons[attribute]}
                <span className="font-semibold">{attribute}</span>
              </div>
              <div className="flex items-center">
                {hasAdvantage && (
                    <span className="text-green-400 text-xs font-bold mr-2">
                        +{advantageBonus.bonus}
                    </span>
                )}
                <span className="font-bold text-lg">{value}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const CardFaceDown: React.FC = () => (
    <div className="w-full h-full bg-slate-800 border-2 border-slate-600 rounded-xl flex items-center justify-center p-4 shadow-lg">
        <div className="w-full h-full border-4 border-dashed border-slate-500 rounded-lg flex items-center justify-center">
            <h2 className="text-2xl font-cinzel text-slate-400 -rotate-12">Oponente</h2>
        </div>
    </div>
);

export const Card: React.FC<CardProps> = (props) => {
  const { card, isFaceDown } = props;
  // Permite renderizar a carta virada para baixo mesmo se os dados da carta ainda não estiverem disponíveis
  if (!card && !isFaceDown) return (
      <div className="w-72 h-[28rem]"></div>
  );

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