
import React, { useState, useEffect, useCallback } from 'react';
import { CardData, GameState, Attribute, RoundResult, UserProfile, RankingEntry, ElementType, Difficulty } from './types';
import { Card } from './components/Card';
import { Ranking } from './components/Ranking';
import { AdminPanel } from './components/AdminPanel';
import { Rules } from './components/Rules';
import HomeMenu from './components/HomeMenu';
import Dashboard from './components/Dashboard';
import Collection from './components/Collection';
import { initialDeck } from './initialDeck';
import { playCardFlip, playRoundWin, playRoundLose, playRoundDraw, playGameWin, playGameLose } from './utils/sounds';
import { useIsMobile } from './utils/mobile';
import {
  supabase, signInWithGoogleToken, signOut as supabaseSignOut,
  loadDeckFromCloud, saveDeckToCloud,
  fetchRanking, upsertGameResult, RankingRow,
} from './utils/supabase';

// ==================================================================
// CONFIGURAÇÕES IMPORTANTES - ATUALIZE ESTES VALORES
// ==================================================================

// 1. E-mail do Administrador:
//    Coloque o seu e-mail do Google aqui para ter acesso ao Painel de Admin.
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? 'neigirao@gmail.com';

// 2. Google Client ID:
//    Substitua pelo Client ID que você gerou no Google Cloud Console.
//    O login NÃO FUNCIONARÁ sem um Client ID válido.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

// ==================================================================

const ADVANTAGE_BONUS_PERCENTAGE = 0.20; // 20% de bônus
const TURN_TIMER_SECONDS = 30;

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

const TimerRing: React.FC<{ timeLeft: number; total: number }> = ({ timeLeft, total }) => {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const progress = Math.max(0, timeLeft / total);
  const color = timeLeft > total * 0.5 ? '#50dc78' : timeLeft > total * 0.25 ? '#f4c349' : '#d94a4a';
  const urgent = timeLeft <= 7;
  return (
    <div style={{ position: 'relative', width: 50, height: 50, flexShrink: 0 }}>
      <svg width="50" height="50" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="25" cy="25" r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="2.5" />
        <circle
          cx="25" cy="25" r={r} fill="none" stroke={color} strokeWidth="2.5"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)', transformOrigin: '25px 25px',
            transition: 'stroke-dashoffset 0.9s linear, stroke 0.4s',
          }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 14, color,
        transition: 'color 0.4s',
        animation: urgent ? 'pulse 0.6s ease-in-out infinite alternate' : 'none',
      }}>{timeLeft}</div>
    </div>
  );
};

