import { useState, useCallback } from 'react';
import { UserProfile } from '../types';
import { loadQuestProgress, incrementQuest, QuestIncrementResult } from '../utils/quests';
import {
  addCurrency, fetchPlayerStats, upsertGameResult,
  PlayerCurrency, PlayerStats,
} from '../utils/supabase';

export function usePlayerStats(userProfile: UserProfile | null) {
  const [currency, setCurrency] = useState<PlayerCurrency>({ cosmo: 0, po: 0 });
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [questProgress, setQuestProgress] = useState<Record<string, number>>(() => loadQuestProgress());

  const refreshQuests = useCallback(() => setQuestProgress(loadQuestProgress()), []);

  const applyQuestReward = useCallback((result: QuestIncrementResult | null) => {
    if (!result?.completed || !userProfile) return;
    const cosmo = result.quest.rewardCosmo;
    const po = result.quest.rewardPo ?? 0;
    if (cosmo === 0 && po === 0) return;
    setCurrency(prev => ({ cosmo: prev.cosmo + cosmo, po: prev.po + po }));
    addCurrency(cosmo, po);
  }, [userProfile]);

  const updateAfterGame = useCallback(async (params: Parameters<typeof upsertGameResult>[0]) => {
    const newCurrency = await upsertGameResult(params);
    setCurrency(newCurrency);
    const stats = await fetchPlayerStats();
    setPlayerStats(stats);
    return newCurrency;
  }, []);

  return {
    currency, setCurrency,
    playerStats, setPlayerStats,
    questProgress, refreshQuests,
    applyQuestReward,
    updateAfterGame,
  };
}
