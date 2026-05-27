import { createClient } from '@supabase/supabase-js';
import { CardData, ElementType, Attribute } from '../types';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── Mapa element_type → ElementType ──────────────────────────
const ELEMENT_TYPE_MAP: Record<string, ElementType> = {
  actinide:         ElementType.Actinide,
  alkali:           ElementType.AlkaliMetal,
  alkaline_earth:   ElementType.AlkalineEarthMetal,
  halogen:          ElementType.Halogen,
  lanthanide:       ElementType.Lanthanide,
  metal:            ElementType.TransitionMetal,
  metalloid:        ElementType.Metalloid,
  'noble-gas':      ElementType.NobleGas,
  noble_gas:        ElementType.NobleGas,
  'non-metal':      ElementType.ReactiveNonmetal,
  non_metal:        ElementType.ReactiveNonmetal,
  transition_metal: ElementType.TransitionMetal,
  post_transition:  ElementType.PostTransitionMetal,
};

export async function loadCardsFromDB(): Promise<CardData[]> {
  const { data, error } = await supabase
    .from('element_cards')
    .select('id, name, knight_name, image_url, element_type, is_super_trump, reactivity, radioactivity, atomic_mass, density, melting_point')
    .order('atomic_mass');
  if (error || !data || data.length === 0) return [];
  const rows = data as Array<Record<string, unknown>>;
  return rows.map(row => {
    const meltingPt = parseFloat(String(row.melting_point ?? '500'));
    const normalizedMelt = Math.round(Math.max(0, Math.min(100, ((meltingPt + 272) / (3422 + 272)) * 100)));
    const imgUrl = String(row.image_url ?? '');
    return {
      id: String(row.id),
      name: String(row.knight_name || row.name),
      imageUrl: imgUrl !== '' ? imgUrl : `https://picsum.photos/seed/${row.id}/400/600`,
      element: ELEMENT_TYPE_MAP[String(row.element_type)] ?? ElementType.TransitionMetal,
      attributes: {
        [Attribute.Reatividade]:    Number(row.reactivity    ?? 50),
        [Attribute.MassaAtomica]:   Math.min(999, Math.round(parseFloat(String(row.atomic_mass ?? '100')))),
        [Attribute.Radioatividade]: Number(row.radioactivity ?? 0),
        [Attribute.Condutividade]:  Math.round(parseFloat(String(row.density ?? '5')) * 10),
        [Attribute.Dureza]:         normalizedMelt,
      },
      isSuperTrunfo: Boolean(row.is_super_trump ?? false),
    };
  });
}

// ─── Tipos ────────────────────────────────────────────────────
export interface RankingRow {
  id: string;
  user_id: string | null;
  player_name: string;
  total_score: number;
  games_won: number;
  games_lost: number;
  total_games: number;
  win_rate: number;
  highest_score: number;
  current_streak: number;
  longest_streak: number;
  difficulty_level: string;
  last_played_at: string | null;
  cosmo: number;
  po: number;
  total_cards_played: number;
  average_game_duration: number;
}

export interface PlayerCurrency { cosmo: number; po: number; }

export interface PlayerStats {
  gamesWon: number;
  gamesLost: number;
  totalGames: number;
  winRate: number;
  currentStreak: number;
  totalScore: number;
}

// ─── Auth ─────────────────────────────────────────────────────
export async function signInWithGoogleToken(idToken: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) console.error('[supabase] signIn error:', error.message);
  return data?.user ?? null;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// ─── Deck ─────────────────────────────────────────────────────
export async function loadDeckFromCloud(): Promise<CardData[] | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('cavaleiros_decks')
    .select('deck_json')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;
  return data.deck_json as CardData[];
}

export async function saveDeckToCloud(deck: CardData[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('cavaleiros_decks')
    .upsert(
      { user_id: user.id, deck_json: deck, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
}

// ─── Currency ─────────────────────────────────────────────────
export async function addCurrency(cosmo: number, po = 0): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: existing } = await supabase
    .from('card_game_rankings')
    .select('cosmo,po')
    .eq('user_id', user.id)
    .single();
  if (!existing) return;
  await supabase.from('card_game_rankings').update({
    cosmo: (existing.cosmo ?? 0) + cosmo,
    po:    (existing.po    ?? 0) + po,
  }).eq('user_id', user.id);
}

export async function fetchPlayerCurrency(): Promise<PlayerCurrency> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { cosmo: 0, po: 0 };

  const { data } = await supabase
    .from('card_game_rankings')
    .select('cosmo,po')
    .eq('user_id', user.id)
    .single();

  return { cosmo: data?.cosmo ?? 0, po: data?.po ?? 0 };
}

