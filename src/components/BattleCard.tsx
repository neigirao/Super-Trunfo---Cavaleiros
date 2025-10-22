import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Zap, Star, Crown, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RuleTooltip, { HelpIcon } from './ui/RuleTooltip';

interface ElementCard {
  id: string;
  name: string;
  symbol: string;
  atomic_number: number;
  atomic_mass: number;
  density: number;
  melting_point: number;
  reactivity: number;
  radioactivity: number;
  knight_name: string;
  special_ability: string;
  rarity: string;
  element_type: string;
  is_super_trump: boolean;
  trump_weakness?: string;
  image_url?: string;
}

type BattleAttribute = 'atomic_number' | 'atomic_mass' | 'density' | 'melting_point' | 'reactivity' | 'radioactivity';

interface BattleCardProps {
  card: ElementCard;
  onClick?: () => void;
  showAttributes?: boolean;
  selectedAttribute?: BattleAttribute | null;
  isOpponent?: boolean;
  onAttributeSelect?: (attribute: BattleAttribute) => void;
  canSelectAttribute?: boolean;
  isFlipped?: boolean;
  isTransferring?: boolean;
  transferDirection?: 'left' | 'right';
}

const BattleCard = ({ 
  card, 
  onClick, 
  showAttributes = false, 
  selectedAttribute = null,
  isOpponent = false,
  onAttributeSelect,
  canSelectAttribute = false,
  isFlipped = false,
  isTransferring = false,
  transferDirection = 'right'
}: BattleCardProps) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'cosmic-gold';
      case 'epic': return 'cosmic-purple';
      case 'rare': return 'cosmic-blue';
      default: return 'cosmic-green';
    }
  };

  const getElementTypeIcon = (elementType: string) => {
    switch (elementType) {
      case 'metal': return <Sword className="w-4 h-4" />;
      case 'non_metal': return <Shield className="w-4 h-4" />;
      case 'noble_gas': return <Zap className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getAttributeIcon = (attribute: BattleAttribute) => {
    const icons = {
      atomic_number: <Crown className="w-3 h-3" />,
      atomic_mass: <Sword className="w-3 h-3" />,
      density: <Shield className="w-3 h-3" />,
      melting_point: <Flame className="w-3 h-3" />,
      reactivity: <Zap className="w-3 h-3" />,
      radioactivity: <Star className="w-3 h-3" />
    };
    return icons[attribute];
  };

  const formatAttributeValue = (attribute: BattleAttribute, value: number) => {
    switch (attribute) {
      case 'atomic_mass':
        return value.toFixed(3);
      case 'density':
        return `${value} g/cm³`;
      case 'melting_point':
        return `${value}°C`;
      case 'reactivity':
      case 'radioactivity':
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  const cardVariants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 }
  };

  const transferVariants = {
    initial: { x: 0, scale: 1, opacity: 1 },
    transferring: {
      x: transferDirection === 'right' ? 300 : -300,
      scale: 0.8,
      opacity: 0.7
    }
  };

  return (
    <motion.div
      variants={transferVariants}
      initial="initial"
      animate={isTransferring ? "transferring" : "initial"}
      className="perspective-1000"
    >
      <motion.div
        variants={cardVariants}
        animate={isFlipped ? "back" : "front"}
        transition={{ duration: 0.6 }}
        className="preserve-3d"
      >
        <Card 
          className={`
            w-72 h-[440px] relative overflow-hidden flex flex-col
            ${onClick ? 'cursor-pointer hover:scale-[1.03] transition-all duration-300 card-hover-glow' : ''} 
            ${isOpponent ? 'bg-cosmic-purple/10 border-cosmic-purple/30' : 'bg-cosmic-gold/10 border-cosmic-gold/30'} 
            backdrop-blur-lg border-2
            ${card.is_super_trump ? 'border-cosmic-gold border-3 snap-effect' : ''}
            ${selectedAttribute ? 'transform scale-105' : ''}
            backface-hidden shadow-[var(--shadow-elevated)]
          `}
          style={{
            boxShadow: card.is_super_trump ? 'var(--glow-intense)' : undefined
          }}
          onClick={onClick}
        >
          {/* Super Trunfo Badge */}
          {card.is_super_trump && (
            <motion.div 
              className="absolute top-2 right-2 bg-cosmic-gold text-cosmic-dark px-3 py-1.5 rounded-full text-xs font-bold z-10 snap-effect"
              style={{ boxShadow: 'var(--glow-intense)' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚡ SUPER TRUNFO
            </motion.div>
          )}

          {/* Header com tipo e símbolo */}
          <div className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light p-2 text-center">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-cosmic-dark/20 border-cosmic-dark/30 text-xs">
                {getElementTypeIcon(card.element_type)}
                <span className="ml-1 capitalize">{card.element_type.replace('_', ' ')}</span>
              </Badge>
              <div className="bg-cosmic-dark/20 px-3 py-1 rounded-full">
                <span className="text-lg font-bold text-cosmic-dark">{card.symbol}</span>
              </div>
            </div>
          </div>

          {/* Imagem da carta */}
          <div className="relative h-32 bg-gradient-to-br from-cosmic-nebula/20 to-cosmic-nebula-light/20 overflow-hidden">
            {card.image_url ? (
              <img 
                src={card.image_url} 
                alt={card.knight_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cosmic-nebula/30 to-cosmic-nebula-light/30">
                <div className={`w-16 h-16 bg-gradient-to-br from-${getRarityColor(card.rarity)} to-${getRarityColor(card.rarity)}-light rounded-full flex items-center justify-center shadow-cosmic`}>
                  <span className="text-2xl font-bold text-cosmic-dark">
                    {card.symbol}
                  </span>
                </div>
              </div>
            )}
            
            {/* Overlay com rarity */}
            <div className="absolute bottom-2 left-2">
              <Badge variant="outline" className={`border-${getRarityColor(card.rarity)}/60 bg-${getRarityColor(card.rarity)}/20 text-xs`}>
                <span className="capitalize font-semibold">{card.rarity}</span>
              </Badge>
            </div>
          </div>

          {/* Nome do cavaleiro */}
          <div className="px-3 py-2 text-center bg-cosmic-dark/5">
            <h3 className="text-lg font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent">
              {card.knight_name}
            </h3>
            <p className="text-sm text-muted-foreground">{card.name}</p>
          </div>

          {/* Atributos */}
          {showAttributes && (
            <div className="px-3 py-2 space-y-1.5 flex-1 min-h-0">
              {([
                { key: 'atomic_number' as BattleAttribute, label: 'Nº Atômico' },
                { key: 'atomic_mass' as BattleAttribute, label: 'Massa Atômica' },
                { key: 'density' as BattleAttribute, label: 'Densidade' },
                { key: 'melting_point' as BattleAttribute, label: 'P. Fusão' },
                { key: 'reactivity' as BattleAttribute, label: 'Reatividade' },
                { key: 'radioactivity' as BattleAttribute, label: 'Radioatividade' }
              ]).map(({ key, label }) => (
                <motion.div 
                  key={key}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                    ${selectedAttribute === key 
                      ? 'border-2 border-cosmic-gold bg-cosmic-gold/30 scale-[1.02] ring-2 ring-cosmic-gold/50' 
                      : 'border border-primary/20 bg-card/50 hover:bg-card/70'
                    }
                    ${canSelectAttribute ? 'cursor-pointer hover:border-cosmic-gold/60 hover:scale-[1.02]' : ''}
                  `}
                  style={{
                    boxShadow: selectedAttribute === key ? 'var(--glow-intense)' : undefined
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canSelectAttribute && onAttributeSelect) {
                      onAttributeSelect(key);
                    }
                  }}
                  whileHover={canSelectAttribute ? { y: -2, boxShadow: '0 4px 12px hsl(var(--cosmic-gold) / 0.3)' } : {}}
                  whileTap={canSelectAttribute ? { scale: 0.98 } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <RuleTooltip rule="attribute">
                    <div className="flex items-center space-x-2 cursor-help">
                      {getAttributeIcon(key)}
                      <span className="font-medium">{label}</span>
                    </div>
                  </RuleTooltip>
                  <div className="font-bold text-cosmic-gold text-base">
                    {formatAttributeValue(key, card[key])}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Habilidade especial (se houver espaço) */}
          {card.special_ability && !showAttributes && (
            <div className="px-2 py-1 mt-auto">
              <div className="p-2 bg-cosmic-nebula/20 rounded border border-cosmic-gold/20">
                <div className="text-xs text-cosmic-gold font-semibold mb-1">Habilidade Especial</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{card.special_ability}</div>
              </div>
            </div>
          )}

          {/* Fraqueza do Super Trunfo */}
          {card.is_super_trump && card.trump_weakness && !showAttributes && (
            <div className="px-2 py-1">
              <div className="p-1 bg-red-500/20 rounded border border-red-500/30">
                <div className="text-xs text-red-400 font-semibold">Fraqueza: {card.trump_weakness}</div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default BattleCard;