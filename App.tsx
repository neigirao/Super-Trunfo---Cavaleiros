
import React, { useState, useEffect, useCallback } from 'react';
import { CardData, GameState, Attribute, RoundResult, UserProfile, RankingEntry, ElementType } from './types';
import { Card } from './components/Card';
import { Ranking } from './components/Ranking';
import { AdminPanel } from './components/AdminPanel';
import { initialDeck } from './initialDeck';

// ==================================================================
// CONFIGURAÇÕES IMPORTANTES - ATUALIZE ESTES VALORES
// ==================================================================

// 1. E-mail do Administrador:
//    Coloque o seu e-mail do Google aqui para ter acesso ao Painel de Admin.
const ADMIN_EMAIL = 'neigirao@gmail.com'; 

// 2. Google Client ID:
//    Substitua pelo Client ID que você gerou no Google Cloud Console.
//    O login NÃO FUNCIONARÁ sem um Client ID válido.
const GOOGLE_CLIENT_ID = '368113957803-4hh4b0iteaolth76fmcrovm7ljl2vrbe.apps.googleusercontent.com';

// ==================================================================

const ADVANTAGE_BONUS_PERCENTAGE = 0.20; // 20% de bônus

// Mapa de vantagens: [Atacante, Defensor]: Atributo que recebe o bônus
const advantageMap: { [key: string]: Attribute } = {
  [`${ElementType.Halogen}-${ElementType.AlkaliMetal}`]: Attribute.Reatividade,
  [`${ElementType.AlkaliMetal}-${ElementType.TransitionMetal}`]: Attribute.Dureza,
  [`${ElementType.TransitionMetal}-${ElementType.Actinide}`]: Attribute.Radioatividade,
  [`${ElementType.Actinide}-${ElementType.NobleGas}`]: Attribute.MassaAtomica,
  [`${ElementType.NobleGas}-${ElementType.Halogen}`]: Attribute.Reatividade,
};

const getAdvantage = (attacker: CardData, defender: CardData): { attribute: Attribute } | null => {
  const key = `${attacker.element}-${defender.element}`;
  const advantageAttribute = advantageMap[key];
  return advantageAttribute ? { attribute: advantageAttribute } : null;
};


const shuffleDeck = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

