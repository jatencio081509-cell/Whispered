import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth, useUser } from "@clerk/expo";
import { syncAllData } from "@/lib/syncClerkToSupabase";
import { supabase } from "@/lib/supabase";

export type Theme = "calm" | "warm" | "playful" | "elegant";
export type Mood = "happy" | "calm" | "okay" | "sad" | "loved" | "motivated" | null;

export interface Couple {
  id: string;
  user1Id: string;
  user2Id: string | null;
  inviteCode: string;
  startDate: string;
  isLinked: boolean;
  partnerDisplayName: string | null;
}

interface AppContextValue {
  couple: Couple | null;
  setCouple: (c: Couple | null) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  myMood: Mood;
  setMyMood: (m: Mood) => void;
  partnerMood: Mood;
  setPartnerMood: (m: Mood) => void;
  streak: number;
  setStreak: (n: number) => void;
  refreshCouple: () => Promise<void>;
  isLoadingCouple: boolean;
}

export const AppContext = createContext<AppContextValue>({
  couple: null,
  setCouple: () => {},
  theme: "calm",
  setTheme: () => {},
  myMood: null,
  setMyMood: () => {},
  partnerMood: null,
  setPartnerMood: () => {},
  streak: 0,
  setStreak: () => {},
  refreshCouple: async () => {},
  isLoadingCouple: false,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [couple, setCoupleState] = useState<Couple | null>(null);
  const [theme, setThemeState] = useState<Theme>("calm");
  const [myMood, setMyMoodState] = useState<Mood>(null);
  const [partnerMood, setPartnerMood] = useState<Mood>(null);
  const [streak, setStreakState] = useState(0);
  const [isLoadingCouple, setIsLoadingCouple] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [t, m, s, c] = await AsyncStorage.multiGet([
        "theme",
        "myMood",
        "streak",
        "couple",
      ]);
      if (t[1]) setThemeState(t[1] as Theme);
      if (m[1]) setMyMoodState(m[1] as Mood);
      if (s[1]) setStreakState(Number(s[1]));
      if (c[1]) setCoupleState(JSON.parse(c[1]));

      // Load mood from Supabase if user is signed in
      if (user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('mood')
            .eq('id', user.id)
            .single();
          
          if (data && !error && data.mood) {
            setMyMoodState(data.mood as Mood);
            // Update AsyncStorage with the latest mood from Supabase
            AsyncStorage.setItem("myMood", data.mood);
          }
        } catch (err) {
          console.error('Failed to load mood from Supabase:', err);
        }
      }
    };
    load();
  }, [user]);

  const setCouple = (c: Couple | null) => {
    setCoupleState(c);
    if (c) {
      AsyncStorage.setItem("couple", JSON.stringify(c));
    } else {
      AsyncStorage.removeItem("couple");
    }
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    AsyncStorage.setItem("theme", t);
  };

  const setMyMood = async (m: Mood) => {
    console.log('Setting mood:', m);
    setMyMoodState(m);
    if (m) AsyncStorage.setItem("myMood", m);
    
    // Sync mood to Supabase
    if (user) {
      try {
        console.log('Syncing mood to Supabase for user:', user.id);
        const { error } = await supabase.from('users').upsert({
          id: user.id,
          mood: m,
          mood_updated_at: new Date().toISOString(),
        });
        
        if (error) {
          console.error('Supabase mood sync error:', error);
        } else {
          console.log('Successfully synced mood to Supabase');
        }
      } catch (err) {
        console.error('Failed to sync mood to Supabase:', err);
      }
    }
  };

  const setStreak = (n: number) => {
    setStreakState(n);
    AsyncStorage.setItem("streak", String(n));
  };

  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  const baseUrl = domain ? `https://${domain}` : "";

  const refreshCouple = useCallback(async () => {
    if (!isSignedIn) return;
    setIsLoadingCouple(true);
    try {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/api/couple/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: Couple = await res.json();
        setCouple(data);
      }
    } catch {
      // Use cached
    } finally {
      setIsLoadingCouple(false);
    }
  }, [isSignedIn, getToken, baseUrl]);

  useEffect(() => {
    if (isSignedIn && user) {
      // Sync Clerk data to Supabase
      syncAllData(
        user.id,
        user.firstName,
        user.username,
        user.imageUrl,
        user.unsafeMetadata?.partnerCode as string | undefined,
        user.unsafeMetadata?.partnerName as string | undefined,
        user.unsafeMetadata?.partner_user_id as string | undefined
      );
      refreshCouple();
    } else {
      setCoupleState(null);
    }
  }, [isSignedIn, user]);

  // Real-time mood sync with partner
  useEffect(() => {
    const partnerUserId = user?.unsafeMetadata?.partner_user_id as string | undefined;
    if (!partnerUserId) return;

    // Fetch initial partner mood
    const fetchPartnerMood = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('mood')
          .eq('id', partnerUserId)
          .single();
        
        if (data && !error) {
          setPartnerMood(data.mood as Mood);
        }
      } catch (err) {
        console.error('Failed to fetch partner mood:', err);
      }
    };

    fetchPartnerMood();

    // Subscribe to partner mood changes
    const channel = supabase
      .channel('partner-mood')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${partnerUserId}`,
        },
        (payload) => {
          const newMood = payload.new as any;
          if (newMood.mood !== undefined) {
            setPartnerMood(newMood.mood as Mood);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.unsafeMetadata?.partner_user_id]);

  return (
    <AppContext.Provider
      value={{
        couple,
        setCouple,
        theme,
        setTheme,
        myMood,
        setMyMood,
        partnerMood,
        setPartnerMood,
        streak,
        setStreak,
        refreshCouple,
        isLoadingCouple,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
