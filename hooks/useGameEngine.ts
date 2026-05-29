import { useState, useEffect, useCallback, useRef } from 'react';
import { CardData, GameState, Attribute, RoundResult, UserProfile, ElementType, Difficulty } from '../types';
import { PlayerCurrency } from '../utils/supabase';
import { incrementQuest, QuestIncrementResult } from '../utils/quests';
import { playCardFlip, playRoundWin, playRoundLose, playRoundDraw, playGameWin, playGameLose } from '../utils/sounds';

const ADVANTAGE_BONUS_PERCENTAGE = 0.20;
const TURN_TIMER_SECONDS = 30;

const advantageMap: { [key: string]: Attribute } = {
  [`${ElementType.Halogen}-${ElementType.AlkaliMetal}`]: Attribute.Reatividade,
  [`${ElementType.AlkaliMetal}-${ElementType.TransitionMetal}`]: Attribute.Dureza,
  [`${ElementType.TransitionMetal}-${ElementType.Actinide}`]: Attribute.Radioatividade,
  [`${ElementType.Actinide}-${ElementType.NobleGas}`]: Attribute.MassaAtomica,
  [`${ElementType.NobleGas}-${ElementType.Halogen}`]: Attribute.Reatividade,
};

const getAdvantage = (attacker: CardData, defender: CardData): { attribute: Attribute } | null => {
  const key = `${attacker.element}-${defender.element}`;
  const attr = advantageMap[key];
  return attr ? { attribute: attr } : null;
};

