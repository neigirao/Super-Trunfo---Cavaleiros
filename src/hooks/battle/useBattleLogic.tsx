/**
 * Hook customizado para gerenciar toda a lógica de batalha do Super Trunfo
 * 
 * Responsável por:
 * - Estado da batalha
 * - Cálculo de resultados
 * - Transição de rodadas
 * - Verificação de fim de jogo
 * - Integração com ranking
 */
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ElementCard {
  id: string;
  name: string;
  symbol: string;
  atomic_number: number;
  atomic_mass: number;
  density: number;
  melting_point: number;
  reactivity: number;
  radioactivity: number;
  knight_name: string;
  special_ability: string;
  rarity: string;
  element_type: string;
  is_super_trump: boolean;
  trump_weakness?: string;
  image_url?: string;
}

export type BattleAttribute = 'atomic_number' | 'atomic_mass' | 'density' | 'melting_point' | 'reactivity' | 'radioactivity';

export interface BattleState {
  playerDeck: ElementCard[];
  opponentDeck: ElementCard[];
  playerCard: ElementCard | null;
  opponentCard: ElementCard | null;
  selectedAttribute: BattleAttribute | null;
  battleResult: 'win' | 'lose' | 'draw' | null;
  playerScore: number;
  opponentScore: number;
  round: number;
  discardPile: ElementCard[];
}

