import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Zap, Star, Crown, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
            ${onClick ? 'cursor-pointer hover:shadow-cosmic transition-all duration-300' : ''} 
            ${isOpponent ? 'bg-cosmic-purple/10' : 'bg-cosmic-gold/10'} 
            backdrop-blur-lg border-primary/20 
            ${card.is_super_trump ? 'border-cosmic-gold border-2 shadow-cosmic' : ''}
            ${selectedAttribute ? 'transform scale-105' : ''}
            backface-hidden
          `}
          onClick={onClick}
        >
      <CardHeader className="text-center pb-2">
        {card.is_super_trump && (
          <div className="absolute -top-2 -right-2 bg-cosmic-gold text-cosmic-dark px-2 py-1 rounded-full text-xs font-bold">
            SUPER TRUNFO
          </div>
        )}
        
        <div className="flex justify-center mb-3">
          <div className={`w-16 h-16 bg-gradient-to-br from-${getRarityColor(card.rarity)} to-${getRarityColor(card.rarity)}-light rounded-full flex items-center justify-center shadow-cosmic`}>
            <span className="text-2xl font-bold text-cosmic-dark">
              {card.symbol}
            </span>
          </div>
        </div>
        
        <CardTitle className="text-lg font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent">
          {card.knight_name}
        </CardTitle>
        
        <CardDescription className="text-sm">
          {card.name}
        </CardDescription>
        
        <div className="flex justify-center items-center space-x-2 mt-2">
          <Badge variant="outline" className="border-cosmic-gold/30 text-xs">
            {getElementTypeIcon(card.element_type)}
            <span className="ml-1 capitalize">{card.element_type.replace('_', ' ')}</span>
          </Badge>
          <Badge variant="outline" className={`border-${getRarityColor(card.rarity)}/30 text-xs`}>
            <span className="capitalize">{card.rarity}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {showAttributes && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {([
              { key: 'atomic_number' as BattleAttribute, label: 'Nº Atômico' },
              { key: 'atomic_mass' as BattleAttribute, label: 'Massa' },
              { key: 'density' as BattleAttribute, label: 'Densidade' },
              { key: 'melting_point' as BattleAttribute, label: 'P. Fusão' },
              { key: 'reactivity' as BattleAttribute, label: 'Reatividade' },
              { key: 'radioactivity' as BattleAttribute, label: 'Radioativ.' }
            ]).map(({ key, label }) => (
              <motion.div 
                key={key}
                className={`
                  p-2 rounded border text-center transition-colors
                  ${selectedAttribute === key 
                    ? 'border-cosmic-gold bg-cosmic-gold/20 shadow-cosmic' 
                    : 'border-primary/20 bg-card/50'
                  }
                  ${canSelectAttribute ? 'cursor-pointer hover:border-cosmic-gold hover:bg-cosmic-gold/10' : ''}
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  if (canSelectAttribute && onAttributeSelect) {
                    onAttributeSelect(key);
                  }
                }}
                whileHover={canSelectAttribute ? { scale: 1.05 } : {}}
                whileTap={canSelectAttribute ? { scale: 0.95 } : {}}
                transition={{ duration: 0.1 }}
              >
                <div className="flex items-center justify-center space-x-1 mb-1">
                  {getAttributeIcon(key)}
                  <span className="font-medium">{label}</span>
                </div>
                <div className="font-bold text-cosmic-gold">
                  {formatAttributeValue(key, card[key])}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {card.special_ability && (!showAttributes || selectedAttribute) && (
          <div className="p-2 bg-cosmic-nebula/20 rounded border border-cosmic-gold/20">
            <div className="text-xs text-cosmic-gold font-semibold mb-1">Habilidade Especial</div>
            <div className="text-xs text-muted-foreground">{card.special_ability}</div>
          </div>
        )}

        {card.is_super_trump && card.trump_weakness && (
          <div className="p-2 bg-red-500/20 rounded border border-red-500/30">
            <div className="text-xs text-red-400 font-semibold mb-1">Fraqueza</div>
            <div className="text-xs">Perde contra: {card.trump_weakness}</div>
          </div>
        )}
      </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default BattleCard;