const shuffleDeck = <T,>(array: T[]): T[] => {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

interface GameEngineParams {
  deck: CardData[];
  difficulty: Difficulty;
  userProfile: UserProfile | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  applyQuestReward: (r: QuestIncrementResult | null) => void;
  updateAfterGame: (params: {
    playerName: string; won: boolean; playerCardsLeft: number;
    totalCards: number; difficulty: string;
  }) => Promise<PlayerCurrency>;
  showToast: (message: string, type?: 'error' | 'success' | 'info') => void;
  timerSeconds?: number;
  advantagePct?: number;
}

export function useGameEngine({
  deck, difficulty, userProfile, setGameState,
  applyQuestReward, updateAfterGame, showToast,
  timerSeconds = TURN_TIMER_SECONDS,
  advantagePct = ADVANTAGE_BONUS_PERCENTAGE,
}: GameEngineParams) {
  const [playerDeck, setPlayerDeck] = useState<CardData[]>([]);
  const [aiDeck, setAiDeck] = useState<CardData[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [matchHistory, setMatchHistory] = useState<RoundResult[]>([]);
  const [isMultiplayer, setIsMultiplayer] = useState(false);

  const [playerAdvantage, setPlayerAdvantage] = useState<{ attribute: Attribute; bonus: number } | null>(null);
  const [p2Advantage, setP2Advantage] = useState<{ attribute: Attribute; bonus: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(timerSeconds);

  const [isRevealing, setIsRevealing] = useState(false);
  const [showResultInfo, setShowResultInfo] = useState(false);
  const [showNextRoundButton, setShowNextRoundButton] = useState(false);
  const [transferAnim, setTransferAnim] = useState<'none' | 'player-wins' | 'ai-wins'>('none');

  // M6: round stats across the entire match (not limited to matchHistory's 10-item cap)
  const roundStatsRef = useRef({ won: 0, lost: 0, draw: 0 });
  const [gameSummary, setGameSummary] = useState<{
    won: boolean; roundsWon: number; roundsLost: number; roundsDraw: number; cosmoEarned: number;
  } | null>(null);

  const resolveRound = useCallback((attribute: Attribute, pCard: CardData, aCard: CardData) => {
    let pVal = pCard.attributes[attribute];
    let aVal = aCard.attributes[attribute];
    let pBonus = 0, aBonus = 0;

    const pAdv = getAdvantage(pCard, aCard);
    if (pAdv && pAdv.attribute === attribute) {
      pBonus = Math.round(pVal * advantagePct);
      pVal += pBonus;
    }
    const aAdv = getAdvantage(aCard, pCard);
    if (aAdv && aAdv.attribute === attribute) {
      aBonus = Math.round(aVal * advantagePct);
      aVal += aBonus;
    }

    let winner: 'player' | 'ai' | 'tie';
    if (pCard.isSuperTrunfo && !aCard.isSuperTrunfo) winner = 'player';
    else if (!pCard.isSuperTrunfo && aCard.isSuperTrunfo) winner = 'ai';
    else winner = pVal > aVal ? 'player' : aVal > pVal ? 'ai' : 'tie';

    const result: RoundResult = { winner, attribute, playerCard: pCard, aiCard: aCard, playerValue: pVal, aiValue: aVal, playerBonus: pBonus, aiBonus: aBonus };
    // M6: track cumulative round stats
    if (winner === 'player') roundStatsRef.current.won++;
    else if (winner === 'ai') roundStatsRef.current.lost++;
    else roundStatsRef.current.draw++;
    setRoundResult(result);
    setMatchHistory(prev => [result, ...prev].slice(0, 10));
    setGameState(GameState.RoundResult);
  }, [setGameState, advantagePct]);

  // ── Advantage calculation ──────────────────────────────────
  useEffect(() => {
    if (playerDeck.length > 0 && aiDeck.length > 0) {
      const adv1 = getAdvantage(playerDeck[0], aiDeck[0]);
      setPlayerAdvantage(adv1 ? { attribute: adv1.attribute, bonus: Math.round(playerDeck[0].attributes[adv1.attribute] * advantagePct) } : null);
      const adv2 = getAdvantage(aiDeck[0], playerDeck[0]);
      setP2Advantage(adv2 ? { attribute: adv2.attribute, bonus: Math.round(aiDeck[0].attributes[adv2.attribute] * advantagePct) } : null);
    } else {
      setPlayerAdvantage(null);
      setP2Advantage(null);
    }
  }, [playerDeck, aiDeck, advantagePct]);

  // ── Round result animation orchestration ──────────────────
  useEffect(() => {
    setIsRevealing(false); setShowResultInfo(false); setShowNextRoundButton(false);
    if (!roundResult) return;
    const t1 = setTimeout(() => setIsRevealing(true), 250);
    const t2 = setTimeout(() => setShowResultInfo(true), 1100);
    const t3 = setTimeout(() => setShowNextRoundButton(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [roundResult]);

  // ── Sound effects ──────────────────────────────────────────
  useEffect(() => {
    if (!roundResult) return;
    if (roundResult.winner === 'player') playRoundWin();
    else if (roundResult.winner === 'ai') playRoundLose();
    else playRoundDraw();
  }, [roundResult]);

  // ── Timer reset ────────────────────────────────────────────
  useEffect(() => {
    if (isPlayerTurn || isMultiplayer) setTimeLeft(timerSeconds);
  }, [isPlayerTurn, isMultiplayer, timerSeconds]);

  // ── Timer countdown + auto-select ──────────────────────────
  useEffect(() => {
    const humanTurn = isPlayerTurn || (isMultiplayer && !isPlayerTurn);
    if (!humanTurn) return;
    if (timeLeft <= 0) {
      if (playerDeck.length === 0 || aiDeck.length === 0) return;
      const activeDeck = isPlayerTurn ? playerDeck : aiDeck;
      const attrs = Object.keys(activeDeck[0].attributes) as Attribute[];
      const randomAttr = attrs[Math.floor(Math.random() * attrs.length)];
      playCardFlip();
      resolveRound(randomAttr, playerDeck[0], aiDeck[0]);
      return;
    }
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [isPlayerTurn, isMultiplayer, timeLeft, playerDeck, aiDeck, resolveRound]);

  // ── AI turn ────────────────────────────────────────────────
  useEffect(() => {
    if (isPlayerTurn || isMultiplayer) return;
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
        let bestVal = -1;
        (Object.entries(aiCard.attributes) as [Attribute, number][]).forEach(([attr, val]) => {
          const eff = aiAdv && aiAdv.attribute === attr ? val + Math.round(val * advantagePct) : val;
          if (eff > bestVal) { bestVal = eff; bestAttr = attr; }
        });
      }
      resolveRound(bestAttr, playerCard, aiCard);
    }, 1400);
    return () => clearTimeout(timer);
  }, [isPlayerTurn, isMultiplayer, playerDeck, aiDeck, difficulty, resolveRound, advantagePct]);

  const startGame = useCallback((multiplayer = false) => {
    if (!userProfile) return;
    if (deck.length < 2) {
      showToast('Seu baralho precisa de pelo menos 2 cartas', 'error');
      return;
    }
    setIsMultiplayer(multiplayer);
    setMatchHistory([]);
    roundStatsRef.current = { won: 0, lost: 0, draw: 0 };
    setGameSummary(null);
    const shuffled = shuffleDeck(deck);
    const mid = Math.floor(shuffled.length / 2);
    setPlayerDeck(shuffled.slice(0, mid));
    setAiDeck(shuffled.slice(mid));
    setIsPlayerTurn(true);
    setRoundResult(null);
    setGameState(GameState.Playing);
  }, [deck, userProfile, setGameState, showToast]);

  const handleAttributeSelect = useCallback((attribute: Attribute) => {
    if (!isPlayerTurn || playerDeck.length === 0 || aiDeck.length === 0) return;
    playCardFlip();
    if (attribute === Attribute.Condutividade) { applyQuestReward(incrementQuest('cond5')); }
    if (attribute === Attribute.Reatividade)   { applyQuestReward(incrementQuest('react3')); }
    if (attribute === Attribute.MassaAtomica)  { applyQuestReward(incrementQuest('mass3')); }
    if (playerDeck[0].element === ElementType.AlkaliMetal) { applyQuestReward(incrementQuest('grp1')); }
    resolveRound(attribute, playerDeck[0], aiDeck[0]);
  }, [isPlayerTurn, playerDeck, aiDeck, applyQuestReward, resolveRound]);

  const handleP2AttributeSelect = useCallback((attribute: Attribute) => {
    if (isPlayerTurn || !isMultiplayer || playerDeck.length === 0 || aiDeck.length === 0) return;
    playCardFlip();
    resolveRound(attribute, playerDeck[0], aiDeck[0]);
  }, [isPlayerTurn, isMultiplayer, playerDeck, aiDeck, resolveRound]);

  const handleNextRound = useCallback(async () => {
    if (!roundResult) return;
    let newPlayerDeck = [...playerDeck];
    let newAiDeck = [...aiDeck];
    const pCard = newPlayerDeck.shift();
    const aCard = newAiDeck.shift();

    if (pCard && aCard) {
      if (roundResult.winner === 'player') {
        newPlayerDeck.push(pCard, aCard);
        setIsPlayerTurn(true);
      } else if (roundResult.winner === 'ai') {
        newAiDeck.push(aCard, pCard);
        setIsPlayerTurn(false);
      } else {
        newPlayerDeck.push(pCard);
        newAiDeck.push(aCard);
      }
    }

    setPlayerDeck(newPlayerDeck);
    setAiDeck(newAiDeck);

    // M7: track round played quest
    applyQuestReward(incrementQuest('play10'));

    if (newPlayerDeck.length === 0 || newAiDeck.length === 0) {
      const playerWon = newPlayerDeck.length > 0;
      if (playerWon) playGameWin(); else playGameLose();
      if (playerWon) { applyQuestReward(incrementQuest('win3')); applyQuestReward(incrementQuest('win5')); }
      if (playerWon && pCard?.isSuperTrunfo) applyQuestReward(incrementQuest('legwin'));
      if (playerWon && difficulty === Difficulty.Hard) applyQuestReward(incrementQuest('hard1'));

      // M6: compute cosmo earned with same formula as upsertGameResult
      const diffMultiplier = difficulty === Difficulty.Hard ? 2.0 : difficulty === Difficulty.Normal ? 1.5 : 1.0;
      const cosmoBase = playerWon ? 100 + Math.max(0, newPlayerDeck.length - Math.floor(deck.length / 2)) * 10 : 10;
      const cosmoEarned = playerWon ? Math.round(cosmoBase * diffMultiplier) : cosmoBase;
      setGameSummary({
        won: playerWon,
        roundsWon: roundStatsRef.current.won,
        roundsLost: roundStatsRef.current.lost,
        roundsDraw: roundStatsRef.current.draw,
        cosmoEarned,
      });

      if (userProfile) {
        await updateAfterGame({
          playerName: userProfile.name,
          won: playerWon,
          playerCardsLeft: newPlayerDeck.length,
          totalCards: deck.length,
          difficulty: difficulty as string,
        });
      }
      setGameState(GameState.GameOver);
    } else {
      setRoundResult(null);
      setGameState(GameState.Playing);
    }
  }, [roundResult, playerDeck, aiDeck, userProfile, deck, difficulty, applyQuestReward, updateAfterGame, setGameState]);

  const handleNextRoundAnimated = useCallback(() => {
    if (!roundResult || transferAnim !== 'none') return;
    const anim = roundResult.winner === 'player' ? 'player-wins'
               : roundResult.winner === 'ai'     ? 'ai-wins'
               : 'none';
    if (anim === 'none') { handleNextRound(); return; }
    setTransferAnim(anim);
    setTimeout(() => { setTransferAnim('none'); handleNextRound(); }, 700);
  }, [roundResult, transferAnim, handleNextRound]);

  return {
    playerDeck, aiDeck,
    isPlayerTurn,
    roundResult,
    matchHistory,
    isMultiplayer,
    playerAdvantage, p2Advantage,
    timeLeft, TURN_TIMER_SECONDS: timerSeconds,
    isRevealing, showResultInfo, showNextRoundButton,
    transferAnim,
    gameSummary,
    startGame, handleAttributeSelect, handleP2AttributeSelect,
    handleNextRound, handleNextRoundAnimated,
  };
}
