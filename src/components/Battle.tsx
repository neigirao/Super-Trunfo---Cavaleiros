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

  useEffect(() => {
    loadUserCards();
    loadAllCards();
  }, []);

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

  const playNextCards = () => {
    setBattle(prev => {
      const newPlayerDeck = [...prev.playerDeck];
      const newOpponentDeck = [...prev.opponentDeck];
      
      // Remove cartas jogadas
      newPlayerDeck.shift();
      newOpponentDeck.shift();
      
      // Verifica se algum jogador ficou sem cartas
      if (newPlayerDeck.length === 0 || newOpponentDeck.length === 0) {
        setGamePhase('gameOver');
        return prev;
      }
      
      return {
        ...prev,
        playerDeck: newPlayerDeck,
        opponentDeck: newOpponentDeck,
        playerCard: newPlayerDeck[0],
        opponentCard: newOpponentDeck[0],
        selectedAttribute: null,
        battleResult: null,
        round: prev.round + 1
      };
    });
    
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

  const opponentSelectAttribute = () => {
    if (!battle.playerCard || !battle.opponentCard || whoChooses !== 'opponent') return;

    // Oponente escolhe automaticamente o melhor atributo para ele
    const attributes: BattleAttribute[] = ['atomic_number', 'atomic_mass', 'density', 'melting_point', 'reactivity', 'radioactivity'];
    
    let bestAttribute = attributes[0];
    let bestAdvantage = -Infinity;
    
    attributes.forEach(attr => {
      const opponentValue = battle.opponentCard![attr];
      const playerValue = battle.playerCard![attr];
      const advantage = opponentValue - playerValue;
      
      if (advantage > bestAdvantage) {
        bestAdvantage = advantage;
        bestAttribute = attr;
      }
    });

    setBattle(prev => ({ ...prev, selectedAttribute: bestAttribute }));
    
    // Flip the card to show opponent's attributes
    setIsCardFlipped(true);
    
    setTimeout(() => {
      calculateBattleResult(bestAttribute);
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

    // Start transfer animation
    if (result !== 'draw') {
      setIsTransferring(true);
      setTransferDirection(result === 'win' ? 'right' : 'left');
    }

    setBattle(prev => {
      const updatedBattle = {
        ...prev,
        battleResult: result,
      };

      // Atualizar baralhos baseado no resultado
      if (result === 'win') {
        // Jogador ganha - adiciona cartas ao final do seu baralho
        const newPlayerDeck = [...prev.playerDeck.slice(1)]; // Remove carta atual
        newPlayerDeck.push(prev.playerCard!, prev.opponentCard!, ...prev.discardPile);
        
        updatedBattle.playerDeck = newPlayerDeck;
        updatedBattle.opponentDeck = prev.opponentDeck.slice(1); // Remove carta do oponente
        updatedBattle.playerScore = prev.playerScore + 1;
        updatedBattle.discardPile = [];
        
        // Jogador ganha, então ele escolhe no próximo round
        setWhoChooses('player');
      } else if (result === 'lose') {
        // Oponente ganha - adiciona cartas ao final do seu baralho  
        const newOpponentDeck = [...prev.opponentDeck.slice(1)]; // Remove carta atual
        newOpponentDeck.push(prev.playerCard!, prev.opponentCard!, ...prev.discardPile);
        
        updatedBattle.opponentDeck = newOpponentDeck;
        updatedBattle.playerDeck = prev.playerDeck.slice(1); // Remove carta do jogador
        updatedBattle.opponentScore = prev.opponentScore + 1;
        updatedBattle.discardPile = [];
        
        // Oponente ganha, então ele escolhe no próximo round
        setWhoChooses('opponent');
      } else {
        // Empate - cartas vão para a pilha de descarte, quem escolhe continua o mesmo
        updatedBattle.discardPile = [...prev.discardPile, prev.playerCard!, prev.opponentCard!];
        updatedBattle.playerDeck = prev.playerDeck.slice(1);
        updatedBattle.opponentDeck = prev.opponentDeck.slice(1);
      }

      return updatedBattle;
    });

    setGamePhase('result');
  };

  const nextRound = () => {
    // Reset animations
    setIsCardFlipped(false);
    setIsTransferring(false);
    
    setBattle(prev => {
      // Verifica se algum jogador ficou sem cartas
      if (prev.playerDeck.length === 0) {
        setGamePhase('gameOver');
        return prev;
      }
      if (prev.opponentDeck.length === 0) {
        setGamePhase('gameOver');
        return prev;
      }

      return {
        ...prev,
        playerCard: prev.playerDeck[0] || null,
        opponentCard: prev.opponentDeck[0] || null,
        selectedAttribute: null,
        battleResult: null,
        round: prev.round + 1
      };
    });
    
    setGamePhase('battle');
  };

  // Efeito para fazer o oponente escolher automaticamente quando é a sua vez
  useEffect(() => {
    if (gamePhase === 'battle' && whoChooses === 'opponent' && battle.playerCard && battle.opponentCard && !battle.selectedAttribute) {
      const timer = setTimeout(() => {
        opponentSelectAttribute();
      }, 1500); // Delay para parecer que o oponente está "pensando"
      
      return () => clearTimeout(timer);
    }
  }, [gamePhase, whoChooses, battle.playerCard, battle.opponentCard, battle.selectedAttribute]);

  const getAttributeLabel = (attribute: BattleAttribute): string => {
    const labels = {
      atomic_number: 'Nº Atômico',
      atomic_mass: 'Massa Atômica',
      density: 'Densidade',
      melting_point: 'Ponto de Fusão',
      reactivity: 'Reatividade',
      radioactivity: 'Radioatividade'
    };
    return labels[attribute];
  };

  const getAttributeIcon = (attribute: BattleAttribute) => {
    const icons = {
      atomic_number: <Crown className="w-4 h-4" />,
      atomic_mass: <Sword className="w-4 h-4" />,
      density: <Shield className="w-4 h-4" />,
      melting_point: <Flame className="w-4 h-4" />,
      reactivity: <Zap className="w-4 h-4" />,
      radioactivity: <Star className="w-4 h-4" />
    };
    return icons[attribute];
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Battle Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent mb-2">
          Arena de Batalha {currentDeckName && `- ${currentDeckName}`}
        </h2>
        <div className="flex justify-center space-x-8">
          <div className="text-center">
            <div className="text-lg font-bold text-cosmic-gold">{battle.playerDeck.length}</div>
            <div className="text-sm text-muted-foreground">Suas Cartas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-cosmic-blue">{battle.round}</div>
            <div className="text-sm text-muted-foreground">Rodada</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-cosmic-purple">{battle.opponentDeck.length}</div>
            <div className="text-sm text-muted-foreground">Cartas Oponente</div>
          </div>
        </div>
      </div>

      {/* Deck Builder Phase */}
      {gamePhase === 'deckBuilder' && (
        <DeckBuilder
          userCards={userCards}
          onStartBattle={startBattle}
          onCancel={() => setGamePhase('deckBuilder')}
        />
      )}

      {/* Battle Phase */}
      {gamePhase === 'battle' && battle.playerCard && battle.opponentCard && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-center">
            {!battle.selectedAttribute ? (
              whoChooses === 'player' ? 
                'Clique em um atributo na sua carta para comparar' : 
                'Oponente está escolhendo o atributo...'
            ) : 'Comparando atributos...'}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6 justify-items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <h4 className="text-center font-semibold text-cosmic-gold mb-4">Sua Carta</h4>
              <BattleCard
                card={battle.playerCard} 
                showAttributes={true}
                selectedAttribute={battle.selectedAttribute}
                onAttributeSelect={selectAttribute}
                canSelectAttribute={!battle.selectedAttribute && whoChooses === 'player'}
                isFlipped={false}
                isTransferring={isTransferring && battle.battleResult === 'lose'}
                transferDirection="left"
              />
            </motion.div>
            
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <h4 className="text-center font-semibold text-cosmic-purple mb-4">Oponente</h4>
              <BattleCard
                card={battle.opponentCard} 
                showAttributes={battle.selectedAttribute ? true : false}
                selectedAttribute={battle.selectedAttribute}
                isOpponent={true}
                isFlipped={isCardFlipped}
                isTransferring={isTransferring && battle.battleResult === 'win'}
                transferDirection="right"
              />
            </motion.div>
          </div>
        </div>
      )}

      {/* Result Phase */}
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
          
          {battle.selectedAttribute && battle.playerCard && battle.opponentCard && (
            <div className="bg-card/50 p-4 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-muted-foreground mb-2">
                Comparação: {getAttributeLabel(battle.selectedAttribute)}
              </p>
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="font-bold text-cosmic-gold">Você</div>
                  <div className="text-lg">{battle.playerCard[battle.selectedAttribute]}</div>
                </div>
                <div className="text-muted-foreground">VS</div>
                <div className="text-center">
                  <div className="font-bold text-cosmic-purple">Oponente</div>
                  <div className="text-lg">{battle.opponentCard[battle.selectedAttribute]}</div>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={nextRound}
            className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark font-semibold"
          >
            Próxima Rodada
          </Button>
        </div>
      )}

      {/* Game Over Phase */}
      {gamePhase === 'gameOver' && (
        <div className="text-center space-y-6">
          <div className="text-4xl font-bold">
            {battle.playerDeck.length > battle.opponentDeck.length ? (
              <span className="text-cosmic-gold">🏆 VITÓRIA FINAL!</span>
            ) : (
              <span className="text-red-500">💥 DERROTA!</span>
            )}
          </div>
          
          <div className="bg-card/50 p-6 rounded-lg max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">Resultado Final</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Suas vitórias:</span>
                <span className="font-bold text-cosmic-gold">{battle.playerScore}</span>
              </div>
              <div className="flex justify-between">
                <span>Vitórias do oponente:</span>
                <span className="font-bold text-cosmic-purple">{battle.opponentScore}</span>
              </div>
              <div className="flex justify-between">
                <span>Cartas restantes (você):</span>
                <span className="font-bold">{battle.playerDeck.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Cartas restantes (oponente):</span>
                <span className="font-bold">{battle.opponentDeck.length}</span>
              </div>
            </div>
          </div>

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
            className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark font-semibold"
          >
            Nova Batalha
          </Button>
        </div>
      )}
    </div>
  );
};

export default Battle;