const App: React.FC = () => {
  const isMobile = useIsMobile();
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
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Normal);
  const [matchHistory, setMatchHistory] = useState<RoundResult[]>([]);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [playerAdvantage, setPlayerAdvantage] = useState<{ attribute: Attribute; bonus: number } | null>(null);
  const [p2Advantage, setP2Advantage] = useState<{ attribute: Attribute; bonus: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(TURN_TIMER_SECONDS);

  // States for round result animation orchestration
  const [isRevealing, setIsRevealing] = useState(false);
  const [showResultInfo, setShowResultInfo] = useState(false);
  const [showNextRoundButton, setShowNextRoundButton] = useState(false);

  // Card transfer animation: 'none' | 'player-wins' | 'ai-wins'
  const [transferAnim, setTransferAnim] = useState<'none' | 'player-wins' | 'ai-wins'>('none');

  // Ranking data (loaded from Supabase)
  const [rankingData, setRankingData] = useState<RankingEntry[]>([]);


  const isClientIdConfigured = !!GOOGLE_CLIENT_ID;

  useEffect(() => {
    localStorage.setItem('superTrunfoDeck', JSON.stringify(deck));
  }, [deck]);

  // Sync deck to Supabase whenever it changes (debounced via the state cycle)
  useEffect(() => {
    if (!userProfile) return;
    saveDeckToCloud(deck);
  }, [deck, userProfile]);
  
  const handleCredentialResponse = useCallback(async (response: any) => {
    // 1. Decodificar o JWT do Google para UI imediata
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    const profile = JSON.parse(jsonPayload);
    const user: UserProfile = { name: profile.name, email: profile.email, picture: profile.picture };
    setUserProfile(user);
    if (user.email === ADMIN_EMAIL) setIsAdmin(true);

    // 2. Autenticar no Supabase com o token do Google (JWT server-side)
    await signInWithGoogleToken(response.credential);

    // 3. Carregar baralho da nuvem (se existir)
    const cloudDeck = await loadDeckFromCloud();
    if (cloudDeck && cloudDeck.length > 0) {
      setDeck(cloudDeck);
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

  // ── Sound effects ──────────────────────────────────────────
  useEffect(() => {
    if (!roundResult) return;
    if (roundResult.winner === 'player') playRoundWin();
    else if (roundResult.winner === 'ai') playRoundLose();
    else playRoundDraw();
  }, [roundResult]);

  // ── resolveRound must be declared before any useEffect that references it ──
  const resolveRound = useCallback((attribute: Attribute, pCard: CardData, aCard: CardData) => {
    let playerValue = pCard.attributes[attribute];
    let aiValue = aCard.attributes[attribute];
    let playerBonus = 0;
    let aiBonus = 0;

    const playerAdv = getAdvantage(pCard, aCard);
    if (playerAdv && playerAdv.attribute === attribute) {
      playerBonus = Math.round(playerValue * ADVANTAGE_BONUS_PERCENTAGE);
      playerValue += playerBonus;
    }

    const aiAdv = getAdvantage(aCard, pCard);
    if (aiAdv && aiAdv.attribute === attribute) {
      aiBonus = Math.round(aiValue * ADVANTAGE_BONUS_PERCENTAGE);
      aiValue += aiBonus;
    }

    let winner: 'player' | 'ai' | 'tie';
    if (pCard.isSuperTrunfo && !aCard.isSuperTrunfo) {
      winner = 'player';
    } else if (!pCard.isSuperTrunfo && aCard.isSuperTrunfo) {
      winner = 'ai';
    } else {
      winner = playerValue > aiValue ? 'player' : aiValue > playerValue ? 'ai' : 'tie';
    }

    const result: RoundResult = { winner, attribute, playerCard: pCard, aiCard: aCard, playerValue, aiValue, playerBonus, aiBonus };
    setRoundResult(result);
    setMatchHistory(prev => [result, ...prev].slice(0, 10));
    setGameState(GameState.RoundResult);
  }, []);

  // ── Timer: reset at the start of each human turn ──────────
  useEffect(() => {
    if (gameState !== GameState.Playing) return;
    if (isPlayerTurn || isMultiplayer) setTimeLeft(TURN_TIMER_SECONDS);
  }, [isPlayerTurn, gameState, isMultiplayer]);

  // ── Timer: countdown + auto-select on expire ────────────
  useEffect(() => {
    if (gameState !== GameState.Playing) return;
    const humanTurn = isPlayerTurn || (isMultiplayer && !isPlayerTurn);
    if (!humanTurn) return;

    if (timeLeft <= 0) {
      if (playerDeck.length === 0 || aiDeck.length === 0) return;
      const deck = isPlayerTurn ? playerDeck : aiDeck;
      const attrs = Object.keys(deck[0].attributes) as Attribute[];
      const randomAttr = attrs[Math.floor(Math.random() * attrs.length)];
      playCardFlip();
      resolveRound(randomAttr, playerDeck[0], aiDeck[0]);
      return;
    }

    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [gameState, isPlayerTurn, isMultiplayer, timeLeft, playerDeck, aiDeck, resolveRound]);

  // ── AI turn: fires automatically when it's the AI's turn ──
  useEffect(() => {
    if (gameState !== GameState.Playing || isPlayerTurn) return;
    if (isMultiplayer) return; // P2 plays manually in multiplayer
    if (playerDeck.length === 0 || aiDeck.length === 0) return;

    const aiCard = aiDeck[0];
    const playerCard = playerDeck[0];

    const timer = setTimeout(() => {
      let bestAttr: Attribute;

      if (difficulty === Difficulty.Easy) {
        const attrs = Object.keys(aiCard.attributes) as Attribute[];
        bestAttr = attrs[Math.floor(Math.random() * attrs.length)];
      } else {
        const aiAdv = difficulty === Difficulty.Hard ? getAdvantage(aiCard, playerCard) : null;
        bestAttr = Object.keys(aiCard.attributes)[0] as Attribute;
        let bestValue = -1;
        (Object.entries(aiCard.attributes) as [Attribute, number][]).forEach(([attr, val]) => {
          const effective = aiAdv && aiAdv.attribute === attr
            ? val + Math.round(val * ADVANTAGE_BONUS_PERCENTAGE)
            : val;
          if (effective > bestValue) { bestValue = effective; bestAttr = attr; }
        });
      }

      resolveRound(bestAttr, playerCard, aiCard);
    }, 1400);

    return () => clearTimeout(timer);
  }, [gameState, isPlayerTurn, isMultiplayer, playerDeck, aiDeck, difficulty, resolveRound]);


  const startGame = (multiplayer = false) => {
    if (!userProfile || deck.length < 2) return;
    setIsMultiplayer(multiplayer);
    setMatchHistory([]);
    const shuffled = shuffleDeck(deck);
    const middleIndex = Math.floor(shuffled.length / 2);
    setPlayerDeck(shuffled.slice(0, middleIndex));
    setAiDeck(shuffled.slice(middleIndex));
    setIsPlayerTurn(true);
    setRoundResult(null);
    setGameState(GameState.Playing);
  };
  
  useEffect(() => {
    if (gameState === GameState.Playing && playerDeck.length > 0 && aiDeck.length > 0) {
      const adv1 = getAdvantage(playerDeck[0], aiDeck[0]);
      if (adv1) {
        const base = playerDeck[0].attributes[adv1.attribute];
        setPlayerAdvantage({ attribute: adv1.attribute, bonus: Math.round(base * ADVANTAGE_BONUS_PERCENTAGE) });
      } else {
        setPlayerAdvantage(null);
      }
      const adv2 = getAdvantage(aiDeck[0], playerDeck[0]);
      if (adv2) {
        const base = aiDeck[0].attributes[adv2.attribute];
        setP2Advantage({ attribute: adv2.attribute, bonus: Math.round(base * ADVANTAGE_BONUS_PERCENTAGE) });
      } else {
        setP2Advantage(null);
      }
    } else {
      setPlayerAdvantage(null);
      setP2Advantage(null);
    }
  }, [gameState, playerDeck, aiDeck]);

  const handleAttributeSelect = (attribute: Attribute) => {
    if (!isPlayerTurn || playerDeck.length === 0 || aiDeck.length === 0) return;
    playCardFlip();
    resolveRound(attribute, playerDeck[0], aiDeck[0]);
  };

  const handleP2AttributeSelect = (attribute: Attribute) => {
    if (isPlayerTurn || !isMultiplayer || playerDeck.length === 0 || aiDeck.length === 0) return;
    playCardFlip();
    resolveRound(attribute, playerDeck[0], aiDeck[0]);
  };

  // Wraps handleNextRound with a card-transfer animation
  const handleNextRoundAnimated = () => {
    if (!roundResult || transferAnim !== 'none') return;
    const anim = roundResult.winner === 'player' ? 'player-wins'
               : roundResult.winner === 'ai'     ? 'ai-wins'
               : 'none';
    if (anim === 'none') { handleNextRound(); return; }
    setTransferAnim(anim);
    setTimeout(() => { setTransferAnim('none'); handleNextRound(); }, 700);
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
            // Empate: cartas voltam para o fundo; turno permanece inalterado
            newPlayerDeck.push(playerCard);
            newAiDeck.push(aiCard);
        }
    }

    setPlayerDeck(newPlayerDeck);
    setAiDeck(newAiDeck);

    if (newPlayerDeck.length === 0 || newAiDeck.length === 0) {
      const playerWon = newPlayerDeck.length > 0;
      if (playerWon) playGameWin(); else playGameLose();
      // Persistir resultado no ranking (sem bloquear a UI)
      if (userProfile) {
        upsertGameResult({
          playerName: userProfile.name,
          won: playerWon,
          playerCardsLeft: newPlayerDeck.length,
          totalCards: deck.length,
          difficulty: difficulty,
        });
      }
      setGameState(GameState.GameOver);
    } else {
      setRoundResult(null);
      setGameState(GameState.Playing);
    }
  };
  
  const handleLogout = async () => {
    window.google?.accounts?.id?.disableAutoSelect?.();
    await supabaseSignOut();
    setUserProfile(null);
    setIsAdmin(false);
    setGameState(GameState.Menu);
  };

  const handleBackToMenu = () => {
    setGameState(GameState.Menu);
  };

  const handleGoToRanking = async () => {
    setGameState(GameState.Ranking);
    const rows: RankingRow[] = await fetchRanking(20);
    const entries: RankingEntry[] = rows.map((r, i) => ({
      rank: i + 1,
      user: { name: r.player_name, picture: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(r.player_name)}` },
      wins: r.games_won,
      score: r.total_score,
    }));
    setRankingData(entries);
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
        const p2Turn = !isPlayerTurn && isMultiplayer;
        const opponentLabel = isMultiplayer ? 'JOGADOR 2' : 'ORÁCULO';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? 16 : 28 }}>
            {isMobile ? (
              /* Mobile: stack vertically */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%' }}>
                {/* Opponent top */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 11, letterSpacing: '.15em', color: p2Turn ? '#fff8e1' : 'rgba(255,236,196,.6)' }}>
                    {opponentLabel}
                  </span>
                  <Card card={aiCard} isFaceDown={!p2Turn} isPlayerTurn={p2Turn} onAttributeSelect={p2Turn ? handleP2AttributeSelect : undefined} advantageBonus={p2Turn && p2Advantage ? p2Advantage : undefined} />
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'rgba(244,195,73,.7)', padding: '2px 10px', border: '1px solid rgba(244,195,73,.3)' }}>{aiDeck.length} cartas</div>
                </div>
                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center' }}>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #f4c349)' }} />
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 20, color: '#f4c349' }}>⚔</span>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #f4c349, transparent)' }} />
                </div>
                {/* Player bottom */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {userProfile?.picture && <img src={userProfile.picture} alt="" style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #f4c349' }} />}
                    <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 11, letterSpacing: '.15em', color: '#fff8e1' }}>{(userProfile?.name || 'JOGADOR 1').toUpperCase()}</span>
                  </div>
                  <Card card={playerCard} isPlayerTurn={isPlayerTurn} onAttributeSelect={handleAttributeSelect} advantageBonus={playerAdvantage ?? undefined} />
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'rgba(244,195,73,.7)', padding: '2px 10px', border: '1px solid rgba(244,195,73,.3)' }}>{playerDeck.length} cartas</div>
                </div>
              </div>
            ) : (
              /* Desktop: side-by-side grid */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, width: '100%', alignItems: 'start' }}>
                {/* Player side */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {userProfile?.picture && (
                      <img src={userProfile.picture} alt="" style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #f4c349' }} />
                    )}
                    <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 15, letterSpacing: '.15em', color: '#fff8e1' }}>
                      {(userProfile?.name || 'JOGADOR 1').toUpperCase()}
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
                {/* Opponent side */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 15, letterSpacing: '.15em', color: p2Turn ? '#fff8e1' : 'rgba(255,236,196,.6)' }}>
                    {opponentLabel}
                  </span>
                  <Card card={aiCard} isFaceDown={!p2Turn} isPlayerTurn={p2Turn} onAttributeSelect={p2Turn ? handleP2AttributeSelect : undefined} advantageBonus={p2Turn && p2Advantage ? p2Advantage : undefined} />
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.7)', padding: '3px 12px', border: '1px solid rgba(244,195,73,.3)' }}>
                    {aiDeck.length} cartas
                  </div>
                </div>
              </div>
            )}

            {/* Status bar */}
            <div style={{
              padding: isMobile ? '8px 12px' : '10px 20px', maxWidth: 560, width: '100%',
              background: 'rgba(10,5,0,.65)', border: '1px solid rgba(244,195,73,.2)',
              fontFamily: 'Cinzel, serif', fontSize: isMobile ? 9 : 12, letterSpacing: isMobile ? '.1em' : '.2em',
              minHeight: isMobile ? 44 : 52, display: 'flex', alignItems: 'center',
              justifyContent: (isPlayerTurn || p2Turn) ? 'space-between' : 'center', gap: 10,
            }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                {isPlayerTurn && playerAdvantage && (
                  <span style={{ color: '#50dc78' }}>✦ VANTAGEM ELEMENTAL — BÔNUS EM {playerAdvantage.attribute.toUpperCase()} ✦</span>
                )}
                {isPlayerTurn && !playerAdvantage && (
                  <span style={{ color: 'rgba(255,236,196,.85)' }}>◇ {isMultiplayer ? 'VEZ DO JOGADOR 1' : 'SUA VEZ'} — ESCOLHA UM ATRIBUTO ◇</span>
                )}
                {p2Turn && p2Advantage && (
                  <span style={{ color: '#50dc78' }}>✦ VANTAGEM DO JOGADOR 2 — BÔNUS EM {p2Advantage.attribute.toUpperCase()} ✦</span>
                )}
                {p2Turn && !p2Advantage && (
                  <span style={{ color: 'rgba(255,236,196,.85)' }}>◇ VEZ DO JOGADOR 2 — ESCOLHA UM ATRIBUTO ◇</span>
                )}
                {!isPlayerTurn && !isMultiplayer && (
                  <span style={{ color: 'rgba(244,195,73,.5)' }}>· VEZ DO ORÁCULO ·</span>
                )}
              </div>
              {(isPlayerTurn || p2Turn) && (
                <TimerRing timeLeft={timeLeft} total={TURN_TIMER_SECONDS} />
              )}
            </div>

            {/* Round history */}
            {matchHistory.length > 0 && (
              <div style={{ maxWidth: 560, width: '100%' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '.4em', color: 'rgba(244,195,73,.5)', marginBottom: 6, textAlign: 'center' }}>
                  · HISTÓRICO ·
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {matchHistory.slice(0, 5).map((h, i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center',
                      padding: '6px 12px',
                      background: h.winner === 'player' ? 'rgba(80,220,120,.05)' : h.winner === 'ai' ? 'rgba(217,74,74,.05)' : 'rgba(244,195,73,.04)',
                      border: `1px solid ${h.winner === 'player' ? 'rgba(80,220,120,.2)' : h.winner === 'ai' ? 'rgba(217,74,74,.2)' : 'rgba(244,195,73,.15)'}`,
                      borderLeft: `3px solid ${h.winner === 'player' ? '#50dc78' : h.winner === 'ai' ? '#d94a4a' : 'rgba(244,195,73,.4)'}`,
                    }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        background: h.winner === 'player' ? '#50dc78' : h.winner === 'ai' ? '#d94a4a' : 'rgba(244,195,73,.4)',
                        color: '#1a0e04', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 10,
                      }}>{h.winner === 'player' ? 'V' : h.winner === 'ai' ? 'D' : '='}</div>
                      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.1em', color: 'rgba(255,236,196,.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {h.attribute.toUpperCase()} · {isMobile ? h.playerCard.name.split(' ')[0] : h.playerCard.name} vs {isMobile ? h.aiCard.name.split(' ')[0] : h.aiCard.name}
                      </div>
                      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'rgba(244,195,73,.6)' }}>
                        {h.playerValue} × {h.aiValue}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case GameState.RoundResult: {
        if (!roundResult) return null;
        const { winner, attribute, playerCard, aiCard, playerValue, aiValue, playerBonus, aiBonus } = roundResult;
        const opponentLabelResult = isMultiplayer ? 'JOGADOR 2' : 'ORÁCULO';
        const p1Label = isMultiplayer ? 'JOGADOR 1' : (userProfile?.name || 'JOGADOR').toUpperCase();
        const resultText = winner === 'player'
          ? `${isMultiplayer ? 'Jogador 1 venceu' : 'Você venceu'}! ${playerValue} × ${aiValue} em ${attribute}.`
          : winner === 'ai'
          ? `${isMultiplayer ? 'Jogador 2 venceu' : 'Você perdeu'}! ${playerValue} × ${aiValue} em ${attribute}.`
          : `Empate! Ninguém venceu em ${attribute}.`;
        const resultColor = winner === 'player' ? '#f4c349' : winner === 'ai' ? '#d94a4a' : 'rgba(255,236,196,.8)';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? 14 : 28 }}>
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%' }}>
                {/* Opponent top */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 11, letterSpacing: '.15em', color: 'rgba(255,236,196,.6)' }}>{opponentLabelResult}</span>
                  <div className={
                    transferAnim === 'player-wins' ? 'card-transfer-fly-up' :
                    transferAnim === 'ai-wins' ? 'card-winner-glow' : ''
                  }>
                    <Card card={aiCard} isFaceDown={!isRevealing} highlightedAttribute={attribute} isWinner={isRevealing && winner === 'ai'} isLoser={isRevealing && winner === 'player'} />
                  </div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'rgba(244,195,73,.7)', padding: '2px 10px', border: '1px solid rgba(244,195,73,.3)' }}>{aiDeck.length} cartas</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center', transition: 'opacity 0.5s', opacity: showResultInfo ? 1 : 0 }}>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #f4c349)' }} />
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 20, color: '#f4c349' }}>⚔</span>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #f4c349, transparent)' }} />
                </div>
                {/* Player bottom */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 11, letterSpacing: '.15em', color: '#fff8e1' }}>{p1Label}</span>
                  <div className={
                    transferAnim === 'ai-wins' ? 'card-transfer-fly-down' :
                    transferAnim === 'player-wins' ? 'card-winner-glow' : ''
                  }>
                    <Card card={playerCard} highlightedAttribute={attribute} isWinner={isRevealing && winner === 'player'} isLoser={isRevealing && winner === 'ai'} />
                  </div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'rgba(244,195,73,.7)', padding: '2px 10px', border: '1px solid rgba(244,195,73,.3)' }}>{playerDeck.length} cartas</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, width: '100%', alignItems: 'start' }}>
              {/* Player */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 15, letterSpacing: '.15em', color: '#fff8e1' }}>
                  {p1Label}
                </span>
                <div className={
                  transferAnim === 'ai-wins' ? 'card-transfer-fly-left' :
                  transferAnim === 'player-wins' ? 'card-winner-glow' : ''
                }>
                  <Card card={playerCard} highlightedAttribute={attribute} isWinner={isRevealing && winner === 'player'} isLoser={isRevealing && winner === 'ai'} />
                </div>
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

              {/* Opponent */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 15, letterSpacing: '.15em', color: 'rgba(255,236,196,.6)' }}>
                  {opponentLabelResult}
                </span>
                <div className={
                  transferAnim === 'player-wins' ? 'card-transfer-fly-right' :
                  transferAnim === 'ai-wins' ? 'card-winner-glow' : ''
                }>
                  <Card card={aiCard} isFaceDown={!isRevealing} highlightedAttribute={attribute} isWinner={isRevealing && winner === 'ai'} isLoser={isRevealing && winner === 'player'} />
                </div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.7)', padding: '3px 12px', border: '1px solid rgba(244,195,73,.3)' }}>
                  {aiDeck.length} cartas
                </div>
              </div>
            </div>
            )}

            {/* Result panel */}
            <div style={{
              padding: isMobile ? '16px 16px' : '22px 36px', maxWidth: 600, width: '100%', textAlign: 'center',
              background: 'linear-gradient(180deg, rgba(20,8,10,.9), rgba(10,5,0,.7))',
              border: '1px solid rgba(244,195,73,.3)',
              transition: 'opacity 0.5s', opacity: showResultInfo ? 1 : 0,
              minHeight: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              {showResultInfo && (
                <>
                  <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: isMobile ? 15 : 20, letterSpacing: '.08em', color: resultColor, margin: 0 }}>
                    {resultText}
                  </p>
                  {playerBonus > 0 && winner === 'player' && (
                    <p style={{ fontFamily: 'Spectral, serif', fontSize: 14, color: '#50dc78', margin: 0 }}>
                      Sua vantagem elemental garantiu a vitória!
                    </p>
                  )}
                  {aiBonus > 0 && winner === 'ai' && (
                    <p style={{ fontFamily: 'Spectral, serif', fontSize: 14, color: '#d94a4a', margin: 0 }}>
                      O Oráculo teve vantagem elemental!
                    </p>
                  )}
                  {showNextRoundButton && (
                    <button onClick={handleNextRoundAnimated} style={{
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
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto', padding: isMobile ? '30px 0' : '60px 0' }}>
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
        return <Ranking rankingData={rankingData} onBack={handleBackToMenu} />;

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
          difficulty={difficulty}
          onStartGame={startGame}
          onStartMultiplayer={() => startGame(true)}
          onSetDifficulty={setDifficulty}
          onGoToRanking={handleGoToRanking}
          onGoToAdmin={() => setGameState(GameState.Admin)}
          onGoToCollection={() => setGameState(GameState.Collection)}
          onGoToRules={() => setGameState(GameState.Rules)}
          onLogout={handleLogout}
        />
      );
    }
    return (
      <HomeMenu
        userProfile={userProfile}
        isAdmin={isAdmin}
        isClientIdConfigured={isClientIdConfigured}
        onStartGame={startGame}
        onGoToRanking={handleGoToRanking}
        onGoToAdmin={() => setGameState(GameState.Admin)}
        onGoToRules={() => setGameState(GameState.Rules)}
      />
    );
  }

  if (gameState === GameState.Rules) {
    return <Rules onBack={handleBackToMenu} />;
  }

  if (gameState === GameState.Collection) {
    if (!userProfile) {
      return (
        <HomeMenu
          userProfile={null}
          isAdmin={false}
          isClientIdConfigured={isClientIdConfigured}
          onStartGame={startGame}
          onGoToRanking={handleGoToRanking}
          onGoToAdmin={() => setGameState(GameState.Admin)}
          onGoToRules={() => setGameState(GameState.Rules)}
        />
      );
    }
    return (
      <Collection
        userProfile={userProfile}
        onStartGame={startGame}
        onGoToRanking={handleGoToRanking}
        onGoToCollection={() => setGameState(GameState.Collection)}
        onBack={() => setGameState(GameState.Menu)}
        onLogout={handleLogout}
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
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: isMobile ? '20px 16px' : '40px 48px' }}>
        <div style={{ width: '100%', maxWidth: 1200 }}>
          {renderGameState()}
        </div>
      </div>
    </div>
  );
};

export default App;