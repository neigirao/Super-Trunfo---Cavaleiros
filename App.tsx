
import React, { useState, useEffect, useCallback } from 'react';
import { CardData, GameState, Attribute, RoundResult, UserProfile, RankingEntry, ElementType } from './types';
import { Card } from './components/Card';
import { Ranking } from './components/Ranking';
import { AdminPanel } from './components/AdminPanel';
import HomeMenu from './components/HomeMenu';
import Dashboard from './components/Dashboard';
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, width: '100%', alignItems: 'start' }}>
              {/* Player side */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {userProfile?.picture && (
                    <img src={userProfile.picture} alt="" style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #f4c349' }} />
                  )}
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 15, letterSpacing: '.15em', color: '#fff8e1' }}>
                    {(userProfile?.name || 'JOGADOR').toUpperCase()}
                  </span>
                </div>
                <Card card={playerCard} isPlayerTurn={isPlayerTurn} onAttributeSelect={handleAttributeSelect} advantageBonus={playerAdvantage ?? undefined} />
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.7)', padding: '3px 12px', border: '1px solid rgba(244,195,73,.3)' }}>
                  {playerDeck.length} cartas
                </div>
              </div>

              {/* Center separator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 72 }}>
                <div style={{ width: 1, height: 36, background: 'linear-gradient(180deg, transparent, #f4c349)' }} />
                <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 28, color: '#f4c349' }}>⚔</span>
                <div style={{ width: 1, height: 36, background: 'linear-gradient(180deg, #f4c349, transparent)' }} />
              </div>

              {/* AI side */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 15, letterSpacing: '.15em', color: 'rgba(255,236,196,.6)' }}>
                  ORÁCULO
                </span>
                <Card card={aiCard} isFaceDown={true} />
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.7)', padding: '3px 12px', border: '1px solid rgba(244,195,73,.3)' }}>
                  {aiDeck.length} cartas
                </div>
              </div>
            </div>

            {/* Status bar */}
            <div style={{
              padding: '13px 28px', maxWidth: 560, width: '100%', textAlign: 'center',
              background: 'rgba(10,5,0,.65)', border: '1px solid rgba(244,195,73,.2)',
              fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '.2em',
              minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isPlayerTurn && playerAdvantage && (
                <span style={{ color: '#50dc78' }}>✦ VANTAGEM ELEMENTAL — BÔNUS EM {playerAdvantage.attribute.toUpperCase()} ✦</span>
              )}
              {isPlayerTurn && !playerAdvantage && (
                <span style={{ color: 'rgba(255,236,196,.85)' }}>◇ SUA VEZ — ESCOLHA UM ATRIBUTO ◇</span>
              )}
              {!isPlayerTurn && (
                <span style={{ color: 'rgba(244,195,73,.5)' }}>· VEZ DO ORÁCULO ·</span>
              )}
            </div>
          </div>
        );
      }

      case GameState.RoundResult: {
        if (!roundResult) return null;
        const { winner, attribute, playerCard, aiCard, playerValue, aiValue, playerBonus } = roundResult;
        const resultText = winner === 'player'
          ? `Você venceu! ${playerValue} × ${aiValue} em ${attribute}.`
          : winner === 'ai'
          ? `Você perdeu! ${playerValue} × ${aiValue} em ${attribute}.`
          : `Empate! Ninguém venceu em ${attribute}.`;
        const resultColor = winner === 'player' ? '#f4c349' : winner === 'ai' ? '#d94a4a' : 'rgba(255,236,196,.8)';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, width: '100%', alignItems: 'start' }}>
              {/* Player */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 15, letterSpacing: '.15em', color: '#fff8e1' }}>
                  {(userProfile?.name || 'JOGADOR').toUpperCase()}
                </span>
                <Card card={playerCard} highlightedAttribute={attribute} isWinner={isRevealing && winner === 'player'} isLoser={isRevealing && winner === 'ai'} />
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.7)', padding: '3px 12px', border: '1px solid rgba(244,195,73,.3)' }}>
                  {playerDeck.length} cartas
                </div>
              </div>

              {/* Center */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 72, transition: 'opacity 0.5s', opacity: showResultInfo ? 1 : 0 }}>
                <div style={{ width: 1, height: 36, background: 'linear-gradient(180deg, transparent, #f4c349)' }} />
                <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 28, color: '#f4c349' }}>⚔</span>
                <div style={{ width: 1, height: 36, background: 'linear-gradient(180deg, #f4c349, transparent)' }} />
              </div>

              {/* AI */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 15, letterSpacing: '.15em', color: 'rgba(255,236,196,.6)' }}>
                  ORÁCULO
                </span>
                <Card card={aiCard} isFaceDown={!isRevealing} highlightedAttribute={attribute} isWinner={isRevealing && winner === 'ai'} isLoser={isRevealing && winner === 'player'} />
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.7)', padding: '3px 12px', border: '1px solid rgba(244,195,73,.3)' }}>
                  {aiDeck.length} cartas
                </div>
              </div>
            </div>

            {/* Result panel */}
            <div style={{
              padding: '22px 36px', maxWidth: 600, width: '100%', textAlign: 'center',
              background: 'linear-gradient(180deg, rgba(20,8,10,.9), rgba(10,5,0,.7))',
              border: '1px solid rgba(244,195,73,.3)',
              transition: 'opacity 0.5s', opacity: showResultInfo ? 1 : 0,
              minHeight: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              {showResultInfo && (
                <>
                  <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 20, letterSpacing: '.08em', color: resultColor, margin: 0 }}>
                    {resultText}
                  </p>
                  {playerBonus > 0 && winner === 'player' && (
                    <p style={{ fontFamily: 'Spectral, serif', fontSize: 14, color: '#50dc78', margin: 0 }}>
                      Sua vantagem elemental garantiu a vitória!
                    </p>
                  )}
                  {showNextRoundButton && (
                    <button onClick={handleNextRound} style={{
                      marginTop: 6, fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 11, letterSpacing: '.3em',
                      color: '#1a0e04', padding: '11px 24px', cursor: 'pointer',
                      background: 'linear-gradient(180deg,#f4c349,#8a6a2a)',
                      border: '1px solid #f4c349',
                      boxShadow: '0 0 14px rgba(244,195,73,.4)',
                    }}>
                      PRÓXIMA RODADA →
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
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto', padding: '60px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <span style={{ width: 48, height: 1, background: '#f4c349', display: 'block' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.5em', color: '#f4c349' }}>
                {playerWon ? '· VITÓRIA ·' : '· DERROTA ·'}
              </span>
              <span style={{ width: 48, height: 1, background: '#f4c349', display: 'block' }} />
            </div>

            <h1 style={{
              fontFamily: 'Cinzel, serif', fontWeight: 900,
              fontSize: 'clamp(44px,6vw,72px)', letterSpacing: '.06em',
              color: '#fff8e1', margin: '0 0 12px',
              textShadow: playerWon ? '0 0 30px rgba(244,195,73,.5)' : '0 0 30px rgba(217,74,74,.4)',
            }}>
              {playerWon ? '⚔ VITÓRIA' : '✦ DERROTA'}
            </h1>

            <div style={{ width: 80, height: 2, background: '#f4c349', margin: '0 auto 20px' }} />

            <p style={{
              fontFamily: 'Spectral, serif', fontSize: 18, lineHeight: 1.55,
              color: 'rgba(255,236,196,.75)', margin: '0 0 40px',
            }}>
              {playerWon
                ? 'Você coletou todas as cartas do oponente e conquistou o cosmos!'
                : 'O Oráculo coletou todas as suas cartas. A batalha foi perdida.'}
            </p>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={startGame} style={{
                fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 12, letterSpacing: '.3em',
                color: '#1a0e04', padding: '14px 30px', cursor: 'pointer',
                background: 'linear-gradient(180deg,#f4c349,#8a6a2a)',
                border: '2px solid #f4c349',
                boxShadow: '0 0 0 1px #1a0e04, 0 0 24px rgba(244,195,73,.5)',
              }}>⚔ JOGAR NOVAMENTE</button>
              <button onClick={handleBackToMenu} style={{
                fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 12, letterSpacing: '.3em',
                color: '#fff8e1', padding: '14px 30px', cursor: 'pointer',
                background: 'transparent', border: '1px solid rgba(244,195,73,.4)',
              }}>← VOLTAR AO MENU</button>
            </div>
          </div>
        );
      }

      case GameState.Ranking:
        return <Ranking rankingData={[]} onBack={handleBackToMenu} />;

      case GameState.Admin:
        return <AdminPanel cards={deck} onSave={handleSaveCard} onDelete={handleDeleteCard} onBack={handleBackToMenu} />;

    }
  };

  if (gameState === GameState.Menu) {
    if (userProfile) {
      return (
        <Dashboard
          userProfile={userProfile}
          isAdmin={isAdmin}
          onStartGame={startGame}
          onGoToRanking={() => setGameState(GameState.Ranking)}
          onGoToAdmin={() => setGameState(GameState.Admin)}
        />
      );
    }
    return (
      <HomeMenu
        userProfile={userProfile}
        isAdmin={isAdmin}
        isClientIdConfigured={isClientIdConfigured}
        onStartGame={startGame}
        onGoToRanking={() => setGameState(GameState.Ranking)}
        onGoToAdmin={() => setGameState(GameState.Admin)}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #06030a 0%, #0a0500 40%, #06030a 100%)', color: '#fff8e1', position: 'relative' }}>
      {/* Star field */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          radial-gradient(2px 2px at 20px 30px, #f4c349, transparent),
          radial-gradient(1px 1px at 80px 130px, #fff8e1, transparent),
          radial-gradient(1px 1px at 150px 60px, #f4c349, transparent),
          radial-gradient(2px 2px at 280px 180px, #fff, transparent),
          radial-gradient(1px 1px at 340px 90px, #fff8e1, transparent),
          radial-gradient(1px 1px at 60px 250px, #f4c349, transparent),
          radial-gradient(2px 2px at 370px 280px, #fff8e1, transparent)
        `,
        backgroundSize: '400px 320px', opacity: 0.3,
      }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 48px' }}>
        <div style={{ width: '100%', maxWidth: 1200 }}>
          {renderGameState()}
        </div>
      </div>
    </div>
  );
};

export default App;