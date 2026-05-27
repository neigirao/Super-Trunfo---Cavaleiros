export interface Quest {
  id: string;
  icon: string;
  name: string;
  total: number;
  rwd: string;
  rewardCosmo: number;
  rewardPo?: number;
}

export const QUEST_POOL: Quest[] = [
  { id: 'win3',   icon: '⚔', name: 'Vença 3 duelos',                  total: 3,  rwd: '+120 Cosmo', rewardCosmo: 120 },
  { id: 'win5',   icon: '⚔', name: 'Vença 5 duelos',                  total: 5,  rwd: '+200 Cosmo', rewardCosmo: 200 },
  { id: 'cond5',  icon: '✦', name: 'Aposte em Condutividade 5×',       total: 5,  rwd: '+90 Cosmo',  rewardCosmo: 90  },
  { id: 'react3', icon: '⚡', name: 'Aposte em Reatividade 3×',         total: 3,  rwd: '+60 Cosmo',  rewardCosmo: 60  },
  { id: 'mass3',  icon: '⊕', name: 'Aposte em Massa Atômica 3×',       total: 3,  rwd: '+60 Cosmo',  rewardCosmo: 60  },
  { id: 'play10', icon: '◈', name: 'Jogue 10 rodadas',                  total: 10, rwd: '+80 Cosmo',  rewardCosmo: 80  },
  { id: 'legwin', icon: '♛', name: 'Vença com cavaleiro Lendário',      total: 1,  rwd: '+150 Cosmo', rewardCosmo: 150 },
  { id: 'hard1',  icon: '☠', name: 'Vença 1 partida no Difícil',        total: 1,  rwd: '+250 Cosmo', rewardCosmo: 250 },
  { id: 'grp1',   icon: '◇', name: 'Jogue um Cavaleiro Alcalino',       total: 1,  rwd: '+45 Pó',     rewardCosmo: 0, rewardPo: 45 },
];

interface QuestState {
  progress: Record<string, number>;
  date: string;
}

import { SK } from './storage';
const STORAGE_KEY = SK.quests;

const todayStr = () => new Date().toISOString().slice(0, 10);

function seededRand(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

function dateSeed(): number {
  const d = todayStr();
  let h = 0;
  for (let i = 0; i < d.length; i++) {
    h = (Math.imul(31, h) + d.charCodeAt(i)) | 0;
  }
  return h;
}

export function getDailyQuests(): Quest[] {
  const rand = seededRand(dateSeed());
  const shuffled = [...QUEST_POOL];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 4);
}

// Daily selection — re-evaluated each day via seeded shuffle
export const QUESTS: Quest[] = getDailyQuests();

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
