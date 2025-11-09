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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
    >
      {/* Linha de conexão animada */}
      <div className="flex items-center space-x-4">
        {/* Valor do jogador */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`px-6 py-4 rounded-xl bg-gradient-to-r ${
            result === 'win' ? 'from-green-500/20 to-emerald-500/20 border-green-500' :
            result === 'lose' ? 'from-gray-500/20 to-gray-600/20 border-gray-500' :
            'from-yellow-500/20 to-amber-500/20 border-yellow-500'
          } border-2 backdrop-blur-lg`}
        >
          <div className="text-sm text-muted-foreground mb-1">Seu Valor</div>
          <div className={`text-3xl font-bold ${
            result === 'win' ? 'text-green-400' : 
            result === 'lose' ? 'text-gray-400' : 
            'text-yellow-400'
          }`}>
            {formatValue(selectedAttribute, playerValue)}
          </div>
        </motion.div>

        {/* Seta central com ícone do resultado */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className={`relative px-8 py-6 rounded-2xl bg-gradient-to-r ${getColor()} shadow-2xl`}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-white flex flex-col items-center"
          >
            {getIcon()}
            <div className="text-xs font-bold mt-2 whitespace-nowrap">
              {getResultText()}
            </div>
          </motion.div>

          {/* Partículas decorativas */}
          {result === 'win' && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-green-300 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                  }}
                  animate={{
                    x: [0, Math.cos(i * 60 * Math.PI / 180) * 40],
                    y: [0, Math.sin(i * 60 * Math.PI / 180) * 40],
                    opacity: [1, 0],
                    scale: [1, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </>
          )}
        </motion.div>

        {/* Valor do adversário */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`px-6 py-4 rounded-xl bg-gradient-to-r ${
            result === 'lose' ? 'from-red-500/20 to-rose-500/20 border-red-500' :
            result === 'win' ? 'from-gray-500/20 to-gray-600/20 border-gray-500' :
            'from-yellow-500/20 to-amber-500/20 border-yellow-500'
          } border-2 backdrop-blur-lg`}
        >
          <div className="text-sm text-muted-foreground mb-1">Adversário</div>
          <div className={`text-3xl font-bold ${
            result === 'lose' ? 'text-red-400' : 
            result === 'win' ? 'text-gray-400' : 
            'text-yellow-400'
          }`}>
            {formatValue(selectedAttribute, opponentValue)}
          </div>
        </motion.div>
      </div>

      {/* Seta animada de baixo */}
      <motion.div
        className="absolute -bottom-16 left-1/2 -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <ArrowRight 
          className={`w-12 h-12 rotate-90 ${
            result === 'win' ? 'text-green-400' :
            result === 'lose' ? 'text-red-400' :
            'text-yellow-400'
          }`}
        />
      </motion.div>
    </motion.div>
  );
};

export default AttributeConnection;
