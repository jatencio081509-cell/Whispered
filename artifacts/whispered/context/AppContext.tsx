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

export type Theme = "calm" | "warm" | "playful" | "elegant";
export type Mood = "happy" | "calm" | "okay" | "sad" | "loved" | null;

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
    };
    load();
  }, []);

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

  const setMyMood = (m: Mood) => {
    setMyMoodState(m);
    if (m) AsyncStorage.setItem("myMood", m);
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
        user.unsafeMetadata?.coupleId as string | undefined,
        user.unsafeMetadata?.partnerName as string | undefined,
        user.unsafeMetadata?.inviteCode as string | undefined
      );
      refreshCouple();
    } else {
      setCoupleState(null);
    }
  }, [isSignedIn, user]);

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
