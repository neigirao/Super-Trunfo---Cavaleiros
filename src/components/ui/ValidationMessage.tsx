import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ValidationMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isVisible: boolean;
  className?: string;
}

const ValidationMessage = ({ type, message, isVisible, className = "" }: ValidationMessageProps) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-cosmic-blue" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-500/50';
      case 'error':
        return 'border-red-500/50';
      case 'warning':
        return 'border-yellow-500/50';
      case 'info':
        return 'border-cosmic-blue/50';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          <Alert 
            variant={getVariant()}
            className={`${getBorderColor()} bg-card/50 backdrop-blur-sm`}
          >
            {getIcon()}
            <AlertDescription className="ml-2">
              {message}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook para gerenciar validações
export const useValidation = () => {
  const validateDeckSize = (cardCount: number) => {
    if (cardCount < 6) {
      return {
        type: 'error' as const,
        message: `Você precisa de pelo menos 6 cartas. Faltam ${6 - cardCount} cartas.`,
        isValid: false
      };
    }
    if (cardCount > 20) {
      return {
        type: 'warning' as const,
        message: `Máximo de 20 cartas permitido. Remova ${cardCount - 20} cartas.`,
        isValid: false
      };
    }
    if (cardCount >= 6 && cardCount <= 10) {
      return {
        type: 'success' as const,
        message: 'Baralho ideal! Perfeito para batalhas rápidas.',
        isValid: true
      };
    }
    return {
      type: 'info' as const,
      message: `Baralho válido com ${cardCount} cartas. Considere reduzir para batalhas mais ágeis.`,
      isValid: true
    };
  };

  const validateDeckName = (name: string) => {
    if (!name.trim()) {
      return {
        type: 'error' as const,
        message: 'Nome do baralho é obrigatório.',
        isValid: false
      };
    }
    if (name.length < 3) {
      return {
        type: 'warning' as const,
        message: 'Nome muito curto. Use pelo menos 3 caracteres.',
        isValid: false
      };
    }
    if (name.length > 30) {
      return {
        type: 'error' as const,
        message: 'Nome muito longo. Máximo de 30 caracteres.',
        isValid: false
      };
    }
    return {
      type: 'success' as const,
      message: 'Nome válido!',
      isValid: true
    };
  };

  return {
    validateDeckSize,
    validateDeckName
  };
};

export default ValidationMessage;