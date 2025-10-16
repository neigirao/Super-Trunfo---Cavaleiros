/**
 * Battle Component - Componente principal da batalha REFATORADO
 * 
 * Agora usa arquitetura modular com:
 * - Hooks customizados para lógica (useBattleLogic, useBattleCards)
 * - Componentes específicos para UI (BattleField, AttributeSelector, etc.)
 * - Separação clara entre lógica de negócio e apresentação
 * 
 * Mantém EXATAMENTE as mesmas regras do Super Trunfo
 */
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from './ui/ErrorBoundary';
import DeckBuilder from './DeckBuilder';
import TurnIndicator from './battle/TurnIndicator';
import BattleProgress from './battle/BattleProgress';
import CardCounter from './battle/CardCounter';
import ThinkingIndicator from './battle/ThinkingIndicator';
import BattleControls from './battle/BattleControls';
import VictoryEffect from './effects/VictoryEffect';
import ParticleEffect from './effects/ParticleEffect';
import PlayerLevel from './progression/PlayerLevel';
import TutorialModal from './tutorial/TutorialModal';
import BattleField from './battle/BattleField';
import AttributeSelector from './battle/AttributeSelector';
import BattleResultScreen from './battle/BattleResultScreen';
import GameOverScreen from './battle/GameOverScreen';
import { useBattleLogic } from '@/hooks/battle/useBattleLogic';
import { useBattleCards } from '@/hooks/battle/useBattleCards';
import type { BattleAttribute } from '@/hooks/battle/useBattleLogic';

type GamePhase = 'deckBuilder' | 'battle' | 'result' | 'gameOver';

