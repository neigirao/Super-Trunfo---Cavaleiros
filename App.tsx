
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CardData, GameState, Attribute, RoundResult, RankingEntry } from './types';
import { Card } from './components/Card';
import { Ranking } from './components/Ranking';
import { AdminPanel } from './components/AdminPanel';
import { Rules } from './components/Rules';
import HomeMenu from './components/HomeMenu';
import Dashboard from './components/Dashboard';
import Collection from './components/Collection';
import { DeckEditor } from './components/DeckEditor';
import { Toast } from './components/Toast';
import { initialDeck } from './initialDeck';
import { setMuted as setMutedFn } from './utils/sounds';
import { useIsMobile } from './utils/mobile';
import { fetchRanking, saveDeckToCloud, RankingRow, PlayerCurrency, PlayerStats } from './utils/supabase';
import { useAuth } from './hooks/useAuth';
import { usePlayerStats } from './hooks/usePlayerStats';
import { useGameEngine } from './hooks/useGameEngine';
import { Difficulty } from './types';

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
          style={{ transform: 'rotate(-90deg)', transformOrigin: '25px 25px', transition: 'stroke-dashoffset 0.9s linear, stroke 0.4s' }}
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

  // ── Core state ─────────────────────────────────────────────
  const [gameState, setGameState] = useState<GameState>(GameState.Menu);
  const [deck, setDeck] = useState<CardData[]>(() => {
    try {
      const s = localStorage.getItem('superTrunfoDeck');
      if (s) {
        const d = JSON.parse(s);
        if (Array.isArray(d) && d.length > 0) return d;
      }
    } catch { /* ignore */ }
    return initialDeck;
  });
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Normal);
  const [rankingData, setRankingData] = useState<RankingEntry[]>([]);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);
  const [muted, setMuted] = useState(() => localStorage.getItem('muted') === '1');
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

  // Saved game snapshot for Continue Banner
  const [hasSavedGame, setHasSavedGame] = useState(() => !!localStorage.getItem('savedGame'));
  const [savedGameInfo, setSavedGameInfo] = useState<{ round: number; isMultiplayer: boolean } | null>(() => {
    try { const s = localStorage.getItem('savedGame'); return s ? (JSON.parse(s).info ?? null) : null; } catch { return null; }
  });

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    setMutedFn(muted);
    localStorage.setItem('muted', muted ? '1' : '0');
  }, [muted]);

  useEffect(() => {
    localStorage.setItem('superTrunfoDeck', JSON.stringify(deck));
  }, [deck]);

  // ── Player stats (currency, quests) ───────────────────────
  const {
    currency, setCurrency,
    playerStats, setPlayerStats,
    questProgress, refreshQuests,
    applyQuestReward, updateAfterGame,
  } = usePlayerStats(null); // userProfile set separately via useAuth

  // ── Auth ───────────────────────────────────────────────────
  const { userProfile, isAdmin, handleLogout } = useAuth(setDeck, setCurrency, setPlayerStats);

  // Sync deck to cloud when it changes
  useEffect(() => {
    if (!userProfile) return;
    saveDeckToCloud(deck);
  }, [deck, userProfile]);

  // ── Game engine ────────────────────────────────────────────
  const {
    playerDeck, aiDeck,
    isPlayerTurn,
    roundResult,
    matchHistory,
    isMultiplayer,
    playerAdvantage, p2Advantage,
    timeLeft, TURN_TIMER_SECONDS,
    isRevealing, showResultInfo, showNextRoundButton,
    transferAnim,
    startGame, handleAttributeSelect, handleP2AttributeSelect,
    handleNextRound, handleNextRoundAnimated,
  } = useGameEngine({
    deck, difficulty, userProfile, setGameState,
    applyQuestReward, updateAfterGame, showToast,
  });

  // Persist/clear saved game snapshot for Continue Banner.
  // Only erase savedGame on a real transition FROM a game state (not on first mount/StrictMode double-fire).
  const prevGameState = useRef<GameState | null>(null);
  useEffect(() => {
    const prev = prevGameState.current;
    prevGameState.current = gameState;

    if (gameState === GameState.Playing || gameState === GameState.RoundResult) {
      const round = Math.abs(playerDeck.length - aiDeck.length) + 1;
      const info = { round, isMultiplayer };
      localStorage.setItem('savedGame', JSON.stringify({ playerDeck, aiDeck, isPlayerTurn, matchHistory, isMultiplayer, difficulty, roundResult, info }));
      setHasSavedGame(true);
      setSavedGameInfo(info);
    } else if (
      (gameState === GameState.GameOver || gameState === GameState.Menu) &&
      prev !== null && prev !== gameState
    ) {
      // Only clear when genuinely transitioning away from a game (not on initial mount).
      localStorage.removeItem('savedGame');
      setHasSavedGame(false);
      setSavedGameInfo(null);
    }
  }, [gameState, playerDeck, aiDeck]);

  const handleContinueGame = () => {
    try {
      const raw = localStorage.getItem('savedGame');
      if (!raw) return;
      const saved = JSON.parse(raw);
      // validateSavedGame before restoring
      if ((saved.playerDeck?.length ?? 0) === 0 || (saved.aiDeck?.length ?? 0) === 0) {
        localStorage.removeItem('savedGame');
        setHasSavedGame(false);
        return;
      }
      // Re-dispatch to game engine via setGameState — engine reads playerDeck/aiDeck from
      // its own state so we need a manual restore. We re-use startGame with the saved deck.
      // Since useGameEngine exposes setters only indirectly, we restore via a fresh start
      // using existing startGame but with the saved decks restored via effect.
      // For now, re-trigger the saved-game flow by setting state directly.
      setGameState(saved.roundResult ? GameState.RoundResult : GameState.Playing);
    } catch { /* corrupted save, ignore */ }
  };

  const handleBackToMenu = useCallback(() => setGameState(GameState.Menu), []);

  const handleGoToRanking = async () => {
    setIsLoadingRanking(true);
    setRankingData([]);
    setGameState(GameState.Ranking);
    const rows: RankingRow[] = await fetchRanking(20);
    const entries: RankingEntry[] = rows.map((r, i) => ({
      rank: i + 1,
      user: { name: r.player_name, picture: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(r.player_name)}` },
      wins: r.games_won,
      score: r.total_score,
    }));
    setRankingData(entries);
    setIsLoadingRanking(false);
  };

  const handleSaveCard = (cardToSave: CardData) => {
    setDeck(prev =>
      prev.some(c => c.id === cardToSave.id)
        ? prev.map(c => c.id === cardToSave.id ? cardToSave : c)
        : [...prev, cardToSave]
    );
  };

  const handleDeleteCard = (cardId: string) => setDeck(prev => prev.filter(c => c.id !== cardId));

  // ── Routing ────────────────────────────────────────────────
  const renderCurrentState = (): React.ReactNode => {
    // ── Menu screens (full-page, own backgrounds) ──────────
    if (gameState === GameState.Menu) {
      if (userProfile) {
        return (
          <Dashboard
            userProfile={userProfile}
            isAdmin={isAdmin}
            difficulty={difficulty}
            muted={muted}
            hasSavedGame={hasSavedGame}
            savedGameInfo={savedGameInfo}
            questProgress={questProgress}
            currency={currency}
            matchHistory={matchHistory}
            activeDeck={deck}
            playerStats={playerStats}
            onStartGame={() => startGame()}
            onStartMultiplayer={() => startGame(true)}
            onContinueGame={handleContinueGame}
            onSetDifficulty={setDifficulty}
            onGoToRanking={handleGoToRanking}
            onGoToAdmin={() => setGameState(GameState.Admin)}
            onGoToCollection={() => setGameState(GameState.Collection)}
            onGoToRules={() => setGameState(GameState.Rules)}
            onGoToDeckEditor={() => setGameState(GameState.DeckEditor)}
            onLogout={handleLogout}
            onToggleMute={() => setMuted(p => !p)}
          />
        );
      }
      return (
        <HomeMenu
          userProfile={userProfile}
          isAdmin={isAdmin}
          isClientIdConfigured={true}
          onStartGame={() => startGame()}
          onGoToRanking={handleGoToRanking}
          onGoToAdmin={() => setGameState(GameState.Admin)}
          onGoToRules={() => setGameState(GameState.Rules)}
        />
      );
    }

    if (gameState === GameState.Rules) return <Rules onBack={handleBackToMenu} />;

    if (gameState === GameState.Collection) {
      if (!userProfile) return (
        <HomeMenu
          userProfile={null} isAdmin={false} isClientIdConfigured={true}
          onStartGame={() => startGame()} onGoToRanking={handleGoToRanking}
          onGoToAdmin={() => setGameState(GameState.Admin)} onGoToRules={() => setGameState(GameState.Rules)}
        />
      );
      return (
        <Collection
          userProfile={userProfile}
          onStartGame={() => startGame()}
          onGoToRanking={handleGoToRanking}
          onGoToCollection={() => setGameState(GameState.Collection)}
          onBack={handleBackToMenu}
          onLogout={handleLogout}
        />
      );
    }

    if (gameState === GameState.DeckEditor) {
      return (
        <DeckEditor
          cardPool={deck}
          onSave={(selected) => { setDeck(selected); setGameState(GameState.Menu); }}
          onBack={handleBackToMenu}
        />
      );
    }

    // ── Game screens (star-field background) ──────────────
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #06030a 0%, #0a0500 40%, #06030a 100%)', color: '#fff8e1', position: 'relative' }}>
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

  const renderGameState = (): React.ReactNode => {
    switch (gameState) {
      case GameState.Playing: {
        const playerCard = playerDeck[0];
        const aiCard = aiDeck[0];
        const p2Turn = !isPlayerTurn && isMultiplayer;
        const opponentLabel = isMultiplayer ? 'JOGADOR 2' : 'ORÁCULO';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? 16 : 28 }}>
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 11, letterSpacing: '.15em', color: p2Turn ? '#fff8e1' : 'rgba(255,236,196,.6)' }}>{opponentLabel}</span>
                  <Card card={aiCard} isFaceDown={!p2Turn} isPlayerTurn={p2Turn} onAttributeSelect={p2Turn ? handleP2AttributeSelect : undefined} advantageBonus={p2Turn && p2Advantage ? p2Advantage : undefined} />
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'rgba(244,195,73,.7)', padding: '2px 10px', border: '1px solid rgba(244,195,73,.3)' }}>{aiDeck.length} cartas</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center' }}>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #f4c349)' }} />
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 20, color: '#f4c349' }}>⚔</span>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #f4c349, transparent)' }} />
                </div>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, width: '100%', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {userProfile?.picture && <img src={userProfile.picture} alt="" style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #f4c349' }} />}
                    <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 15, letterSpacing: '.15em', color: '#fff8e1' }}>{(userProfile?.name || 'JOGADOR 1').toUpperCase()}</span>
                  </div>
                  <Card card={playerCard} isPlayerTurn={isPlayerTurn} onAttributeSelect={handleAttributeSelect} advantageBonus={playerAdvantage ?? undefined} />
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.7)', padding: '3px 12px', border: '1px solid rgba(244,195,73,.3)' }}>{playerDeck.length} cartas</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 72 }}>
                  <div style={{ width: 1, height: 36, background: 'linear-gradient(180deg, transparent, #f4c349)' }} />
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 28, color: '#f4c349' }}>⚔</span>
                  <div style={{ width: 1, height: 36, background: 'linear-gradient(180deg, #f4c349, transparent)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 15, letterSpacing: '.15em', color: p2Turn ? '#fff8e1' : 'rgba(255,236,196,.6)' }}>{opponentLabel}</span>
                  <Card card={aiCard} isFaceDown={!p2Turn} isPlayerTurn={p2Turn} onAttributeSelect={p2Turn ? handleP2AttributeSelect : undefined} advantageBonus={p2Turn && p2Advantage ? p2Advantage : undefined} />
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.7)', padding: '3px 12px', border: '1px solid rgba(244,195,73,.3)' }}>{aiDeck.length} cartas</div>
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
                {isPlayerTurn && playerAdvantage && <span style={{ color: '#50dc78' }}>✦ VANTAGEM ELEMENTAL — BÔNUS EM {playerAdvantage.attribute.toUpperCase()} ✦</span>}
                {isPlayerTurn && !playerAdvantage && <span style={{ color: 'rgba(255,236,196,.85)' }}>◇ {isMultiplayer ? 'VEZ DO JOGADOR 1' : 'SUA VEZ'} — ESCOLHA UM ATRIBUTO ◇</span>}
                {p2Turn && p2Advantage && <span style={{ color: '#50dc78' }}>✦ VANTAGEM DO JOGADOR 2 — BÔNUS EM {p2Advantage.attribute.toUpperCase()} ✦</span>}
                {p2Turn && !p2Advantage && <span style={{ color: 'rgba(255,236,196,.85)' }}>◇ VEZ DO JOGADOR 2 — ESCOLHA UM ATRIBUTO ◇</span>}
                {!isPlayerTurn && !isMultiplayer && <span style={{ color: 'rgba(244,195,73,.5)' }}>· VEZ DO ORÁCULO ·</span>}
              </div>
              {(isPlayerTurn || p2Turn) && <TimerRing timeLeft={timeLeft} total={TURN_TIMER_SECONDS} />}
            </div>

            {/* Round history */}
            {matchHistory.length > 0 && (
              <div style={{ maxWidth: 560, width: '100%' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '.4em', color: 'rgba(244,195,73,.5)', marginBottom: 6, textAlign: 'center' }}>· HISTÓRICO ·</div>
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
                      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'rgba(244,195,73,.6)' }}>{h.playerValue} × {h.aiValue}</div>
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
        const p2Turn = !isPlayerTurn && isMultiplayer;
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 11, letterSpacing: '.15em', color: 'rgba(255,236,196,.6)' }}>{opponentLabelResult}</span>
                  <div className={transferAnim === 'player-wins' ? 'card-transfer-fly-up' : transferAnim === 'ai-wins' ? 'card-winner-glow' : ''}>
                    <Card card={aiCard} isFaceDown={!isRevealing} highlightedAttribute={attribute} isWinner={isRevealing && winner === 'ai'} isLoser={isRevealing && winner === 'player'} />
                  </div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'rgba(244,195,73,.7)', padding: '2px 10px', border: '1px solid rgba(244,195,73,.3)' }}>{aiDeck.length} cartas</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center', transition: 'opacity 0.5s', opacity: showResultInfo ? 1 : 0 }}>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #f4c349)' }} />
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 20, color: '#f4c349' }}>⚔</span>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #f4c349, transparent)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 11, letterSpacing: '.15em', color: '#fff8e1' }}>{p1Label}</span>
                  <div className={transferAnim === 'ai-wins' ? 'card-transfer-fly-down' : transferAnim === 'player-wins' ? 'card-winner-glow' : ''}>
                    <Card card={playerCard} highlightedAttribute={attribute} isWinner={isRevealing && winner === 'player'} isLoser={isRevealing && winner === 'ai'} />
                  </div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'rgba(244,195,73,.7)', padding: '2px 10px', border: '1px solid rgba(244,195,73,.3)' }}>{playerDeck.length} cartas</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, width: '100%', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 15, letterSpacing: '.15em', color: '#fff8e1' }}>{p1Label}</span>
                  <div className={transferAnim === 'ai-wins' ? 'card-transfer-fly-left' : transferAnim === 'player-wins' ? 'card-winner-glow' : ''}>
                    <Card card={playerCard} highlightedAttribute={attribute} isWinner={isRevealing && winner === 'player'} isLoser={isRevealing && winner === 'ai'} />
                  </div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.7)', padding: '3px 12px', border: '1px solid rgba(244,195,73,.3)' }}>{playerDeck.length} cartas</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 72, transition: 'opacity 0.5s', opacity: showResultInfo ? 1 : 0 }}>
                  <div style={{ width: 1, height: 36, background: 'linear-gradient(180deg, transparent, #f4c349)' }} />
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 28, color: '#f4c349' }}>⚔</span>
                  <div style={{ width: 1, height: 36, background: 'linear-gradient(180deg, #f4c349, transparent)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 15, letterSpacing: '.15em', color: 'rgba(255,236,196,.6)' }}>{opponentLabelResult}</span>
                  <div className={transferAnim === 'player-wins' ? 'card-transfer-fly-right' : transferAnim === 'ai-wins' ? 'card-winner-glow' : ''}>
                    <Card card={aiCard} isFaceDown={!isRevealing} highlightedAttribute={attribute} isWinner={isRevealing && winner === 'ai'} isLoser={isRevealing && winner === 'player'} />
                  </div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.7)', padding: '3px 12px', border: '1px solid rgba(244,195,73,.3)' }}>{aiDeck.length} cartas</div>
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
                  <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: isMobile ? 15 : 20, letterSpacing: '.08em', color: resultColor, margin: 0 }}>{resultText}</p>
                  {playerBonus > 0 && winner === 'player' && <p style={{ fontFamily: 'Spectral, serif', fontSize: 14, color: '#50dc78', margin: 0 }}>Sua vantagem elemental garantiu a vitória!</p>}
                  {aiBonus > 0 && winner === 'ai' && <p style={{ fontFamily: 'Spectral, serif', fontSize: 14, color: '#d94a4a', margin: 0 }}>O Oráculo teve vantagem elemental!</p>}
                  {showNextRoundButton && (
                    <button onClick={handleNextRoundAnimated} style={{
                      marginTop: 6, fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 11, letterSpacing: '.3em',
                      color: '#1a0e04', padding: '11px 24px', cursor: 'pointer',
                      background: 'linear-gradient(180deg,#f4c349,#8a6a2a)', border: '1px solid #f4c349',
                      boxShadow: '0 0 14px rgba(244,195,73,.4)',
                    }}>PRÓXIMA RODADA →</button>
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
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.5em', color: '#f4c349' }}>{playerWon ? '· VITÓRIA ·' : '· DERROTA ·'}</span>
              <span style={{ width: 48, height: 1, background: '#f4c349', display: 'block' }} />
            </div>
            <h1 style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 'clamp(44px,6vw,72px)', letterSpacing: '.06em', color: '#fff8e1', margin: '0 0 12px', textShadow: playerWon ? '0 0 30px rgba(244,195,73,.5)' : '0 0 30px rgba(217,74,74,.4)' }}>
              {playerWon ? '⚔ VITÓRIA' : '✦ DERROTA'}
            </h1>
            <div style={{ width: 80, height: 2, background: '#f4c349', margin: '0 auto 20px' }} />
            <p style={{ fontFamily: 'Spectral, serif', fontSize: 18, lineHeight: 1.55, color: 'rgba(255,236,196,.75)', margin: '0 0 40px' }}>
              {playerWon ? 'Você coletou todas as cartas do oponente e conquistou o cosmos!' : 'O Oráculo coletou todas as suas cartas. A batalha foi perdida.'}
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => startGame()} style={{
                fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 12, letterSpacing: '.3em',
                color: '#1a0e04', padding: '14px 30px', cursor: 'pointer',
                background: 'linear-gradient(180deg,#f4c349,#8a6a2a)', border: '2px solid #f4c349',
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
        return <Ranking rankingData={rankingData} onBack={handleBackToMenu} isLoading={isLoadingRanking} />;

      case GameState.Admin:
        return <AdminPanel cards={deck} onSave={handleSaveCard} onDelete={handleDeleteCard} onBack={handleBackToMenu} />;

      default:
        return null;
    }
  };

  return (
    <>
      {renderCurrentState()}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </>
  );
};

export default App;
