import { motion } from 'framer-motion';
import { Trophy, XCircle, Minus, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VictoryEffectProps {
  isVisible: boolean;
  onComplete?: () => void;
  type?: 'victory' | 'defeat' | 'draw';
}

const VictoryEffect = ({ isVisible, onComplete, type = 'victory' }: VictoryEffectProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (isVisible && type === 'victory') {
      // Gerar partículas aleatórias
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      setParticles(newParticles);
    }
  }, [isVisible, type]);

  const getEffectConfig = () => {
    switch (type) {
      case 'victory':
        return {
          title: '🏆 VITÓRIA!',
          subtitle: 'Você dominou esta rodada!',
          color: 'text-cosmic-gold',
          bgColor: 'bg-cosmic-gold/20',
          icon: Trophy,
          borderColor: 'border-cosmic-gold',
          glow: 'var(--glow-win)'
        };
      case 'defeat':
        return {
          title: '💀 DERROTA',
          subtitle: 'O oponente venceu',
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          icon: XCircle,
          borderColor: 'border-red-500',
          glow: 'var(--glow-lose)'
        };
      case 'draw':
        return {
          title: '⚔️ EMPATE',
          subtitle: 'Forças equilibradas!',
          color: 'text-cosmic-purple-light',
          bgColor: 'bg-cosmic-purple/20',
          icon: Minus,
          borderColor: 'border-cosmic-purple',
          glow: '0 0 30px hsl(280, 60%, 50%, 0.5)'
        };
      default:
        return {
          title: '🏆 VITÓRIA!',
          subtitle: 'Você dominou esta rodada!',
          color: 'text-cosmic-gold',
          bgColor: 'bg-cosmic-gold/20',
          icon: Trophy,
          borderColor: 'border-cosmic-gold',
          glow: 'var(--glow-win)'
        };
    }
  };

  const config = getEffectConfig();
  const IconComponent = config.icon;

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onComplete}
    >
      {/* Shake screen effect */}
      <motion.div
        className="w-full h-full absolute inset-0"
        animate={type === 'victory' ? {
          x: [0, -5, 5, -5, 5, 0],
          y: [0, -2, 2, -2, 2, 0]
        } : {}}
        transition={{ duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
      />

      {/* Particles effect for victory */}
      {type === 'victory' && particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-cosmic-gold rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            y: [0, -50, -100]
          }}
          transition={{
            duration: 2,
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Main effect container */}
      <motion.div
        className={`${config.bgColor} ${config.borderColor} border-3 rounded-3xl p-10 text-center max-w-md mx-4 backdrop-blur-xl snap-effect`}
        style={{ boxShadow: config.glow }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.6
        }}
      >
        {/* Icon with pulse animation */}
        <motion.div
          className={`${config.bgColor} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border ${config.borderColor}`}
          animate={{ 
            scale: [1, 1.1, 1],
            boxShadow: type === 'victory' ? [
              "0 0 0 0 rgba(255,215,0,0.7)",
              "0 0 0 20px rgba(255,215,0,0)",
              "0 0 0 0 rgba(255,215,0,0)"
            ] : []
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <IconComponent className={`w-10 h-10 ${config.color}`} />
        </motion.div>

        {/* Title with typewriter effect */}
        <motion.h1
          className={`text-4xl font-bold ${config.color} mb-2`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {config.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg text-muted-foreground mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {config.subtitle}
        </motion.p>

        {/* Continue button */}
        <motion.button
          className={`px-6 py-3 ${config.bgColor} ${config.color} border ${config.borderColor} rounded-lg font-medium hover:scale-105 transition-transform`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          onClick={onComplete}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continuar
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default VictoryEffect;