const Battle = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Hooks de lógica
  const battleLogic = useBattleLogic(user?.id);
  const { userCards, allCards, isLoading, createOpponentDeck } = useBattleCards();
  
  // Estados de UI
  const [gamePhase, setGamePhase] = useState<GamePhase>('deckBuilder');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferDirection, setTransferDirection] = useState<'left' | 'right'>('right');
  const [currentDeckName, setCurrentDeckName] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showVictoryEffect, setShowVictoryEffect] = useState(false);
  const [victoryType, setVictoryType] = useState<'victory' | 'defeat' | 'draw'>('victory');
  const [showParticles, setShowParticles] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [playerLevel, setPlayerLevel] = useState({ 
    level: 1, 
    experience: 0, 
    experienceToNextLevel: 100, 
    totalExperience: 0 
  });

  /**
   * Efeito para escolha automática do oponente
   */
  useEffect(() => {
    if (battleLogic.whoChooses === 'opponent' && 
        !battleLogic.battle.selectedAttribute && 
        battleLogic.battle.opponentCard && 
        gamePhase === 'battle' &&
        !isPaused) {
      
      const timer = setTimeout(() => {
        const bestAttribute = battleLogic.getOpponentChoice();
        setIsCardFlipped(true);
        
        setTimeout(() => {
          handleBattleResult(bestAttribute);
        }, 1000);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [battleLogic.whoChooses, battleLogic.battle.selectedAttribute, battleLogic.battle.opponentCard, gamePhase, isPaused]);

  /**
   * Inicia uma nova batalha
   */
  const startBattle = (selectedCards: typeof userCards, deckName?: string) => {
    if (selectedCards.length < 6) {
      toast({
        title: "Erro",
        description: "Você precisa selecionar pelo menos 6 cartas para formar um baralho",
        variant: "destructive"
      });
      return;
    }

    setCurrentDeckName(deckName || null);
    const opponentDeck = createOpponentDeck(selectedCards.length);
    battleLogic.startBattle(selectedCards, opponentDeck);
    setGamePhase('battle');
  };

  /**
   * Seleciona um atributo (player)
   */
  const selectAttribute = (attribute: BattleAttribute) => {
    if (!battleLogic.battle.playerCard || !battleLogic.battle.opponentCard || battleLogic.whoChooses !== 'player') return;
    
    setIsCardFlipped(true);
    
    setTimeout(() => {
      handleBattleResult(attribute);
    }, 1000);
  };

  /**
   * Processa o resultado da batalha
   */
  const handleBattleResult = (attribute: BattleAttribute) => {
    const result = battleLogic.calculateBattleResult(attribute);
    if (!result) return;

    setGamePhase('result');
    
    // Efeitos visuais
    if (result === 'win') {
      setVictoryType('victory');
      setShowVictoryEffect(true);
      setShowParticles(true);
      
      const xpGained = 15;
      setPlayerLevel(prev => ({
        ...prev,
        experience: prev.experience + xpGained,
        totalExperience: prev.totalExperience + xpGained
      }));
    } else if (result === 'lose') {
      setVictoryType('defeat');
      setShowVictoryEffect(true);
      setTransferDirection('right');
    } else {
      setVictoryType('draw');
      setShowVictoryEffect(true);
    }
  };

  /**
   * Avança para próxima rodada
   */
  const handleNextRound = () => {
    setIsCardFlipped(false);
    setIsTransferring(true);
    setShowVictoryEffect(false);
    setShowParticles(false);

    // Define direção da transferência
    if (battleLogic.battle.battleResult === 'win') {
      setTransferDirection('left');
    } else if (battleLogic.battle.battleResult === 'lose') {
      setTransferDirection('right');
    }

    const { gameOver, winner } = battleLogic.nextRound();

    setTimeout(() => {
      setIsTransferring(false);
      
      if (gameOver) {
        setGamePhase('gameOver');
        if (winner === 'player') {
          battleLogic.saveGameResult(true, user?.email);
        } else {
          battleLogic.saveGameResult(false, user?.email);
        }
      } else {
        setGamePhase('battle');
      }
    }, 1000);
  };

  /**
   * Desiste da batalha
   */
  const handleSurrender = () => {
    battleLogic.saveGameResult(false, user?.email);
    setGamePhase('gameOver');
    battleLogic.setBattle(prev => ({
      ...prev,
      playerDeck: []
    }));
  };

  /**
   * Reinicia o jogo
   */
  const handleRestart = () => {
    setGamePhase('deckBuilder');
    setIsCardFlipped(false);
    setIsTransferring(false);
    setCurrentDeckName(null);
    setIsPaused(false);
    setShowVictoryEffect(false);
    setShowParticles(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando cartas...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-background to-cosmic-dark p-4 md:p-8">
        {/* Tutorial Modal */}
        <TutorialModal 
          isOpen={showTutorial} 
          onClose={() => setShowTutorial(false)} 
        />

        {/* Deck Builder Phase */}
        {gamePhase === 'deckBuilder' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DeckBuilder 
              userCards={userCards} 
              onStartBattle={startBattle}
              onCancel={handleRestart}
            />
            <div className="text-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowTutorial(true)}
              >
                Ver Tutorial
              </Button>
            </div>
          </motion.div>
        )}

        {/* Battle Phase */}
        {gamePhase === 'battle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Battle Controls */}
            <BattleControls
              onSurrender={handleSurrender}
              onPause={() => setIsPaused(true)}
              onResume={() => setIsPaused(false)}
              isPaused={isPaused}
            />

            {/* Player Level */}
            <div className="flex justify-center">
              <PlayerLevel {...playerLevel} />
            </div>

            {/* Battle Progress */}
            <BattleProgress
              playerCards={battleLogic.battle.playerDeck.length}
              opponentCards={battleLogic.battle.opponentDeck.length}
              initialPlayerCards={battleLogic.initialPlayerCards}
              initialOpponentCards={battleLogic.initialOpponentCards}
              round={battleLogic.battle.round}
              playerScore={battleLogic.battle.playerScore}
              opponentScore={battleLogic.battle.opponentScore}
            />

            {/* Turn Indicator */}
            <TurnIndicator
              whoChooses={battleLogic.whoChooses}
              isActive={!isPaused && battleLogic.whoChooses === 'player'}
            />

            {/* Card Counters */}
            <CardCounter
              playerCards={battleLogic.battle.playerDeck.length}
              opponentCards={battleLogic.battle.opponentDeck.length}
            />

            {/* Battle Field */}
            <BattleField
              playerCard={battleLogic.battle.playerCard}
              opponentCard={battleLogic.battle.opponentCard}
              isCardFlipped={isCardFlipped}
              isTransferring={isTransferring}
              transferDirection={transferDirection}
            />

            {/* Attribute Selector (Player's Turn) */}
            {battleLogic.whoChooses === 'player' && 
             !battleLogic.battle.selectedAttribute && 
             battleLogic.battle.playerCard && (
              <motion.div
                className="max-w-md mx-auto"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <h3 className="text-center text-lg font-semibold mb-4 text-primary">
                  Escolha um atributo:
                </h3>
                <AttributeSelector
                  card={battleLogic.battle.playerCard}
                  onSelectAttribute={selectAttribute}
                  disabled={isPaused}
                  selectedAttribute={battleLogic.battle.selectedAttribute}
                />
              </motion.div>
            )}

            {/* Thinking Indicator (Opponent's Turn) */}
            {battleLogic.whoChooses === 'opponent' && !battleLogic.battle.selectedAttribute && (
              <ThinkingIndicator isVisible={true} />
            )}

            {/* Effects */}
            <AnimatePresence>
              {showVictoryEffect && (
                <VictoryEffect 
                  isVisible={showVictoryEffect} 
                  type={victoryType} 
                />
              )}
            </AnimatePresence>

            {showParticles && <ParticleEffect isActive={showParticles} />}
          </motion.div>
        )}

        {/* Result Phase */}
        {gamePhase === 'result' && battleLogic.battle.battleResult && (
          <BattleResultScreen
            result={battleLogic.battle.battleResult}
            onNextRound={handleNextRound}
          />
        )}

        {/* Game Over Phase */}
        {gamePhase === 'gameOver' && (
          <GameOverScreen
            isVictory={battleLogic.battle.playerDeck.length > 0}
            playerScore={battleLogic.battle.playerScore}
            opponentScore={battleLogic.battle.opponentScore}
            onRestart={handleRestart}
            onBackToMenu={handleRestart}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Battle;
