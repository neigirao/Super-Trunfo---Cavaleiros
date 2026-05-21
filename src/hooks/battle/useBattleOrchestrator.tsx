/**
 * Hook orquestrador que coordena todos os aspectos da batalha
 * 
 * Este hook encapsula:
 * - Lógica de batalha (useBattleLogic)
 * - Estado da UI (useBattleState)
 * - Efeitos visuais (useBattleEffects)
 * - Cartas (useBattleCards)
 * 
 * E fornece ações de alto nível para controlar o fluxo completo da batalha
 * 
 * @example
 * ```tsx
 * const battle = useBattleOrchestrator(user?.id);
 * 
 * // Iniciar batalha
 * battle.actions.startBattle(selectedCards, deckName);
 * 
 * // Selecionar atributo
 * battle.actions.selectAttribute('atomic_number');
 * 
 * // Próxima rodada
 * battle.actions.nextRound();
 * ```
 */
import { useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBattleLogic, BattleAttribute, ElementCard } from './useBattleLogic';
import { useBattleState } from './useBattleState';
import { useBattleEffects } from './useBattleEffects';
import { useBattleCards } from './useBattleCards';

interface BattleOrchestratorActions {
  startBattle: (selectedCards: ElementCard[], deckName?: string) => void;
  selectAttribute: (attribute: BattleAttribute) => void;
  nextRound: () => void;
  surrender: () => void;
  restart: () => void;
  calculatePower: (card: ElementCard | null) => number;
  skipTimer: () => void;
}

interface BattleOrchestratorHook {
  // Sub-hooks
  logic: ReturnType<typeof useBattleLogic>;
  state: ReturnType<typeof useBattleState>;
  effects: ReturnType<typeof useBattleEffects>;
  cards: ReturnType<typeof useBattleCards>;
  
  // Ações coordenadas
  actions: BattleOrchestratorActions;
}

/**
 * Hook orquestrador principal da batalha
 */
