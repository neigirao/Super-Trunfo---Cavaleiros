
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
import { Shop } from './components/Shop';
import { Toast } from './components/Toast';
import { initialDeck } from './initialDeck';
import { setMuted as setMutedFn } from './utils/sounds';
import { useIsMobile } from './utils/mobile';
import { fetchRanking, saveDeckToCloud, loadCardsFromDB, addCurrency, RankingRow, PlayerCurrency, PlayerStats } from './utils/supabase';
import { SK, migrateStorage } from './utils/storage';
import { GameSettings, loadGameSettings, saveGameSettings } from './utils/gameSettings';
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

// ─── Battle screen components ───────────────────────────────
const FRIEZE_SYMS = ['H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'];
const PeriodicFrieze: React.FC = () => (
  <div style={{ position:'relative', zIndex:5, display:'flex', gap:1, justifyContent:'center', padding:'3px 0', background:'rgba(6,3,10,.92)', borderBottom:'1px solid rgba(244,195,73,.18)', overflow:'hidden' }}>
    {FRIEZE_SYMS.map(s => (
      <div key={s} style={{ width:23, height:21, border:'1px solid rgba(244,195,73,.16)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cinzel, serif', fontSize:8, color:'rgba(244,195,73,.4)', fontWeight:700, flexShrink:0 }}>{s}</div>
    ))}
  </div>
);

interface GameSubbarProps { round:number; isPlayerTurn:boolean; timeLeft:number; onSurrender:()=>void; }
const GameSubbar: React.FC<GameSubbarProps> = ({ round, isPlayerTurn, timeLeft, onSurrender }) => (
  <div style={{ position:'relative', zIndex:5, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 40px', background:'rgba(10,5,0,.78)', borderBottom:'1px solid rgba(244,195,73,.1)' }}>
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      <span style={{ fontFamily:'Cinzel, serif', fontSize:8, letterSpacing:'.4em', color:'rgba(244,195,73,.6)' }}>· DUELO ·</span>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontFamily:'Cinzel, serif', fontSize:9, letterSpacing:'.28em', color:'rgba(255,236,196,.6)' }}>ROUND</span>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{ width:i===round-1?10:6, height:i===round-1?10:6, background:i<round?'#f4c349':'transparent', border:`1.5px solid ${i<round?'#f4c349':'rgba(244,195,73,.26)'}`, transform:'rotate(45deg)', flexShrink:0, boxShadow:i===round-1?'0 0 9px #f4c349':'none', transition:'all .3s' }} />
        ))}
        <span style={{ fontFamily:'IBM Plex Mono, monospace', fontSize:9, color:'rgba(244,195,73,.4)' }}>{round}</span>
      </div>
    </div>
    <div style={{ textAlign:'center' }}>
      <div style={{ fontFamily:'Cinzel, serif', fontSize:8, letterSpacing:'.4em', color:'rgba(244,195,73,.55)' }}>COSMO RESTANTE</div>
      <div style={{ fontFamily:'IBM Plex Mono, monospace', fontWeight:700, fontSize:20, color:'#fff8e1' }}>
        {isPlayerTurn ? `00:${String(timeLeft).padStart(2,'0')}` : '— —'}
      </div>
    </div>
    <div style={{ display:'flex', gap:8 }}>
      <button style={{ padding:'6px 13px', background:'transparent', border:'1px solid rgba(244,195,73,.28)', color:'rgba(255,236,196,.45)', fontFamily:'Cinzel, serif', fontSize:9, letterSpacing:'.26em', cursor:'default', opacity:.5 }}>❘❘ PAUSAR</button>
      <button onClick={onSurrender} style={{ padding:'6px 13px', background:'rgba(120,24,24,.5)', border:'1px solid #d94a4a', color:'#ff9a9a', fontFamily:'Cinzel, serif', fontSize:9, letterSpacing:'.26em', cursor:'pointer', boxShadow:'0 0 10px rgba(217,74,74,.22)' }}>⚑ DESISTIR</button>
    </div>
  </div>
);

