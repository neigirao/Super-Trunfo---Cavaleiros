import { useState, useEffect } from 'react';
import { CardData, UserProfile } from '../types';
import {
  supabase, signOut as supabaseSignOut,
  loadDeckFromCloud, fetchPlayerCurrency,
  fetchPlayerStats, PlayerCurrency, PlayerStats,
} from '../utils/supabase';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? 'neigirao@gmail.com';

export function useAuth(
  setDeck: React.Dispatch<React.SetStateAction<CardData[]>>,
  setCurrency: React.Dispatch<React.SetStateAction<PlayerCurrency>>,
  setPlayerStats: React.Dispatch<React.SetStateAction<PlayerStats | null>>,
) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const hydrate = (session: { user?: { user_metadata?: Record<string, string>; email?: string } } | null) => {
      const user = session?.user;
      if (!user) { setUserProfile(null); setIsAdmin(false); return; }
      const meta = user.user_metadata ?? {};
      const profile: UserProfile = {
        name: meta.full_name ?? meta.name ?? user.email ?? 'Jogador',
        email: user.email ?? '',
        picture: meta.avatar_url ?? meta.picture ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email ?? 'player')}`,
      };
      setUserProfile(profile);
      setIsAdmin(profile.email === ADMIN_EMAIL);
    };

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      hydrate(session as Parameters<typeof hydrate>[0]);
      if (_event === 'SIGNED_IN' && session?.user) {
        const cloudDeck = await loadDeckFromCloud();
        if (cloudDeck && cloudDeck.length > 0) setDeck(cloudDeck);
        setCurrency(await fetchPlayerCurrency());
        setPlayerStats(await fetchPlayerStats());
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      hydrate(data.session as Parameters<typeof hydrate>[0]);
      if (data.session?.user) {
        setCurrency(await fetchPlayerCurrency());
        setPlayerStats(await fetchPlayerStats());
      }
    });

    return () => { sub.subscription.unsubscribe(); };
  }, [setDeck, setCurrency, setPlayerStats]);

  const handleLogout = async () => {
    // @ts-ignore - window.google may not be typed
    window.google?.accounts?.id?.disableAutoSelect?.();
    await supabaseSignOut();
    setUserProfile(null);
    setIsAdmin(false);
  };

  return { userProfile, isAdmin, handleLogout };
}
