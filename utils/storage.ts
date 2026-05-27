// A5: namespace todas as chaves de localStorage para evitar colisões entre versões
export const SK = {
  deck:      'stce_deck',
  savedGame: 'stce_savedGame',
  muted:     'stce_muted',
  quests:    'stce_quests',
} as const;

// Migra chaves legadas (sem namespace) para as novas chaves com namespace.
// Chama uma vez na inicialização do app.
export function migrateStorage(): void {
  const legacy: Record<string, string> = {
    superTrunfoDeck: SK.deck,
    savedGame:       SK.savedGame,
    muted:           SK.muted,
    dailyQuests:     SK.quests,
  };
  for (const [old, next] of Object.entries(legacy)) {
    const val = localStorage.getItem(old);
    if (val !== null) {
      if (localStorage.getItem(next) === null) localStorage.setItem(next, val);
      localStorage.removeItem(old);
    }
  }
}
