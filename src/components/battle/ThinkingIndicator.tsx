import { motion } from 'framer-motion';
import { Brain, Zap, Star } from 'lucide-react';

interface ThinkingIndicatorProps {
  isVisible: boolean;
  message?: string;
}

const ThinkingIndicator = ({ isVisible, message = "Oponente analisando..." }: ThinkingIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className="flex items-center justify-center space-x-3 py-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <motion.div
          className="p-3 bg-cosmic-purple/20 rounded-full border-2 border-cosmic-purple/40"
          animate={{ 
            scale: [1, 1.1, 1],
            borderColor: ['hsl(280, 60%, 40%)', 'hsl(280, 60%, 60%)', 'hsl(280, 60%, 40%)']
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Brain className="w-5 h-5 text-cosmic-purple" />
        </motion.div>

        {/* Floating Icons */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ 
            rotate: [0, 360],
            scale: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Zap className="w-3 h-3 text-cosmic-gold" />
        </motion.div>

        <motion.div
          className="absolute -bottom-1 -left-2"
          animate={{ 
            rotate: [360, 0],
            scale: [0.6, 1, 0.6]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Star className="w-3 h-3 text-cosmic-blue" />
        </motion.div>
      </div>

      <div className="flex flex-col items-start">
        <motion.div
          className="text-sm font-medium text-cosmic-purple"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {message}
        </motion.div>

        {/* Thinking Dots */}
        <div className="flex space-x-1 mt-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-cosmic-purple rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ThinkingIndicator;