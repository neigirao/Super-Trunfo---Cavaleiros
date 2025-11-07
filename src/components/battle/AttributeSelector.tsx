/**
 * Componente para seleção de atributos na batalha
 */
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Atom, Zap, Shield, Flame, Star, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BattleAttribute, ElementCard } from '@/hooks/battle/useBattleLogic';

interface AttributeSelectorProps {
  card: ElementCard;
  onSelectAttribute: (attribute: BattleAttribute) => void;
  disabled?: boolean;
  selectedAttribute?: BattleAttribute | null;
}

const AttributeSelector = ({ card, onSelectAttribute, disabled, selectedAttribute }: AttributeSelectorProps) => {
  const attributes = [
    { key: 'atomic_number' as BattleAttribute, label: 'Número Atômico', icon: Atom, value: card.atomic_number },
    { key: 'atomic_mass' as BattleAttribute, label: 'Massa Atômica', icon: Shield, value: card.atomic_mass },
    { key: 'density' as BattleAttribute, label: 'Densidade', icon: Activity, value: card.density },
    { key: 'melting_point' as BattleAttribute, label: 'Ponto de Fusão', icon: Flame, value: card.melting_point },
    { key: 'reactivity' as BattleAttribute, label: 'Reatividade', icon: Zap, value: card.reactivity },
    { key: 'radioactivity' as BattleAttribute, label: 'Radioatividade', icon: Star, value: card.radioactivity },
  ];

  return (
    <div className="space-y-2">
      {attributes.map((attr, index) => {
        const Icon = attr.icon;
        const isSelected = selectedAttribute === attr.key;
        
        return (
          <motion.div
            key={attr.key}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              onClick={() => onSelectAttribute(attr.key)}
              disabled={disabled || isSelected}
              className={`w-full justify-between py-3 h-auto transition-all ${
                isSelected 
                  ? 'bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light text-cosmic-dark ring-4 ring-cosmic-gold/60 scale-[1.03] shadow-xl' 
                  : 'bg-card hover:bg-card/80'
              }`}
              variant={isSelected ? "default" : "outline"}
              style={{
                boxShadow: isSelected ? '0 0 25px hsl(var(--cosmic-gold) / 0.7)' : undefined
              }}
            >
              <span className="flex items-center space-x-3">
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{attr.label}</span>
              </span>
              <Badge 
                variant={isSelected ? "secondary" : "outline"} 
                className={`text-sm font-semibold ${isSelected ? 'bg-cosmic-dark/20 text-cosmic-dark text-base' : ''}`}
              >
                {attr.value != null ? attr.value.toFixed(2) : '0.00'}
              </Badge>
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AttributeSelector;