interface PlayerPodProps { name:string; cardsLeft:number; wins:number; losses:number; side:'player'|'ai'; picture?:string; }
const PlayerPod: React.FC<PlayerPodProps> = ({ name, cardsLeft, wins, losses, side, picture }) => {
  const isP = side==='player';
  const border = isP?'#f4c349':'#d94a4a';
  const aura  = isP?'rgba(244,195,73,.26)':'rgba(217,74,74,.2)';
  const num   = isP?'#f4c349':'#ff7a7a';
  const init  = name.trim().split(' ').map(w=>w[0]).filter(Boolean).join('').slice(0,2).toUpperCase()||'??';
  return (
    <div style={{ width:124, flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:9, position:'relative', zIndex:3 }}>
      <div style={{ position:'absolute', top:-6, left:'50%', transform:'translateX(-50%)', width:96, height:96, borderRadius:'50%', background:`radial-gradient(circle, ${aura} 0%, transparent 70%)`, pointerEvents:'none' }} />
      <div style={{ width:72, height:72, position:'relative', zIndex:2, background:'linear-gradient(180deg,#3a2410,#1a0e04)', border:`2px solid ${border}`, boxShadow:`0 0 0 1px #1a0e04, 0 0 0 3px ${aura}`, clipPath:'polygon(20% 0,80% 0,100% 50%,80% 100%,20% 100%,0 50%)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        {picture ? <img src={picture} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ fontFamily:'Cinzel, serif', fontWeight:900, fontSize:18, color:'#fff8e1' }}>{init}</div>}
      </div>
      <div style={{ fontFamily:'Cinzel, serif', fontWeight:700, fontSize:10, letterSpacing:'.16em', color:'#fff8e1', textAlign:'center', maxWidth:116, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name.split(' ')[0].toUpperCase()}</div>
      <div style={{ width:76, height:1, background:'rgba(244,195,73,.2)' }} />
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'Cinzel, serif', fontSize:7, letterSpacing:'.4em', color:'rgba(244,195,73,.5)', marginBottom:2 }}>CARTAS</div>
        <div style={{ fontFamily:'IBM Plex Mono, monospace', fontWeight:700, fontSize:28, color:num }}>{cardsLeft}</div>
      </div>
      <div style={{ width:76, height:1, background:'rgba(244,195,73,.2)' }} />
      <div style={{ display:'flex', gap:12 }}>
        {([['VITÓRIAS',wins],['BAIXAS',losses]] as [string,number][]).map(([k,v])=>(
          <div key={k} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'Cinzel, serif', fontSize:7, letterSpacing:'.26em', color:'rgba(244,195,73,.46)' }}>{k}</div>
            <div style={{ fontFamily:'Cinzel, serif', fontWeight:900, fontSize:13, color:'#fff8e1', marginTop:2 }}>{String(v).padStart(2,'0')}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface CardHandProps { deck: CardData[]; }
const CardHand: React.FC<CardHandProps> = ({ deck }) => {
  if (deck.length===0) return null;
  const show = deck.slice(0,5); const extra = deck.length-show.length;
  return (
    <div style={{ display:'flex', gap:4, justifyContent:'center', alignItems:'flex-end', marginTop:16 }}>
      <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'flex-end', paddingRight:9, marginRight:3, borderRight:'1px solid rgba(244,195,73,.2)', height:88, fontFamily:'Cinzel, serif' }}>
        <div style={{ fontSize:7, letterSpacing:'.35em', color:'rgba(244,195,73,.5)' }}>SUA</div>
        <div style={{ fontSize:10, letterSpacing:'.25em', fontWeight:700, color:'#f4c349' }}>MÃO</div>
        <div style={{ fontFamily:'IBM Plex Mono, monospace', fontSize:8, color:'rgba(244,195,73,.38)', marginTop:2 }}>{String(deck.length).padStart(2,'0')}</div>
      </div>
      {show.map((card,i)=>{
        const active = i===0;
        return (
          <div key={card.id} style={{ width:60, height:88, position:'relative', flexShrink:0, background:active?'linear-gradient(180deg,#fff8e1,#e8dab8)':'linear-gradient(180deg,#f5ecd4,#d8c89a)', border:`1.5px solid ${active?'#f4c349':'rgba(138,107,42,.4)'}`, boxShadow:active?'0 0 0 2px #1a0e04, 0 0 0 3px #f4c349, 0 -8px 20px rgba(244,195,73,.45)':'0 2px 6px rgba(0,0,0,.5)', transform:active?'translateY(-10px)':'none', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between', padding:'4px', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:0 }}><img src={card.imageUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'50% 0%', opacity:.28 }} onError={e=>{(e.target as HTMLImageElement).style.display='none';}} /></div>
            <div style={{ position:'relative', zIndex:1, fontFamily:'Cinzel, serif', fontWeight:700, fontSize:6, color:'#8a6a2a', alignSelf:'flex-start' }}>{card.isSuperTrunfo?'★':'·'}</div>
            <div style={{ position:'relative', zIndex:1, fontFamily:'Cinzel, serif', fontWeight:900, fontSize:7, color:'#1a0e04', textAlign:'center', lineHeight:1.1 }}>{card.name.split(' ')[0].slice(0,7).toUpperCase()}</div>
          </div>
        );
      })}
      {extra>0 && (
        <div style={{ width:60, height:88, border:'1px dashed rgba(244,195,73,.3)', background:'rgba(26,14,4,.5)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#f4c349' }}>
          <div style={{ fontFamily:'Cinzel, serif', fontSize:16, fontWeight:900 }}>+</div>
          <div style={{ fontFamily:'IBM Plex Mono, monospace', fontSize:9, marginTop:1 }}>{extra}</div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const isMobile = useIsMobile();

  // A5: migrate legacy localStorage keys on first render
  migrateStorage();

  // ── Core state ─────────────────────────────────────────────
  const [gameState, setGameState] = useState<GameState>(GameState.Menu);
  const [deck, setDeck] = useState<CardData[]>(() => {
    try {
      const s = localStorage.getItem(SK.deck);
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
  const [muted, setMuted] = useState(() => localStorage.getItem(SK.muted) === '1');
  const [gameSettings, setGameSettings] = useState<GameSettings>(() => loadGameSettings());
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

  // Saved game snapshot for Continue Banner
  const [hasSavedGame, setHasSavedGame] = useState(() => !!localStorage.getItem(SK.savedGame));
  const [savedGameInfo, setSavedGameInfo] = useState<{ round: number; isMultiplayer: boolean } | null>(() => {
    try { const s = localStorage.getItem(SK.savedGame); return s ? (JSON.parse(s).info ?? null) : null; } catch { return null; }
  });

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

  // Carregar cartas reais do banco na inicialização (imagens do Supabase Storage)
  useEffect(() => {
    loadCardsFromDB().then(cards => {
      if (cards.length > 0) setDeck(cards);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setMutedFn(muted);
    localStorage.setItem(SK.muted, muted ? '1' : '0');
  }, [muted]);

  useEffect(() => { saveGameSettings(gameSettings); }, [gameSettings]);

  useEffect(() => {
    localStorage.setItem(SK.deck, JSON.stringify(deck));
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
    gameSummary,
    startGame, handleAttributeSelect, handleP2AttributeSelect,
    handleNextRound, handleNextRoundAnimated,
  } = useGameEngine({
    deck, difficulty, userProfile, setGameState,
    applyQuestReward, updateAfterGame, showToast,
    timerSeconds: gameSettings.timerSeconds,
    advantagePct: gameSettings.enableAdvantage ? gameSettings.advantagePct : 0,
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
      localStorage.setItem(SK.savedGame, JSON.stringify({ playerDeck, aiDeck, isPlayerTurn, matchHistory, isMultiplayer, difficulty, roundResult, info, masterDeckLen: deck.length }));
      setHasSavedGame(true);
      setSavedGameInfo(info);
    } else if (
      (gameState === GameState.GameOver || gameState === GameState.Menu) &&
      prev !== null && prev !== gameState
    ) {
      // Only clear when genuinely transitioning away from a game (not on initial mount).
      localStorage.removeItem(SK.savedGame);
      setHasSavedGame(false);
      setSavedGameInfo(null);
    }
  }, [gameState, playerDeck, aiDeck]);

  const handleContinueGame = () => {
    try {
      const raw = localStorage.getItem(SK.savedGame);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if ((saved.playerDeck?.length ?? 0) === 0 || (saved.aiDeck?.length ?? 0) === 0) {
        localStorage.removeItem(SK.savedGame);
        setHasSavedGame(false);
        return;
      }
      // M8: warn if master deck changed since save
      if (saved.masterDeckLen && saved.masterDeckLen !== deck.length) {
        showToast('O baralho foi alterado desde este salvamento — as cartas em jogo são do baralho anterior', 'info');
      }
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

  const handleSyncFromDB = useCallback(async () => {
    const dbCards = await loadCardsFromDB();
    if (dbCards.length > 0) {
      setDeck(dbCards);
      showToast(`${dbCards.length} cartas sincronizadas do Supabase!`, 'success');
    } else {
      showToast('Nenhuma carta encontrada no banco.', 'error');
    }
  }, [showToast]);

  // M4: forge a card attribute — deducts Cosmo, bumps the attribute +8, increments forgeLevel
  const FORGE_COSTS = [100, 250, 500] as const;
  const handleForge = useCallback((cardId: string, attr: Attribute) => {
    setDeck(prev => prev.map(c => {
      if (c.id !== cardId) return c;
      const level = c.forgeLevel ?? 0;
      if (level >= 3) return c;
      const cost = FORGE_COSTS[level];
      if (currency.cosmo < cost) return c;
      setCurrency(p => ({ ...p, cosmo: p.cosmo - cost }));
      addCurrency(-cost).catch(() => {});
      return { ...c, forgeLevel: level + 1, attributes: { ...c.attributes, [attr]: c.attributes[attr] + 8 } };
    }));
  }, [currency.cosmo, setCurrency]);

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
            onGoToShop={() => setGameState(GameState.Shop)}
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

    if (gameState === GameState.Shop) {
      return (
        <Shop
          deck={deck}
          currency={currency}
          onForge={handleForge}
          onBack={handleBackToMenu}
        />
      );
    }

    // ── Game screens (star-field background) ──────────────
    const isGamePlay = gameState === GameState.Playing || gameState === GameState.RoundResult;
    const roundNum = matchHistory.length + 1;
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #06030a 0%, #0a0500 40%, #06030a 100%)', color: '#fff8e1', position: 'relative', display: 'flex', flexDirection: 'column' }}>
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
        {!isMobile && <PeriodicFrieze />}
        {!isMobile && isGamePlay && (
          <GameSubbar round={roundNum} isPlayerTurn={isPlayerTurn} timeLeft={timeLeft} onSurrender={handleBackToMenu} />
        )}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '20px 16px' : '28px 36px' }}>
          <div style={{ width: '100%', maxWidth: 1440 }}>
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
              <div style={{ display: 'flex', gap: 12, width: '100%', alignItems: 'flex-start' }}>
                <PlayerPod side="player" name={userProfile?.name || 'JOGADOR 1'} cardsLeft={playerDeck.length} wins={matchHistory.filter(h=>h.winner==='player').length} losses={matchHistory.filter(h=>h.winner==='ai').length} picture={userProfile?.picture} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 20, flex: 1, alignItems: 'start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <Card card={playerCard} isPlayerTurn={isPlayerTurn} onAttributeSelect={handleAttributeSelect} advantageBonus={playerAdvantage ?? undefined} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 72 }}>
                    <div style={{ width: 1, height: 36, background: 'linear-gradient(180deg, transparent, #f4c349)' }} />
                    <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 28, color: '#f4c349' }}>⚔</span>
                    <div style={{ width: 1, height: 36, background: 'linear-gradient(180deg, #f4c349, transparent)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <Card card={aiCard} isFaceDown={!p2Turn} isPlayerTurn={p2Turn} onAttributeSelect={p2Turn ? handleP2AttributeSelect : undefined} advantageBonus={p2Turn && p2Advantage ? p2Advantage : undefined} />
                  </div>
                </div>
                <PlayerPod side="ai" name={opponentLabel} cardsLeft={aiDeck.length} wins={matchHistory.filter(h=>h.winner==='ai').length} losses={matchHistory.filter(h=>h.winner==='player').length} />
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
            {!isMobile && <CardHand deck={playerDeck} />}
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
              <div style={{ display: 'flex', gap: 12, width: '100%', alignItems: 'flex-start' }}>
                <PlayerPod side="player" name={p1Label} cardsLeft={playerDeck.length} wins={matchHistory.filter(h=>h.winner==='player').length} losses={matchHistory.filter(h=>h.winner==='ai').length} picture={userProfile?.picture} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 20, flex: 1, alignItems: 'start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div className={transferAnim === 'ai-wins' ? 'card-transfer-fly-left' : transferAnim === 'player-wins' ? 'card-winner-glow' : ''}>
                      <Card card={playerCard} highlightedAttribute={attribute} isWinner={isRevealing && winner === 'player'} isLoser={isRevealing && winner === 'ai'} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 72, transition: 'opacity 0.5s', opacity: showResultInfo ? 1 : 0 }}>
                    <div style={{ width: 1, height: 36, background: 'linear-gradient(180deg, transparent, #f4c349)' }} />
                    <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 28, color: '#f4c349' }}>⚔</span>
                    <div style={{ width: 1, height: 36, background: 'linear-gradient(180deg, #f4c349, transparent)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div className={transferAnim === 'player-wins' ? 'card-transfer-fly-right' : transferAnim === 'ai-wins' ? 'card-winner-glow' : ''}>
                      <Card card={aiCard} isFaceDown={!isRevealing} highlightedAttribute={attribute} isWinner={isRevealing && winner === 'ai'} isLoser={isRevealing && winner === 'player'} />
                    </div>
                  </div>
                </div>
                <PlayerPod side="ai" name={opponentLabelResult} cardsLeft={aiDeck.length} wins={matchHistory.filter(h=>h.winner==='ai').length} losses={matchHistory.filter(h=>h.winner==='player').length} />
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
        const playerWon = gameSummary?.won ?? playerDeck.length > 0;
        const totalRounds = (gameSummary?.roundsWon ?? 0) + (gameSummary?.roundsLost ?? 0) + (gameSummary?.roundsDraw ?? 0);
        return (
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto', padding: isMobile ? '24px 0' : '48px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <span style={{ width: 48, height: 1, background: '#f4c349', display: 'block' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.5em', color: '#f4c349' }}>{playerWon ? '· VITÓRIA ·' : '· DERROTA ·'}</span>
              <span style={{ width: 48, height: 1, background: '#f4c349', display: 'block' }} />
            </div>
            <h1 style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 'clamp(44px,6vw,72px)', letterSpacing: '.06em', color: '#fff8e1', margin: '0 0 12px', textShadow: playerWon ? '0 0 30px rgba(244,195,73,.5)' : '0 0 30px rgba(217,74,74,.4)' }}>
              {playerWon ? '⚔ VITÓRIA' : '✦ DERROTA'}
            </h1>
            <div style={{ width: 80, height: 2, background: '#f4c349', margin: '0 auto 20px' }} />
            <p style={{ fontFamily: 'Spectral, serif', fontSize: 18, lineHeight: 1.55, color: 'rgba(255,236,196,.75)', margin: '0 0 28px' }}>
              {playerWon ? 'Você coletou todas as cartas do oponente e conquistou o cosmos!' : 'O Oráculo coletou todas as suas cartas. A batalha foi perdida.'}
            </p>

            {/* M6: Match summary panel */}
            {gameSummary && (
              <div style={{
                display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`,
                gap: isMobile ? 8 : 12, marginBottom: 28, maxWidth: 560, margin: '0 auto 28px',
              }}>
                {[
                  { label: 'VITÓRIAS', value: gameSummary.roundsWon, color: '#50dc78' },
                  { label: 'DERROTAS', value: gameSummary.roundsLost, color: '#d94a4a' },
                  { label: 'EMPATES',  value: gameSummary.roundsDraw,  color: 'rgba(244,195,73,.7)' },
                  { label: 'COSMO +',  value: gameSummary.cosmoEarned, color: '#f4c349' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{
                    padding: isMobile ? '10px 8px' : '14px 12px',
                    background: 'rgba(10,5,0,.55)', border: '1px solid rgba(244,195,73,.18)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: isMobile ? 22 : 28, color }}>{value}</span>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: isMobile ? 7 : 8, letterSpacing: '.25em', color: 'rgba(255,236,196,.5)' }}>{label}</span>
                  </div>
                ))}
              </div>
            )}
            {gameSummary && totalRounds > 0 && (
              <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'rgba(244,195,73,.45)', marginBottom: 28 }}>
                {totalRounds} rodadas · {Math.round((gameSummary.roundsWon / totalRounds) * 100)}% de aproveitamento
              </p>
            )}

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
        return <AdminPanel
          cards={deck}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
          onBack={handleBackToMenu}
          gameSettings={gameSettings}
          onSaveSettings={setGameSettings}
          onSyncFromDB={handleSyncFromDB}
        />;

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
