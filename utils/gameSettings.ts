
export interface GameSettings {
  timerSeconds: number;
  advantagePct: number;
  enableAdvantage: boolean;
}

const DEFAULTS: GameSettings = {
  timerSeconds: 30,
  advantagePct: 0.20,
  enableAdvantage: true,
};

const SK = 'cavaleiros_settings';

export function loadGameSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SK);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveGameSettings(s: GameSettings): void {
  localStorage.setItem(SK, JSON.stringify(s));
}