export const useBattleOrchestrator = (
  userId: string | undefined,
  userEmail?: string,
  onBattleStateChange?: (isActive: boolean) => void
): BattleOrchestratorHook => {
  const { toast } = useToast();
  
  // Sub-hooks
  const logic = useBattleLogic(userId);
  const state = useBattleState();
  const effects = useBattleEffects();
  const cards = useBattleCards();

  // Timer reference para poder cancelar
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Notifica mudanças no estado da batalha
   */
  useEffect(() => {
    if (onBattleStateChange) {
      onBattleStateChange(state.gamePhase !== 'deckBuilder');
    }
  }, [state.gamePhase, onBattleStateChange]);

  /**
   * Calcula o poder total de uma carta
   */
  const calculatePower = useCallback((card: ElementCard | null): number => {
    if (!card) return 0;
    return Math.round(
      card.atomic_number + 
      card.atomic_mass + 
      card.density + 
      card.reactivity + 
      card.radioactivity
    );
  }, []);

  /**
   * Mostra os efeitos visuais do resultado
   */
  const showBattleResult = useCallback((result: 'win' | 'lose' | 'draw') => {
    // Armazena poderes para animação
    state.setPreviousPowers(
      calculatePower(logic.battle.playerCard),
      calculatePower(logic.battle.opponentCard)
    );

    state.setGamePhase('result');
    
    // Efeitos visuais baseados no resultado
    if (result === 'win') {
      effects.showVictory('victory');
      effects.addExperience(15);
    } else if (result === 'lose') {
      effects.showVictory('defeat');
      state.setTransferDirection('right');
    } else {
      effects.showVictory('draw');
    }
  }, [logic.battle.playerCard, logic.battle.opponentCard, state, effects, calculatePower]);

  /**
   * IA do oponente - escolha automática de atributo
   */
  useEffect(() => {
    if (logic.whoChooses === 'opponent' && 
        !logic.battle.selectedAttribute && 
        logic.battle.opponentCard && 
        state.gamePhase === 'battle' &&
        !state.isPaused) {
      
      const timer = setTimeout(() => {
        const bestAttribute = logic.getOpponentChoice();
        
        // Calcula resultado IMEDIATAMENTE
        const result = logic.calculateBattleResult(bestAttribute);
        if (!result) return;
        
        state.setCardFlipped(true);
        state.setTimerActive(true);
        state.setShowAttributeConnection(true);
        
        timerRef.current = setTimeout(() => {
          state.setTimerActive(false);
          state.setShowAttributeConnection(false);
          showBattleResult(result);
        }, 5000);
      }, 2000);

      return () => {
        clearTimeout(timer);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [logic, state, showBattleResult]);

  /**
   * Inicia uma nova batalha
   */
  const startBattle = useCallback((selectedCards: ElementCard[], deckName?: string) => {
    if (selectedCards.length < 6) {
      toast({
        title: "Erro",
        description: "Você precisa selecionar pelo menos 6 cartas para formar um baralho",
        variant: "destructive"
      });
      return;
    }

    state.setCurrentDeckName(deckName || null);
    const opponentDeck = cards.createOpponentDeck(selectedCards.length);
    logic.startBattle(selectedCards, opponentDeck);
    state.setGamePhase('battle');
  }, [toast, state, cards, logic]);

  /**
   * Seleciona um atributo (jogador)
   */
  const selectAttribute = useCallback((attribute: BattleAttribute) => {
    if (!logic.battle.playerCard || !logic.battle.opponentCard || logic.whoChooses !== 'player') return;
    
    // Calcula resultado IMEDIATAMENTE
    const result = logic.calculateBattleResult(attribute);
    if (!result) return;
    
    state.setCardFlipped(true);
    state.setTimerActive(true);
    state.setShowAttributeConnection(true);
    
    // Aguarda 5s ou até pular para mostrar resultado
    timerRef.current = setTimeout(() => {
      state.setTimerActive(false);
      state.setShowAttributeConnection(false);
      showBattleResult(result);
    }, 5000);
  }, [logic, state, showBattleResult]);

  /**
   * Pula o timer e avança imediatamente
   */
  const skipTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    state.setTimerActive(false);
    state.setShowAttributeConnection(false);
    
    // Mostra resultado imediatamente
    if (logic.battle.battleResult) {
      showBattleResult(logic.battle.battleResult);
    }
  }, [logic.battle.battleResult, state, showBattleResult]);

  /**
   * Avança para próxima rodada
   */
  const nextRound = useCallback(() => {
    state.setCardFlipped(false);
    state.setTransferring(true);
    effects.hideVictory();
    effects.hideParticlesEffect();

    // Define direção da transferência
    if (logic.battle.battleResult === 'win') {
      state.setTransferDirection('left');
    } else if (logic.battle.battleResult === 'lose') {
      state.setTransferDirection('right');
    }

    const { gameOver, winner } = logic.nextRound();

    setTimeout(() => {
      state.setTransferring(false);
      
      // Verificação adicional: encerra se algum jogador ficou sem cartas
      const playerOutOfCards = logic.battle.playerDeck.length === 0;
      const opponentOutOfCards = logic.battle.opponentDeck.length === 0;
      
      if (gameOver || playerOutOfCards || opponentOutOfCards) {
        state.setGamePhase('gameOver');
        const finalWinner = playerOutOfCards ? 'opponent' : (winner || 'player');
        if (finalWinner === 'player') {
          logic.saveGameResult(true, userEmail);
        } else {
          logic.saveGameResult(false, userEmail);
        }
      } else {
        state.setGamePhase('battle');
      }
    }, 1000);
  }, [logic, state, effects, userEmail]);

  /**
   * Desiste da batalha
   */
  const surrender = useCallback(() => {
    logic.saveGameResult(false, userEmail);
    state.setGamePhase('gameOver');
    logic.setBattle(prev => ({
      ...prev,
      playerDeck: []
    }));
  }, [logic, state, userEmail]);

  /**
   * Reinicia o jogo
   */
  const restart = useCallback(() => {
    state.resetState();
    effects.resetEffects();
  }, [state, effects]);

  return {
    logic,
    state,
    effects,
    cards,
    actions: {
      startBattle,
      selectAttribute,
      nextRound,
      surrender,
      restart,
      calculatePower,
      skipTimer
    }
  };
};
