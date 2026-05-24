export interface Quest {
  id: string;
  icon: string;
  name: string;
  total: number;
  rwd: string;
}

export const QUESTS: Quest[] = [
  { id: 'win3',    icon: '⚔', name: 'Vença 3 duelos',                total: 3, rwd: '+120 Cosmo' },
  { id: 'grp1',    icon: '◇', name: 'Jogue um Cavaleiro do grupo 1', total: 1, rwd: '+45 Pó'     },
  { id: 'cond5',   icon: '✦', name: 'Aposte em Condutividade 5×',    total: 5, rwd: '+90 Cosmo'  },
  { id: 'legwin',  icon: '♛', name: 'Vença com cavaleiro Legendary',  total: 1, rwd: '+1 Pacote'  },
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

export function incrementQuest(id: string, by = 1): void {
  const progress = loadQuestProgress();
  const quest = QUESTS.find(q => q.id === id);
  if (!quest) return;
  const current = progress[id] ?? 0;
  progress[id] = Math.min(current + by, quest.total);
  const state: QuestState = { progress, date: todayStr() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
