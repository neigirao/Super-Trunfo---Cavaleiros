import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight, Sparkles, Swords, BookOpen, Trophy } from 'lucide-react';
import { useOnboarding, type OnboardingStep } from '@/hooks/useOnboarding';

interface OnboardingTutorialProps {
  step?: OnboardingStep;
  onComplete?: () => void;
}

const stepContent: Record<OnboardingStep, {
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
  action?: string;
} | null> = {
  'welcome': {
    title: '🌟 Bem-vindo, Cavaleiro!',
    description: 'Você está prestes a embarcar em uma jornada épica pelos elementos da tabela periódica. Prepare-se para batalhas estratégicas onde conhecimento e sorte se encontram!',
    icon: <Sparkles className="w-12 h-12 text-cosmic-gold" />,
    tip: 'Cada elemento possui atributos únicos baseados em suas propriedades químicas reais.',
    action: 'Começar Jornada',
  },
  'collection': {
    title: '📚 Sua Coleção',
    description: 'Aqui você encontra todos os Cavaleiros dos Elementos que coletou. Cada carta representa um elemento químico com atributos únicos.',
    icon: <BookOpen className="w-12 h-12 text-cosmic-blue" />,
    tip: 'Cartas mais raras (Legendary, Epic) geralmente têm atributos mais poderosos!',
    action: 'Entendi',
  },
  'deck-builder': {
    title: '⚔️ Monte seu Deck',
    description: 'Selecione de 6 a 10 cartas para formar seu deck de batalha. Pense estrategicamente: variedade de atributos altos pode ser mais vantajoso que apenas cartas raras.',
    icon: <Swords className="w-12 h-12 text-cosmic-purple" />,
    tip: 'Experimente diferentes combinações! Você pode salvar múltiplos decks.',
    action: 'Próximo',
  },
  'battle-intro': {
    title: '⚔️ Arena de Batalha',
    description: 'Aqui acontece a magia! Você e seu oponente revelam cartas. Quem escolher o atributo com maior valor vence a rodada e ganha a carta do adversário.',
    icon: <Trophy className="w-12 h-12 text-cosmic-gold-light" />,
    tip: 'O jogador que ficar sem cartas perde. Pense bem antes de escolher cada atributo!',
    action: 'Começar Batalha',
  },
  'battle-controls': {
    title: '🎮 Controles de Batalha',
    description: 'Durante sua vez, selecione um atributo da sua carta para comparar com o oponente. O maior valor vence!',
    icon: <Swords className="w-12 h-12 text-primary" />,
    tip: 'Cartas Super Trunfo (♛) vencem automaticamente cartas normais, independente dos valores!',
    action: 'Entendi',
  },
  'attribute-selection': {
    title: '🎯 Escolhendo Atributos',
    description: 'Analise sua carta e escolha o atributo que você acha que é mais forte. Lembre-se: você não vê a carta do oponente antes de escolher!',
    icon: <Sparkles className="w-12 h-12 text-cosmic-gold" />,
    tip: 'Número atômico e massa atômica são geralmente seguros. Densidade e reatividade variam muito!',
    action: 'Próximo',
  },
  'battle-result': {
    title: '🏆 Resultado da Rodada',
    description: 'Após cada rodada, você vê quem venceu e por quê. Aprenda com cada batalha para melhorar sua estratégia!',
    icon: <Trophy className="w-12 h-12 text-cosmic-gold" />,
    tip: 'Vitórias seguidas aumentam seu ranking. Derrote adversários para subir na classificação!',
    action: 'Finalizar Tutorial',
  },
  'completed': null,
};

export default function OnboardingTutorial({ step: propStep, onComplete }: OnboardingTutorialProps) {
  const { currentStep, isActive, nextStep, completeOnboarding, skipOnboarding } = useOnboarding();
  
  const activeStep = propStep || currentStep;
  const content = stepContent[activeStep];

  useEffect(() => {
    if (!isActive && onComplete) {
      onComplete();
    }
  }, [isActive, onComplete]);

  if (!isActive || !content) return null;

  const handleNext = () => {
    const steps: OnboardingStep[] = [
      'welcome',
      'collection', 
      'deck-builder',
      'battle-intro',
      'battle-controls',
      'attribute-selection',
      'battle-result',
    ];
    
    const currentIndex = steps.indexOf(activeStep);
    if (currentIndex < steps.length - 1) {
      nextStep(steps[currentIndex + 1]);
    } else {
      completeOnboarding();
      onComplete?.();
    }
  };

  const handleSkip = () => {
    skipOnboarding();
    onComplete?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-primary/20 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className="text-xs">
                  Tutorial Interativo
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex justify-center mb-4">
                {content.icon}
              </div>
              
              <CardTitle className="text-2xl mb-2">{content.title}</CardTitle>
              <CardDescription className="text-base">
                {content.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {content.tip && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-cosmic-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm mb-1">💡 Dica Estratégica</p>
                      <p className="text-sm text-muted-foreground">{content.tip}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Pular Tutorial
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold"
                >
                  {content.action}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Progress indicator */}
              <div className="flex justify-center gap-2 pt-2">
                {['welcome', 'collection', 'deck-builder', 'battle-intro', 'battle-controls', 'attribute-selection', 'battle-result'].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      s === activeStep
                        ? 'w-8 bg-cosmic-gold'
                        : 'w-1.5 bg-muted'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}