declare global {
  interface Window {
    google: any;
  }
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Menu);
  const [deck, setDeck] = useState<CardData[]>(() => {
    try {
      const savedDeckString = localStorage.getItem('superTrunfoDeck');
      if (savedDeckString) {
        const savedDeck = JSON.parse(savedDeckString);
        // Garante que o baralho salvo seja um array e não esteja vazio.
        if (Array.isArray(savedDeck) && savedDeck.length > 0) {
          return savedDeck;
        }
      }
    } catch (error) {
      console.error("Falha ao carregar o baralho do localStorage", error);
    }
    // Se não houver um baralho válido no localStorage, carrega o baralho inicial.
    return initialDeck;
  });
  const [playerDeck, setPlayerDeck] = useState<CardData[]>([]);
  const [aiDeck, setAiDeck] = useState<CardData[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [playerAdvantage, setPlayerAdvantage] = useState<{ attribute: Attribute; bonus: number } | null>(null);
  
  // States for round result animation orchestration
  const [isRevealing, setIsRevealing] = useState(false);
  const [showResultInfo, setShowResultInfo] = useState(false);
  const [showNextRoundButton, setShowNextRoundButton] = useState(false);


  const isClientIdConfigured = !!GOOGLE_CLIENT_ID;

  useEffect(() => {
    localStorage.setItem('superTrunfoDeck', JSON.stringify(deck));
  }, [deck]);
  
  const handleCredentialResponse = useCallback((response: any) => {
    // Decodificar o JWT para obter as informações do perfil
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const profile = JSON.parse(jsonPayload);
    const user: UserProfile = {
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
    };
    
    setUserProfile(user);
    if (user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    if (!isClientIdConfigured) return;
    
    const initializeGsi = () => {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse
            });
            window.google.accounts.id.renderButton(
                document.getElementById('google-signin-button'),
                { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with', shape: 'pill' }
            );
        }
    };
    
    if (document.readyState === 'complete') {
        initializeGsi();
    } else {
        window.addEventListener('load', initializeGsi);
        return () => window.removeEventListener('load', initializeGsi);
    }
  }, [handleCredentialResponse, isClientIdConfigured]);
  
  // Effect to orchestrate the animation sequence on the round result screen
  useEffect(() => {
    if (gameState === GameState.RoundResult && roundResult) {
        setIsRevealing(false);
        setShowResultInfo(false);
        setShowNextRoundButton(false);

        const flipTimer = setTimeout(() => setIsRevealing(true), 250);
        const infoTimer = setTimeout(() => setShowResultInfo(true), 1100); // After flip starts
        const buttonTimer = setTimeout(() => setShowNextRoundButton(true), 2200);

        return () => {
            clearTimeout(flipTimer);
            clearTimeout(infoTimer);
            clearTimeout(buttonTimer);
        };
    }
  }, [gameState, roundResult]);


  const startGame = () => {
    if (!userProfile) return;
    const shuffled = shuffleDeck(deck);
    const middleIndex = Math.ceil(shuffled.length / 2);
    setPlayerDeck(shuffled.slice(0, middleIndex));
    setAiDeck(shuffled.slice(middleIndex));
    setIsPlayerTurn(true);
    setRoundResult(null);
    setGameState(GameState.Playing);
  };
  
  useEffect(() => {
    if (gameState === GameState.Playing && playerDeck.length > 0 && aiDeck.length > 0) {
      const advantage = getAdvantage(playerDeck[0], aiDeck[0]);
      if (advantage) {
        const baseValue = playerDeck[0].attributes[advantage.attribute];
        const bonus = Math.round(baseValue * ADVANTAGE_BONUS_PERCENTAGE);
        setPlayerAdvantage({ attribute: advantage.attribute, bonus });
      } else {
        setPlayerAdvantage(null);
      }
    } else {
      setPlayerAdvantage(null);
    }
  }, [gameState, playerDeck, aiDeck]);


  const handleAttributeSelect = (attribute: Attribute) => {
    if (!isPlayerTurn || playerDeck.length === 0 || aiDeck.length === 0) return;

    const playerCard = playerDeck[0];
    const aiCard = aiDeck[0];
    
    let playerValue = playerCard.attributes[attribute];
    let aiValue = aiCard.attributes[attribute];
    let playerBonus = 0;
    let aiBonus = 0;

    // Checa vantagem do jogador
    const playerAdv = getAdvantage(playerCard, aiCard);
    if (playerAdv && playerAdv.attribute === attribute) {
      playerBonus = Math.round(playerValue * ADVANTAGE_BONUS_PERCENTAGE);
      playerValue += playerBonus;
    }

    // Checa vantagem da IA (não usada na vez do jogador, mas calculada para o resultado)
    const aiAdv = getAdvantage(aiCard, playerCard);
    if (aiAdv && aiAdv.attribute === attribute) {
        // A IA não ganha bônus quando se defende, mas guardamos para mostrar
    }

    let winner: 'player' | 'ai' | 'tie';

    if (playerCard.isSuperTrunfo && !aiCard.isSuperTrunfo) {
        winner = 'player';
    } else if (!playerCard.isSuperTrunfo && aiCard.isSuperTrunfo) {
        winner = 'ai';
    } else {
        if (playerValue > aiValue) {
          winner = 'player';
        } else if (aiValue > playerValue) {
          winner = 'ai';
        } else {
          winner = 'tie';
        }
    }
    
    setRoundResult({ winner, attribute, playerCard, aiCard, playerValue, aiValue, playerBonus, aiBonus });
    setGameState(GameState.RoundResult);
  };
  
  const handleNextRound = () => {
    if (!roundResult) return;

    let newPlayerDeck = [...playerDeck];
    let newAiDeck = [...aiDeck];
    const playerCard = newPlayerDeck.shift();
    const aiCard = newAiDeck.shift();

    if (playerCard && aiCard) {
        if (roundResult.winner === 'player') {
            newPlayerDeck.push(playerCard, aiCard);
            setIsPlayerTurn(true);
        } else if (roundResult.winner === 'ai') {
            newAiDeck.push(aiCard, playerCard);
            setIsPlayerTurn(false);
        } else {
            // Empate: as cartas voltam para o fundo do baralho de cada um
            newPlayerDeck.push(playerCard);
            newAiDeck.push(aiCard);
        }
    }

    setPlayerDeck(newPlayerDeck);
    setAiDeck(newAiDeck);

    if (newPlayerDeck.length === 0 || newAiDeck.length === 0) {
      setGameState(GameState.GameOver);
    } else {
      setRoundResult(null);
      setGameState(GameState.Playing);
    }
  };
  
  const handleBackToMenu = () => {
    setGameState(GameState.Menu);
  };
  
  const handleSaveCard = (cardToSave: CardData) => {
    setDeck(prevDeck => {
        const cardExists = prevDeck.some(c => c.id === cardToSave.id);

        if (cardExists) {
            // Mapeia o baralho e substitui a carta com o ID correspondente
            return prevDeck.map(card =>
                card.id === cardToSave.id ? cardToSave : card
            );
        } else {
            // Adiciona a nova carta ao baralho
            return [...prevDeck, cardToSave];
        }
    });
  };

  const handleDeleteCard = (cardId: string) => {
    setDeck(prevDeck => prevDeck.filter(c => c.id !== cardId));
  };


  const renderGameState = () => {
    switch (gameState) {
      case GameState.Playing: {
        const playerCard = playerDeck[0];
        const aiCard = aiDeck[0];
        return (
          <div className="flex flex-col items-center justify-center space-y-8 w-full">
            <div className="flex justify-around w-full items-start">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-2">{userProfile?.name || 'Jogador'}</h2>
                <Card 
                  card={playerCard} 
                  isPlayerTurn={isPlayerTurn} 
                  onAttributeSelect={handleAttributeSelect}
                  advantageBonus={playerAdvantage ?? undefined}
                />
                <p className="mt-2 font-bold text-xl">{playerDeck.length} cartas</p>
              </div>
              <div className="text-5xl font-bold font-cinzel text-slate-400 self-center px-8">VS</div>
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-2">Computador</h2>
                <Card card={aiCard} isFaceDown={true} />
                <p className="mt-2 font-bold text-xl">{aiDeck.length} cartas</p>
              </div>
            </div>
             <div className="text-center font-semibold text-xl h-12">
                {isPlayerTurn && playerAdvantage && (
                    <p className="text-green-400 animate-pulse">
                        Vantagem Elemental! Bônus em {playerAdvantage.attribute}!
                    </p>
                )}
                 {isPlayerTurn && !playerAdvantage && (
                     <p className="text-cyan-300">Sua vez! Escolha um atributo.</p>
                 )}
                 {!isPlayerTurn && (
                     <p className="text-slate-400">Vez do Computador.</p>
                 )}
            </div>
          </div>
        );
      }

      case GameState.RoundResult: {
        if (!roundResult) return null;
        const { winner, attribute, playerCard, aiCard, playerValue, aiValue, playerBonus } = roundResult;
        let resultText = '';
        if (winner === 'player') {
          resultText = `Você venceu! ${playerValue} contra ${aiValue} em ${attribute}.`;
        } else if (winner === 'ai') {
          resultText = `Você perdeu! ${playerValue} contra ${aiValue} em ${attribute}.`;
        } else {
          resultText = `Empate! Ninguém venceu em ${attribute}.`;
        }

        return (
          <div className="flex flex-col items-center justify-center space-y-4 w-full">
            <div className="flex justify-around w-full items-start">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-2">{userProfile?.name || 'Jogador'}</h2>
                <Card 
                  card={playerCard} 
                  highlightedAttribute={attribute} 
                  isWinner={isRevealing && winner === 'player'}
                  isLoser={isRevealing && winner === 'ai'}
                />
                <p className="mt-2 font-bold text-xl">{playerDeck.length} cartas</p>
              </div>
              <div className="text-5xl font-bold font-cinzel text-slate-400 self-center px-8 transition-opacity duration-500" style={{ opacity: showResultInfo ? 1 : 0 }}>VS</div>
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-2">Computador</h2>
                <Card 
                  card={aiCard}
                  isFaceDown={!isRevealing}
                  highlightedAttribute={attribute}
                  isWinner={isRevealing && winner === 'ai'}
                  isLoser={isRevealing && winner === 'player'}
                />
                <p className="mt-2 font-bold text-xl">{aiDeck.length} cartas</p>
              </div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg min-h-[140px] flex flex-col justify-center items-center transition-opacity duration-500" style={{ opacity: showResultInfo ? 1 : 0 }}>
              {showResultInfo && (
                <>
                  <p className={`text-2xl font-bold ${winner === 'player' ? 'text-green-400' : winner === 'ai' ? 'text-red-400' : 'text-yellow-400'}`}>{resultText}</p>
                  {playerBonus > 0 && winner === 'player' && (
                    <p className="text-green-300 text-lg mt-1">Sua vantagem elemental garantiu a vitória!</p>
                  )}
                  {showNextRoundButton && (
                    <button onClick={handleNextRound} className="mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg text-lg shadow-lg transition-transform transform hover:scale-105">
                      Próxima Rodada
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      }
      
      case GameState.GameOver: {
        const playerWon = playerDeck.length > 0;
        return (
          <div className="text-center">
            <h1 className="text-6xl font-bold font-cinzel mb-4">{playerWon ? '🎉 Vitória! 🎉' : 'Derrota'}</h1>
            <p className="text-2xl mb-8">{playerWon ? 'Você coletou todas as cartas do oponente!' : 'O computador coletou todas as suas cartas.'}</p>
            <button onClick={startGame} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg transition-transform transform hover:scale-105 mr-4">
              Jogar Novamente
            </button>
            <button onClick={handleBackToMenu} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg transition-transform transform hover:scale-105">
              Voltar ao Menu
            </button>
          </div>
        );
      }

      case GameState.Ranking:
        return <Ranking rankingData={[]} onBack={handleBackToMenu} />;

      case GameState.Admin:
        return <AdminPanel cards={deck} onSave={handleSaveCard} onDelete={handleDeleteCard} onBack={handleBackToMenu} />;

      case GameState.Menu:
      default:
        return (
          <div className="text-center">
            <h1 className="text-7xl font-bold font-cinzel mb-4 text-cyan-300">Super Trunfo</h1>
            <h2 className="text-4xl font-cinzel mb-8 text-slate-300">Cavaleiros Elementais</h2>
            
            {userProfile ? (
                <div className="mb-8 flex flex-col items-center">
                    <img src={userProfile.picture} alt={userProfile.name} className="w-24 h-24 rounded-full mb-4 border-4 border-cyan-400"/>
                    <p className="text-xl">Bem-vindo, {userProfile.name}!</p>
                </div>
            ) : (
                <div className="mb-8 flex flex-col items-center space-y-4">
                    <p className="text-lg">Faça login para jogar e entrar no ranking!</p>
                    {isClientIdConfigured ? (
                        <div id="google-signin-button"></div>
                    ) : (
                        <p className="text-red-400 bg-red-900/50 p-3 rounded-md">
                            <strong>Aviso:</strong> O Google Client ID não está configurado. O login não funcionará.
                            <br />
                            Por favor, edite o arquivo <code>App.tsx</code> e adicione seu Client ID.
                        </p>
                    )}
                </div>
            )}
            
            <div className="flex flex-col items-center space-y-4">
              <button 
                onClick={startGame} 
                disabled={!userProfile}
                title={!userProfile ? 'Faça login para jogar' : 'Iniciar uma nova partida'}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-lg text-2xl shadow-lg transition-transform transform hover:scale-105 w-64 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                Jogar
              </button>
              <button onClick={() => setGameState(GameState.Ranking)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-8 rounded-lg text-2xl shadow-lg transition-transform transform hover:scale-105 w-64">
                Ranking
              </button>
              {isAdmin && (
                 <button onClick={() => setGameState(GameState.Admin)} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-4 px-8 rounded-lg text-2xl shadow-lg transition-transform transform hover:scale-105 w-64">
                    Admin
                </button>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto">
        {renderGameState()}
      </div>
    </main>
  );
};

export default App;