// ─── Player stats ─────────────────────────────────────────────
export async function fetchPlayerStats(): Promise<PlayerStats | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('card_game_rankings')
    .select('games_won,games_lost,total_games,win_rate,current_streak,total_score')
    .eq('user_id', user.id)
    .single();
  if (!data) return null;
  return {
    gamesWon: data.games_won ?? 0,
    gamesLost: data.games_lost ?? 0,
    totalGames: data.total_games ?? 0,
    winRate: data.win_rate ?? 0,
    currentStreak: data.current_streak ?? 0,
    totalScore: data.total_score ?? 0,
  };
}

// ─── Ranking ──────────────────────────────────────────────────
export async function fetchRanking(limit = 20): Promise<RankingRow[]> {
  const { data, error } = await supabase
    .from('card_game_rankings')
    .select('id,user_id,player_name,total_score,games_won,games_lost,total_games,win_rate,highest_score,current_streak,longest_streak,difficulty_level,last_played_at,cosmo,po')
    .order('total_score', { ascending: false })
    .limit(limit);

  if (error) { console.error('[supabase] fetchRanking error:', error.message); return []; }
  return (data ?? []) as RankingRow[];
}

export async function upsertGameResult(params: {
  playerName: string;
  won: boolean;
  playerCardsLeft: number;
  totalCards: number;
  difficulty: string;
}): Promise<PlayerCurrency> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { cosmo: 0, po: 0 };

  const { data: existing } = await supabase
    .from('card_game_rankings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const now = new Date().toISOString();
  const gameScore = params.won ? params.playerCardsLeft * 10 : 0;

  // Difficulty multiplier for Cosmo rewards
  const diffMultiplier = params.difficulty === 'Difícil' ? 2.0
    : params.difficulty === 'Normal' ? 1.5
    : 1.0;

  // Currency rewards
  const cosmoBase = params.won
    ? 100 + Math.max(0, params.playerCardsLeft - Math.floor(params.totalCards / 2)) * 10
    : 10;
  const cosmoEarned = params.won ? Math.round(cosmoBase * diffMultiplier) : cosmoBase;
  const poEarned = params.won ? 0 : 0; // Pó reserved for future use

  if (existing) {
    const gW  = existing.games_won  + (params.won ? 1 : 0);
    const gL  = existing.games_lost + (params.won ? 0 : 1);
    const gT  = existing.total_games + 1;
    const str = params.won ? existing.current_streak + 1 : 0;
    const lStr = Math.max(existing.longest_streak, str);
    const bonusScore = params.won ? str * 5 : 0;
    const newScore   = existing.total_score + gameScore + bonusScore;
    const newHighest = Math.max(existing.highest_score, gameScore);
    const wr = parseFloat(((gW / gT) * 100).toFixed(2));
    const newCosmo = (existing.cosmo ?? 0) + cosmoEarned;
    const newPo    = (existing.po    ?? 0) + poEarned;

    await supabase.from('card_game_rankings').update({
      player_name: params.playerName,
      games_won: gW, games_lost: gL, total_games: gT,
      current_streak: str, longest_streak: lStr,
      total_score: newScore, highest_score: newHighest,
      win_rate: wr,
      difficulty_level: params.difficulty,
      total_cards_played: (existing.total_cards_played ?? 0) + params.totalCards,
      cosmo: newCosmo, po: newPo,
      last_played_at: now, updated_at: now,
    }).eq('user_id', user.id);
    return { cosmo: newCosmo, po: newPo };
  } else {
    const str = params.won ? 1 : 0;
    await supabase.from('card_game_rankings').insert({
      user_id: user.id,
      player_name: params.playerName,
      games_won: params.won ? 1 : 0,
      games_lost: params.won ? 0 : 1,
      total_games: 1,
      current_streak: str, longest_streak: str,
      total_score: gameScore, highest_score: gameScore,
      win_rate: params.won ? 100 : 0,
      difficulty_level: params.difficulty,
      total_cards_played: params.totalCards,
      average_game_duration: 0,
      cosmo: cosmoEarned, po: poEarned,
      last_played_at: now, created_at: now, updated_at: now,
    });
    return { cosmo: cosmoEarned, po: poEarned };
  }
}