export const useBattleLogic = (userId: string | undefined) => {
  const { toast } = useToast();
  
  const [battle, setBattle] = useState<BattleState>({
    playerDeck: [],
    opponentDeck: [],
    playerCard: null,
    opponentCard: null,
    selectedAttribute: null,
    battleResult: null,
    playerScore: 0,
    opponentScore: 0,
    round: 1,
    discardPile: []
  });

  const [whoChooses, setWhoChooses] = useState<'player' | 'opponent'>('player');
  const [initialPlayerCards, setInitialPlayerCards] = useState(0);
  const [initialOpponentCards, setInitialOpponentCards] = useState(0);

  /**
   * Inicia uma nova batalha com os baralhos fornecidos
   */
  const startBattle = useCallback((playerCards: ElementCard[], opponentCards: ElementCard[]) => {
    const shuffledPlayerDeck = [...playerCards].sort(() => Math.random() - 0.5);
    const shuffledOpponentDeck = [...opponentCards].sort(() => Math.random() - 0.5);

    setInitialPlayerCards(shuffledPlayerDeck.length);
    setInitialOpponentCards(shuffledOpponentDeck.length);
    
    setBattle({
      playerDeck: shuffledPlayerDeck,
      opponentDeck: shuffledOpponentDeck,
      playerCard: shuffledPlayerDeck[0],
      opponentCard: shuffledOpponentDeck[0],
      selectedAttribute: null,
      battleResult: null,
      playerScore: 0,
      opponentScore: 0,
      round: 1,
      discardPile: []
    });
    
    setWhoChooses('player');
  }, []);

  /**
   * Calcula o resultado de uma rodada baseado no atributo selecionado
   * Implementa as regras do Super Trunfo
   */
  const calculateBattleResult = useCallback((attribute: BattleAttribute): 'win' | 'lose' | 'draw' | null => {
    if (!battle.playerCard || !battle.opponentCard) return null;

    const playerValue = battle.playerCard[attribute];
    const opponentValue = battle.opponentCard[attribute];

    let result: 'win' | 'lose' | 'draw';

    // Verifica Super Trunfo
    if (battle.playerCard.is_super_trump && !battle.opponentCard.is_super_trump) {
      if (battle.playerCard.trump_weakness && battle.opponentCard.symbol === battle.playerCard.trump_weakness) {
        result = 'lose';
      } else {
        result = 'win';
      }
    } else if (battle.opponentCard.is_super_trump && !battle.playerCard.is_super_trump) {
      if (battle.opponentCard.trump_weakness && battle.playerCard.symbol === battle.opponentCard.trump_weakness) {
        result = 'win';
      } else {
        result = 'lose';
      }
    } else {
      // Comparação normal
      if (playerValue > opponentValue) {
        result = 'win';
      } else if (playerValue < opponentValue) {
        result = 'lose';
      } else {
        result = 'draw';
      }
    }

    setBattle(prev => ({ ...prev, battleResult: result, selectedAttribute: attribute }));
    return result;
  }, [battle.playerCard, battle.opponentCard]);

  /**
   * Avança para a próxima rodada aplicando as regras do Super Trunfo
   */
  const nextRound = useCallback((): { gameOver: boolean; winner: 'player' | 'opponent' | null } => {
    let gameOver = false;
    let winner: 'player' | 'opponent' | null = null;

    setBattle(prev => {
      if (!prev.playerCard || !prev.opponentCard || !prev.battleResult) {
        return prev;
      }

      let newPlayerDeck = [...prev.playerDeck.slice(1)];
      let newOpponentDeck = [...prev.opponentDeck.slice(1)];
      let newDiscardPile = [...prev.discardPile];
      let newWhoChooses = whoChooses;
      let newPlayerScore = prev.playerScore;
      let newOpponentScore = prev.opponentScore;

      const cardsInPlay = [prev.playerCard, prev.opponentCard, ...newDiscardPile];

      if (prev.battleResult === 'win') {
        newPlayerDeck = [...newPlayerDeck, ...cardsInPlay];
        newDiscardPile = [];
        newWhoChooses = 'player';
        newPlayerScore = prev.playerScore + 1;
      } else if (prev.battleResult === 'lose') {
        newOpponentDeck = [...newOpponentDeck, ...cardsInPlay];
        newDiscardPile = [];
        newWhoChooses = 'opponent';
        newOpponentScore = prev.opponentScore + 1;
      } else {
        newDiscardPile = cardsInPlay;
      }

      // Verificar fim de jogo
      if (newPlayerDeck.length === 0) {
        gameOver = true;
        winner = 'opponent';
      } else if (newOpponentDeck.length === 0) {
        gameOver = true;
        winner = 'player';
      }

      setWhoChooses(newWhoChooses);

      return {
        ...prev,
        playerDeck: newPlayerDeck,
        opponentDeck: newOpponentDeck,
        playerCard: newPlayerDeck[0] || null,
        opponentCard: newOpponentDeck[0] || null,
        discardPile: newDiscardPile,
        selectedAttribute: null,
        battleResult: null,
        playerScore: newPlayerScore,
        opponentScore: newOpponentScore,
        round: prev.round + 1
      };
    });

    return { gameOver, winner };
  }, [whoChooses]);

  /**
   * Escolha automática de atributo pelo oponente (IA)
   */
  const getOpponentChoice = useCallback((): BattleAttribute => {
    if (!battle.opponentCard) return 'atomic_number';

    const attributes: BattleAttribute[] = ['atomic_number', 'atomic_mass', 'density', 'melting_point', 'reactivity', 'radioactivity'];
    const opponentCard = battle.opponentCard;
    
    let bestAttribute = attributes[0];
    let bestValue = opponentCard[bestAttribute];
    
    for (const attr of attributes) {
      if (opponentCard[attr] > bestValue) {
        bestAttribute = attr;
        bestValue = opponentCard[attr];
      }
    }
    
    return bestAttribute;
  }, [battle.opponentCard]);

  /**
   * Salva o resultado da partida no ranking
   */
  const saveGameResult = useCallback(async (isVictory: boolean, userEmail: string | undefined) => {
    if (!userId) return;

    try {
      const { data: existingRanking } = await supabase
        .from('card_game_rankings')
        .select('*')
        .eq('user_id', userId)
        .single();

      const gamesWon = isVictory ? (existingRanking?.games_won || 0) + 1 : (existingRanking?.games_won || 0);
      const gamesLost = !isVictory ? (existingRanking?.games_lost || 0) + 1 : (existingRanking?.games_lost || 0);
      const totalGames = gamesWon + gamesLost;
      const winRate = totalGames > 0 ? (gamesWon / totalGames) * 100 : 0;
      const currentScore = battle.playerScore * 10 + (isVictory ? 100 : 0);
      const newTotalScore = (existingRanking?.total_score || 0) + currentScore;

      const rankingData = {
        user_id: userId,
        player_name: userEmail?.split('@')[0] || 'Jogador',
        total_score: newTotalScore,
        games_won: gamesWon,
        games_lost: gamesLost,
        total_games: totalGames,
        win_rate: parseFloat(winRate.toFixed(2)),
        highest_score: Math.max(currentScore, existingRanking?.highest_score || 0),
        current_streak: isVictory ? (existingRanking?.current_streak || 0) + 1 : 0,
        longest_streak: isVictory ? Math.max((existingRanking?.current_streak || 0) + 1, existingRanking?.longest_streak || 0) : (existingRanking?.longest_streak || 0),
        total_cards_played: (existingRanking?.total_cards_played || 0) + initialPlayerCards,
        difficulty_level: 'medium',
        last_played_at: new Date().toISOString()
      };

      if (existingRanking) {
        await supabase
          .from('card_game_rankings')
          .update(rankingData)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('card_game_rankings')
          .insert([rankingData]);
      }

      toast({
        title: isVictory ? "Vitória registrada!" : "Partida registrada!",
        description: `+${currentScore} pontos`,
      });

    } catch (error) {
      console.error('Erro ao salvar resultado:', error);
    }
  }, [userId, battle.playerScore, initialPlayerCards, toast]);

  return {
    battle,
    whoChooses,
    initialPlayerCards,
    initialOpponentCards,
    startBattle,
    calculateBattleResult,
    nextRound,
    getOpponentChoice,
    saveGameResult,
    setWhoChooses,
    setBattle
  };
};
