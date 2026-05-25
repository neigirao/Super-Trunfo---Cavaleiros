export interface Quest {
  id: string;
  icon: string;
  name: string;
  total: number;
  rwd: string;
  rewardCosmo: number;
  rewardPo?: number;
}

export const QUESTS: Quest[] = [
  { id: 'win3',   icon: '⚔', name: 'Vença 3 duelos',                total: 3, rwd: '+120 Cosmo', rewardCosmo: 120 },
  { id: 'grp1',   icon: '◇', name: 'Jogue um Cavaleiro do grupo 1', total: 1, rwd: '+45 Pó',     rewardCosmo: 0, rewardPo: 45 },
  { id: 'cond5',  icon: '✦', name: 'Aposte em Condutividade 5×',    total: 5, rwd: '+90 Cosmo',  rewardCosmo: 90 },
  { id: 'legwin', icon: '♛', name: 'Vença com cavaleiro Legendary',  total: 1, rwd: '+150 Cosmo', rewardCosmo: 150 },
];

interface QuestState {
  progress: Record<string, number>;
  date: string;
}

const STORAGE_KEY = 'dailyQuests';

const todayStr = () => new Date().toISOString().slice(0, 10);

export function loadQuestProgress(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const state: QuestState = JSON.parse(raw);
    if (state.date !== todayStr()) return {};
    return state.progress;
  } catch {
    return {};
  }
}

export interface QuestIncrementResult {
  completed: boolean;
  quest: Quest;
}

export function incrementQuest(id: string, by = 1): QuestIncrementResult | null {
  const progress = loadQuestProgress();
  const quest = QUESTS.find(q => q.id === id);
  if (!quest) return null;
  const current = progress[id] ?? 0;
  if (current >= quest.total) return null; // already done
  progress[id] = Math.min(current + by, quest.total);
  const justCompleted = progress[id] === quest.total;
  const state: QuestState = { progress, date: todayStr() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return { completed: justCompleted, quest };
}
