/**
 * Componente de conexão visual entre atributos comparados
 * Mostra uma linha/seta conectando os dois atributos sendo comparados
 */
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { BattleAttribute } from '@/hooks/battle/useBattleLogic';

interface AttributeConnectionProps {
  selectedAttribute: BattleAttribute | null;
  playerValue: number;
  opponentValue: number;
  isVisible: boolean;
}

const AttributeConnection = ({ 
  selectedAttribute, 
  playerValue, 
  opponentValue,
  isVisible 
}: AttributeConnectionProps) => {
  if (!isVisible || !selectedAttribute) return null;

  // Determinar resultado da comparação
  const getResult = () => {
    if (playerValue > opponentValue) return 'win';
    if (playerValue < opponentValue) return 'lose';
    return 'draw';
  };

  const result = getResult();

  // Cores baseadas no resultado
  const getColor = () => {
    switch (result) {
      case 'win': return 'from-green-500 to-emerald-400';
      case 'lose': return 'from-red-500 to-rose-400';
      case 'draw': return 'from-yellow-500 to-amber-400';
    }
  };

  // Ícone baseado no resultado
  const getIcon = () => {
    switch (result) {
      case 'win': return <TrendingUp className="w-6 h-6" />;
      case 'lose': return <TrendingDown className="w-6 h-6" />;
      case 'draw': return <Minus className="w-6 h-6" />;
    }
  };

  // Texto do resultado
  const getResultText = () => {
    switch (result) {
      case 'win': return 'VOCÊ VENCE!';
      case 'lose': return 'ADVERSÁRIO VENCE!';
      case 'draw': return 'EMPATE!';
    }
  };

  const formatValue = (attribute: BattleAttribute, value: number) => {
    switch (attribute) {
      case 'atomic_mass':
        return value.toFixed(3);
      case 'density':
        return `${value} g/cm³`;
      case 'melting_point':
        return `${Math.abs(value)}°C`;
      case 'reactivity':
      case 'radioactivity':
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-4 pointer-events-none"
    >
      {/* Banner de resultado compacto */}
      <div className={`
        mx-auto max-w-2xl px-6 py-4 rounded-xl
        bg-gradient-to-r ${getColor()}
        shadow-2xl border-2 border-white/20
        backdrop-blur-lg
      `}>
        <div className="flex items-center justify-between gap-6">
          {/* Valor do jogador */}
          <div className="flex-1 text-center">
            <div className="text-xs text-white/80 font-medium mb-1">Seu Valor</div>
            <div className={`text-2xl font-bold ${
              result === 'win' ? 'text-white' : 'text-white/60'
            }`}>
              {formatValue(selectedAttribute, playerValue)}
            </div>
          </div>

          {/* Resultado central */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex flex-col items-center px-4"
          >
            <div className="text-white text-3xl mb-1">
              {getIcon()}
            </div>
            <div className="text-xs font-bold text-white whitespace-nowrap">
              {getResultText()}
            </div>
          </motion.div>

          {/* Valor do adversário */}
          <div className="flex-1 text-center">
            <div className="text-xs text-white/80 font-medium mb-1">Adversário</div>
            <div className={`text-2xl font-bold ${
              result === 'lose' ? 'text-white' : 'text-white/60'
            }`}>
              {formatValue(selectedAttribute, opponentValue)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AttributeConnection;
