import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sword, Shield, Zap, Star, Crown, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BattleCard from './BattleCard';
import DeckBuilder from './DeckBuilder';
import TurnIndicator from './battle/TurnIndicator';
import BattleProgress from './battle/BattleProgress';
import CardCounter from './battle/CardCounter';
import ThinkingIndicator from './battle/ThinkingIndicator';
import BattleControls from './battle/BattleControls';
import ErrorBoundary from './ui/ErrorBoundary';
import VictoryEffect from './effects/VictoryEffect';
import ParticleEffect from './effects/ParticleEffect';
import PlayerLevel from './progression/PlayerLevel';
import TutorialModal from './tutorial/TutorialModal';

interface ElementCard {
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

type BattleAttribute = 'atomic_number' | 'atomic_mass' | 'density' | 'melting_point' | 'reactivity' | 'radioactivity';

interface BattleState {
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

const Battle = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userCards, setUserCards] = useState<ElementCard[]>([]);
  const [allCards, setAllCards] = useState<ElementCard[]>([]);
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
  const [gamePhase, setGamePhase] = useState<'deckBuilder' | 'battle' | 'result' | 'gameOver'>('deckBuilder');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferDirection, setTransferDirection] = useState<'left' | 'right'>('right');
  const [currentDeckName, setCurrentDeckName] = useState<string | null>(null);
  const [whoChooses, setWhoChooses] = useState<'player' | 'opponent'>('player');
  const [isPaused, setIsPaused] = useState(false);
  const [initialPlayerCards, setInitialPlayerCards] = useState(0);
  const [initialOpponentCards, setInitialOpponentCards] = useState(0);
  const [showVictoryEffect, setShowVictoryEffect] = useState(false);
  const [victoryType, setVictoryType] = useState<'victory' | 'defeat' | 'draw'>('victory');
  const [showParticles, setShowParticles] = useState(false);
  const [playerLevel, setPlayerLevel] = useState({ 
    level: 1, 
    experience: 0, 
    experienceToNextLevel: 100, 
    totalExperience: 0 
  });
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    loadUserCards();
    loadAllCards();
  }, []);

  // Lógica para oponente escolher atributo automaticamente
  useEffect(() => {
    if (whoChooses === 'opponent' && !battle.selectedAttribute && battle.opponentCard && gamePhase === 'battle') {
      const timer = setTimeout(() => {
        // Oponente escolhe o melhor atributo da carta dele
        const attributes: BattleAttribute[] = ['atomic_number', 'atomic_mass', 'density', 'melting_point', 'reactivity', 'radioactivity'];
        const opponentCard = battle.opponentCard!;
        
        // Escolhe o atributo com maior valor
        let bestAttribute = attributes[0];
        let bestValue = opponentCard[bestAttribute];
        
        for (const attr of attributes) {
          if (opponentCard[attr] > bestValue) {
            bestAttribute = attr;
            bestValue = opponentCard[attr];
          }
        }
        
        setBattle(prev => ({ ...prev, selectedAttribute: bestAttribute }));
        setIsCardFlipped(true);
        
        setTimeout(() => {
          calculateBattleResult(bestAttribute);
        }, 1000);
      }, 2000); // 2 segundos para simular "pensamento"

      return () => clearTimeout(timer);
    }
  }, [whoChooses, battle.selectedAttribute, battle.opponentCard, gamePhase]);

  const loadUserCards = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_cards')
      .select(`
        card_id,
        element_cards (*)
      `)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar suas cartas",
        variant: "destructive"
      });
      return;
    }

    const cards = data?.map(item => item.element_cards).filter(Boolean) || [];
    setUserCards(cards as ElementCard[]);
  };

  const loadAllCards = async () => {
    const { data, error } = await supabase
      .from('element_cards')
      .select('*')
      .order('atomic_number');

    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar cartas do jogo",
        variant: "destructive"
      });
      return;
    }

    setAllCards(data || []);
  };

  const saveGameResult = async (isVictory: boolean) => {
    if (!user) return;

    try {
      // Buscar ou criar registro do ranking do usuário
      const { data: existingRanking } = await supabase
        .from('card_game_rankings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const gamesWon = isVictory ? (existingRanking?.games_won || 0) + 1 : (existingRanking?.games_won || 0);
      const gamesLost = !isVictory ? (existingRanking?.games_lost || 0) + 1 : (existingRanking?.games_lost || 0);
      const totalGames = gamesWon + gamesLost;
      const winRate = totalGames > 0 ? (gamesWon / totalGames) * 100 : 0;
      const currentScore = battle.playerScore * 10 + (isVictory ? 100 : 0);
      const newTotalScore = (existingRanking?.total_score || 0) + currentScore;

      const rankingData = {
        user_id: user.id,
        player_name: user.email?.split('@')[0] || 'Jogador',
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
          .eq('user_id', user.id);
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
  };

  const startBattle = (selectedCards: ElementCard[], deckName?: string) => {
    if (selectedCards.length < 6) {
      toast({
        title: "Erro",
        description: "Você precisa selecionar pelo menos 6 cartas para formar um baralho",
        variant: "destructive"
      });
      return;
    }

    setCurrentDeckName(deckName || null);

    // Embaralhar as cartas do jogador
    const shuffledPlayerDeck = [...selectedCards].sort(() => Math.random() - 0.5);
    
    // Criar baralho do oponente com cartas aleatórias
    const opponentDeck = [];
    const availableCards = [...allCards];
    for (let i = 0; i < selectedCards.length; i++) {
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      opponentDeck.push(availableCards[randomIndex]);
    }

    // Store initial deck sizes for progress tracking
    setInitialPlayerCards(shuffledPlayerDeck.length);
    setInitialOpponentCards(opponentDeck.length);
    
    setBattle(prev => ({
      ...prev,
      playerDeck: shuffledPlayerDeck,
      opponentDeck: opponentDeck,
      playerCard: shuffledPlayerDeck[0],
      opponentCard: opponentDeck[0],
      selectedAttribute: null,
      battleResult: null
    }));
    
    setWhoChooses('player'); // Jogador sempre começa escolhendo
    setGamePhase('battle');
  };

  const selectAttribute = (attribute: BattleAttribute) => {
    if (!battle.playerCard || !battle.opponentCard || whoChooses !== 'player') return;

    setBattle(prev => ({ ...prev, selectedAttribute: attribute }));
    
    // Flip the card to show opponent's attributes
    setIsCardFlipped(true);
    
    setTimeout(() => {
      calculateBattleResult(attribute);
    }, 1000);
  };

  const calculateBattleResult = (attribute: BattleAttribute) => {
    if (!battle.playerCard || !battle.opponentCard) return;

    const playerValue = battle.playerCard[attribute];
    const opponentValue = battle.opponentCard[attribute];

    let result: 'win' | 'lose' | 'draw';

    // Verifica Super Trunfo
    if (battle.playerCard.is_super_trump && !battle.opponentCard.is_super_trump) {
      // Super Trunfo vs carta normal
      if (battle.playerCard.trump_weakness && battle.opponentCard.symbol === battle.playerCard.trump_weakness) {
        result = 'lose';
      } else {
        result = 'win';
      }
    } else if (battle.opponentCard.is_super_trump && !battle.playerCard.is_super_trump) {
      // Carta normal vs Super Trunfo
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

    setBattle(prev => ({ ...prev, battleResult: result }));
    setGamePhase('result');
    
    // Enhanced effects
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
    } else {
      setVictoryType('draw');
      setShowVictoryEffect(true);
    }
  };

  const nextRound = () => {
    setIsCardFlipped(false);
    setIsTransferring(true);
    setShowVictoryEffect(false);
    setShowParticles(false);

    setBattle(prev => {
      if (!prev.playerCard || !prev.opponentCard || !prev.battleResult) {
        return prev;
      }

      let newPlayerDeck = [...prev.playerDeck.slice(1)]; // Remove a carta jogada do topo
      let newOpponentDeck = [...prev.opponentDeck.slice(1)]; // Remove a carta jogada do topo
      let newDiscardPile = [...prev.discardPile];
      let newWhoChooses = whoChooses;
      let newPlayerScore = prev.playerScore;
      let newOpponentScore = prev.opponentScore;

      // Cartas em jogo (a serem distribuídas)
      const cardsInPlay = [prev.playerCard, prev.opponentCard, ...newDiscardPile];

      if (prev.battleResult === 'win') {
        // Jogador vence: ganha todas as cartas em jogo
        newPlayerDeck = [...newPlayerDeck, ...cardsInPlay];
        newDiscardPile = [];
        newWhoChooses = 'player'; // Vencedor escolhe próximo atributo
        newPlayerScore = prev.playerScore + 1;
        setTransferDirection('left'); // Cartas vão para o jogador (esquerda)
      } else if (prev.battleResult === 'lose') {
        // Oponente vence: ganha todas as cartas em jogo
        newOpponentDeck = [...newOpponentDeck, ...cardsInPlay];
        newDiscardPile = [];
        newWhoChooses = 'opponent'; // Vencedor escolhe próximo atributo
        newOpponentScore = prev.opponentScore + 1;
        setTransferDirection('right'); // Cartas vão para o oponente (direita)
      } else {
        // Empate: cartas vão para pilha de descarte
        newDiscardPile = cardsInPlay;
        // Quem escolhe continua o mesmo
      }

      // Verificar fim de jogo
      if (newPlayerDeck.length === 0) {
        setTimeout(() => {
          setGamePhase('gameOver');
          saveGameResult(false); // Jogador perdeu
        }, 500);
        return {
          ...prev,
          playerDeck: newPlayerDeck,
          opponentDeck: newOpponentDeck,
          discardPile: newDiscardPile,
          playerScore: newPlayerScore,
          opponentScore: newOpponentScore,
          battleResult: null,
          selectedAttribute: null,
          playerCard: null,
          opponentCard: null
        };
      }

      if (newOpponentDeck.length === 0) {
        setTimeout(() => {
          setGamePhase('gameOver');
          saveGameResult(true); // Jogador ganhou
        }, 500);
        return {
          ...prev,
          playerDeck: newPlayerDeck,
          opponentDeck: newOpponentDeck,
          discardPile: newDiscardPile,
          playerScore: newPlayerScore,
          opponentScore: newOpponentScore,
          battleResult: null,
          selectedAttribute: null,
          playerCard: null,
          opponentCard: null
        };
      }

      // Continua o jogo
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

    // Atualizar quem escolhe depois da transferência
    setTimeout(() => {
      setWhoChooses(prev => {
        if (battle.battleResult === 'win') return 'player';
        if (battle.battleResult === 'lose') return 'opponent';
        return prev; // Mantém o mesmo em caso de empate
      });
      setIsTransferring(false);
      setGamePhase('battle');
    }, 1000);
  };

  if (userCards.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-xl font-semibold mb-4">Você precisa de cartas para batalhar!</h3>
        <p className="text-muted-foreground mb-6">
          Colete seus primeiros cavaleiros para começar a jogar
        </p>
        <Button 
          onClick={() => window.location.href = '/collection'}
          className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark font-semibold"
        >
          Ir para Coleção
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-space-dark via-cosmic-nebula to-space-dark relative overflow-hidden">
        <ParticleEffect 
          isActive={showParticles}
          particleCount={25}
          colors={['hsl(45, 100%, 50%)', 'hsl(280, 60%, 40%)', 'hsl(220, 70%, 40%)']}
        />
        
        <div className="max-w-6xl mx-auto space-y-6 relative z-10 p-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent mb-4">
              Arena de Batalha {currentDeckName && `- ${currentDeckName}`}
            </h2>
            
            {(gamePhase === 'battle' || gamePhase === 'result' || gamePhase === 'gameOver') && (
              <div className="max-w-md mx-auto mb-4">
                <PlayerLevel {...playerLevel} />
              </div>
            )}
          </div>

          <div className="text-center mb-4">
            <Button
              variant="outline"
              onClick={() => setShowTutorial(true)}
              className="border-cosmic-gold/50 text-cosmic-gold hover:bg-cosmic-gold/10"
            >
              Abrir Tutorial
            </Button>
          </div>

          {gamePhase === 'deckBuilder' && (
            <DeckBuilder
              userCards={userCards}
              onStartBattle={startBattle}
              onCancel={() => setGamePhase('deckBuilder')}
            />
          )}

          {gamePhase === 'battle' && battle.playerCard && battle.opponentCard && (
            <div>
              <TurnIndicator
                whoChooses={whoChooses}
                isActive={!battle.selectedAttribute && !isPaused && !isTransferring}
                onTimeOut={() => {}}
                timeLimit={15}
              />

              <BattleProgress
                playerCards={battle.playerDeck.length}
                opponentCards={battle.opponentDeck.length}
                initialPlayerCards={initialPlayerCards}
                initialOpponentCards={initialOpponentCards}
                round={battle.round}
                playerScore={battle.playerScore}
                opponentScore={battle.opponentScore}
              />

              <div className="text-center mb-4">
                <CardCounter
                  playerCards={battle.playerDeck.length}
                  opponentCards={battle.opponentDeck.length}
                />
                {battle.discardPile.length > 0 && (
                  <div className="text-sm text-cosmic-blue mt-2">
                    Cartas em disputa: {battle.discardPile.length}
                  </div>
                )}
              </div>

              {whoChooses === 'opponent' && !battle.selectedAttribute && (
                <div className="text-center mb-4">
                  <ThinkingIndicator 
                    message="Oponente escolhendo atributo..." 
                    isVisible={true}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6 justify-items-center">
                <BattleCard
                  card={battle.playerCard} 
                  showAttributes={true}
                  selectedAttribute={battle.selectedAttribute}
                  onAttributeSelect={selectAttribute}
                  canSelectAttribute={!battle.selectedAttribute && whoChooses === 'player' && !isTransferring}
                  isFlipped={false}
                />
                
                <BattleCard
                  card={battle.opponentCard} 
                  showAttributes={battle.selectedAttribute ? true : false}
                  selectedAttribute={battle.selectedAttribute}
                  isOpponent={true}
                  isFlipped={isCardFlipped}
                />
              </div>

              <BattleControls
                onSurrender={() => {
                  setGamePhase('gameOver');
                  setBattle(prev => ({
                    ...prev,
                    playerDeck: [],
                    opponentDeck: [...prev.opponentDeck, ...prev.playerDeck]
                  }));
                }}
                onPause={() => setIsPaused(!isPaused)}
                isPaused={isPaused}
              />
            </div>
          )}

          {gamePhase === 'result' && battle.battleResult && (
            <div className="text-center space-y-4">
              <div className={`text-3xl font-bold ${
                battle.battleResult === 'win' ? 'text-cosmic-gold' : 
                battle.battleResult === 'lose' ? 'text-red-500' : 'text-cosmic-blue'
              }`}>
                {battle.battleResult === 'win' && '🏆 VITÓRIA!'}
                {battle.battleResult === 'lose' && '💥 DERROTA!'}
                {battle.battleResult === 'draw' && '⚖️ EMPATE!'}
              </div>
              
              <Button onClick={nextRound}>
                Próxima Rodada
              </Button>
            </div>
          )}

          {gamePhase === 'gameOver' && (
            <div className="text-center space-y-6">
              <div className="text-4xl font-bold">
                {battle.playerDeck.length === 0 ? (
                  <span className="text-red-500">💥 DERROTA!</span>
                ) : (
                  <span className="text-cosmic-gold">🏆 VITÓRIA FINAL!</span>
                )}
              </div>
              
              <div className="text-lg text-muted-foreground">
                {battle.playerDeck.length === 0 ? (
                  "Você ficou sem cartas! O oponente venceu."
                ) : (
                  `Parabéns! O oponente ficou sem cartas. Você venceu com ${battle.playerDeck.length} cartas restantes!`
                )}
              </div>
              
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => {
                    setBattle({
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
                    setCurrentDeckName(null);
                    setWhoChooses('player');
                    setGamePhase('deckBuilder');
                  }}
                >
                  Nova Batalha
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/ranking'}
                >
                  Ver Ranking
                </Button>
              </div>
            </div>
          )}
        </div>

        <VictoryEffect 
          isVisible={showVictoryEffect}
          type={victoryType}
          onComplete={() => {
            setShowVictoryEffect(false);
            setShowParticles(false);
          }}
        />
        
        <TutorialModal
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          onComplete={(tutorialId) => {
            const xpGained = 50;
            setPlayerLevel(prev => ({
              ...prev,
              experience: prev.experience + xpGained,
              totalExperience: prev.totalExperience + xpGained
            }));
            toast({
              title: "Tutorial Concluído!",
              description: `Parabéns! +${xpGained} XP`,
            });
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Battle;
