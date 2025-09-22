import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Play, 
  BookOpen, 
  Target,
  Users,
  Trophy,
  Sword,
  Star
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  image?: string;
  action?: {
    text: string;
    target?: string;
  };
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  icon: typeof BookOpen;
  steps: TutorialStep[];
}

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (tutorialId: string) => void;
}

const tutorials: Tutorial[] = [
  {
    id: 'basic-rules',
    title: 'Regras Básicas',
    description: 'Aprenda as regras fundamentais do Super Trunfo',
    difficulty: 'beginner',
    estimatedTime: '5 min',
    icon: BookOpen,
    steps: [
      {
        id: 'intro',
        title: 'Bem-vindo ao Super Trunfo!',
        content: 'O Super Trunfo é um jogo de cartas onde você deve comparar atributos e vencer seu oponente. Cada carta possui diferentes características com valores numéricos.',
      },
      {
        id: 'card-structure',
        title: 'Estrutura das Cartas',
        content: 'Cada carta possui: Nome, Imagem, e vários atributos como Força, Velocidade, Energia, etc. Você deve escolher um atributo para comparar com a carta do oponente.',
      },
      {
        id: 'winning',
        title: 'Como Vencer',
        content: 'O jogador com o maior valor no atributo escolhido vence a rodada e leva ambas as cartas. Quem ficar sem cartas primeiro, perde o jogo!',
      },
      {
        id: 'strategy',
        title: 'Estratégia',
        content: 'Observe bem os atributos da sua carta e tente escolher aquele onde você tem vantagem. Lembre-se: conhecer as cartas é fundamental!',
        action: {
          text: 'Começar a Jogar',
          target: '/game'
        }
      }
    ]
  },
  {
    id: 'deck-building',
    title: 'Construção de Baralhos',
    description: 'Aprenda a criar e gerenciar seus baralhos',
    difficulty: 'intermediate',
    estimatedTime: '3 min',
    icon: Target,
    steps: [
      {
        id: 'collection',
        title: 'Sua Coleção',
        content: 'Acesse sua coleção para ver todas as cartas disponíveis. Você pode filtrar e buscar cartas específicas.',
        action: {
          text: 'Ver Coleção',
          target: '/collection'
        }
      },
      {
        id: 'create-deck',
        title: 'Criando um Baralho',
        content: 'Selecione as melhores cartas para formar seu baralho. Um bom baralho deve ter cartas balanceadas em diferentes atributos.',
      },
      {
        id: 'deck-strategy',
        title: 'Estratégia de Baralho',
        content: 'Considere ter cartas fortes em diferentes áreas. Algumas podem ser ótimas em Força, outras em Velocidade. A diversidade é importante!',
      }
    ]
  },
  {
    id: 'battle-system',
    title: 'Sistema de Batalha',
    description: 'Domine as mecânicas avançadas de batalha',
    difficulty: 'advanced',
    estimatedTime: '7 min',
    icon: Sword,
    steps: [
      {
        id: 'battle-phases',
        title: 'Fases da Batalha',
        content: 'Cada batalha tem fases: Preparação, Escolha de Atributo, Comparação, e Resultado. Entenda cada fase para jogar melhor.',
      },
      {
        id: 'timing',
        title: 'Tempo Limite',
        content: 'Você tem tempo limitado para escolher um atributo. Use esse tempo para analisar sua carta e tomar a melhor decisão.',
      },
      {
        id: 'psychology',
        title: 'Psicologia do Jogo',
        content: 'Às vezes é melhor escolher um atributo médio que você tem certeza de ganhar, do que arriscar com um atributo muito alto.',
      },
      {
        id: 'advanced-tips',
        title: 'Dicas Avançadas',
        content: 'Observe os padrões do seu oponente. Alguns jogadores preferem sempre o maior valor, outros são mais estratégicos.',
        action: {
          text: 'Praticar Batalhas',
          target: '/game'
        }
      }
    ]
  }
];

const TutorialModal = ({ isOpen, onClose, onComplete }: TutorialModalProps) => {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);

  const handleStartTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (selectedTutorial && currentStep < selectedTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (selectedTutorial) {
      // Tutorial completed
      handleCompleteTutorial();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteTutorial = () => {
    if (selectedTutorial) {
      setCompletedTutorials([...completedTutorials, selectedTutorial.id]);
      onComplete?.(selectedTutorial.id);
      setSelectedTutorial(null);
      setCurrentStep(0);
    }
  };

  const handleActionClick = (target?: string) => {
    if (target) {
      window.location.href = target;
    }
    handleCompleteTutorial();
  };

  const getDifficultyColor = (difficulty: Tutorial['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getDifficultyIcon = (difficulty: Tutorial['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return Star;
      case 'intermediate': return Target;
      case 'advanced': return Trophy;
      default: return BookOpen;
    }
  };

  if (!selectedTutorial) {
    // Tutorial selection view
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-cosmic-gold flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Tutorial Interativo
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 mt-4">
            {tutorials.map((tutorial, index) => {
              const IconComponent = tutorial.icon;
              const DifficultyIcon = getDifficultyIcon(tutorial.difficulty);
              const isCompleted = completedTutorials.includes(tutorial.id);

              return (
                <motion.div
                  key={tutorial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className={`p-4 rounded-lg border bg-card hover-lift ${isCompleted ? 'border-cosmic-gold/50 bg-cosmic-gold/5' : 'border-muted'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 rounded-full ${isCompleted ? 'bg-cosmic-gold/20' : 'bg-muted/20'}`}>
                          <IconComponent className={`w-5 h-5 ${isCompleted ? 'text-cosmic-gold' : 'text-muted-foreground'}`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`font-bold ${isCompleted ? 'text-cosmic-gold' : 'text-foreground'}`}>
                              {tutorial.title}
                            </h3>
                            {isCompleted && (
                              <Badge className="bg-cosmic-gold/20 text-cosmic-gold border-cosmic-gold/50">
                                Concluído
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {tutorial.description}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={getDifficultyColor(tutorial.difficulty)}>
                              <DifficultyIcon className="w-3 h-3 mr-1" />
                              {tutorial.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              {tutorial.estimatedTime}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleStartTutorial(tutorial)}
                        className="ml-3"
                        variant={isCompleted ? "outline" : "default"}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {isCompleted ? 'Revisar' : 'Iniciar'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Tutorial step view
  const currentStepData = selectedTutorial.steps[currentStep];
  const progress = ((currentStep + 1) / selectedTutorial.steps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-cosmic-gold">
              {selectedTutorial.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTutorial(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Passo {currentStep + 1} de {selectedTutorial.steps.length}</span>
              <span>{Math.round(progress)}% concluído</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="py-4"
          >
            <h3 className="text-lg font-semibold mb-4 text-cosmic-gold">
              {currentStepData.title}
            </h3>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              {currentStepData.content}
            </p>
            
            {currentStepData.image && (
              <div className="mb-6">
                <img 
                  src={currentStepData.image} 
                  alt={currentStepData.title}
                  className="w-full rounded-lg border border-muted"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          
          {currentStepData.action ? (
            <Button
              onClick={() => handleActionClick(currentStepData.action?.target)}
              className="bg-cosmic-gold text-cosmic-dark hover:bg-cosmic-gold-light"
            >
              {currentStepData.action.text}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNextStep}>
              {currentStep === selectedTutorial.steps.length - 1 ? 'Concluir' : 'Próximo'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialModal;