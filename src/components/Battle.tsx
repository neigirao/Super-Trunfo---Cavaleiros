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
import PowerCounter from './battle/PowerCounter';
import { useBattleLogic } from '@/hooks/battle/useBattleLogic';
import { useBattleCards } from '@/hooks/battle/useBattleCards';
import type { BattleAttribute } from '@/hooks/battle/useBattleLogic';

type GamePhase = 'deckBuilder' | 'battle' | 'result' | 'gameOver';

interface BattleProps {
  onBattleStateChange?: (isActive: boolean) => void;
}

const Battle = ({ onBattleStateChange }: BattleProps = {}) => {
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
  const [previousPlayerPower, setPreviousPlayerPower] = useState(0);
  const [previousOpponentPower, setPreviousOpponentPower] = useState(0);

  /**
   * Notifica quando a batalha está ativa
   */
  useEffect(() => {
    if (onBattleStateChange) {
      onBattleStateChange(gamePhase !== 'deckBuilder');
    }
  }, [gamePhase, onBattleStateChange]);

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

    // Store previous power values for animation
    setPreviousPlayerPower(calculatePower(battleLogic.battle.playerCard));
    setPreviousOpponentPower(calculatePower(battleLogic.battle.opponentCard));

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
    setPreviousPlayerPower(0);
    setPreviousOpponentPower(0);
  };

  /**
   * Calcula o poder de uma carta (soma dos atributos principais)
   */
  const calculatePower = (card: typeof battleLogic.battle.playerCard): number => {
    if (!card) return 0;
    return Math.round(
      card.atomic_number + 
      card.atomic_mass + 
      card.density + 
      card.reactivity + 
      card.radioactivity
    );
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
            className="container mx-auto max-w-7xl py-4 space-y-4"
          >
            {/* Header Section */}
            <div className="space-y-3">
              {/* Top Controls */}
              <div className="flex items-center justify-between">
                <BattleControls
                  onSurrender={handleSurrender}
                  onPause={() => setIsPaused(true)}
                  onResume={() => setIsPaused(false)}
                  isPaused={isPaused}
                />
                <PlayerLevel {...playerLevel} />
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4">
                <CardCounter
                  playerCards={battleLogic.battle.playerDeck.length}
                  opponentCards={battleLogic.battle.opponentDeck.length}
                />
                <TurnIndicator
                  whoChooses={battleLogic.whoChooses}
                  isActive={!isPaused && battleLogic.whoChooses === 'player'}
                />
                <PowerCounter
                  playerPower={calculatePower(battleLogic.battle.playerCard)}
                  opponentPower={calculatePower(battleLogic.battle.opponentCard)}
                  previousPlayerPower={previousPlayerPower}
                  previousOpponentPower={previousOpponentPower}
                />
              </div>

              {/* Progress Bar */}
              <BattleProgress
                playerCards={battleLogic.battle.playerDeck.length}
                opponentCards={battleLogic.battle.opponentDeck.length}
                initialPlayerCards={battleLogic.initialPlayerCards}
                initialOpponentCards={battleLogic.initialOpponentCards}
                round={battleLogic.battle.round}
                playerScore={battleLogic.battle.playerScore}
                opponentScore={battleLogic.battle.opponentScore}
              />
            </div>

            {/* Battle Field */}
            <div className="py-6">
              <BattleField
                playerCard={battleLogic.battle.playerCard}
                opponentCard={battleLogic.battle.opponentCard}
                isCardFlipped={isCardFlipped}
                isTransferring={isTransferring}
                transferDirection={transferDirection}
                showPlayerAttributes={battleLogic.whoChooses === 'opponent' || !!battleLogic.battle.selectedAttribute}
              />
            </div>

            {/* Action Area */}
            <div className="min-h-[300px] flex items-center justify-center">
              {/* Attribute Selector (Player's Turn) */}
              {battleLogic.whoChooses === 'player' && 
               !battleLogic.battle.selectedAttribute && 
               battleLogic.battle.playerCard && (
                <motion.div
                  className="w-full max-w-md"
                  initial={{ y: 20, opacity: 0 }}
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
            </div>

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
