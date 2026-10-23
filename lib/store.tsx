import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { TOTAL_DAYS } from "./config";
import { Day, supabase } from "./supabase";

const KEYS = {
  progress: "trail:progress",
  days: "trail:days-cache",
  version: "trail:version",
  note: (n: number) => `trail:note:${n}`,
};

type Progress = { reached: number; completed: number[]; lastOpen: string | null };
const freshProgress: Progress = { reached: 1, completed: [], lastOpen: null };

const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// A new day opens once per calendar day the reader comes back,
// as long as they finished the day they were on. Days are not tied to dates.
function advance(p: Progress): Progress {
  const today = localDate();
  let { reached } = p;
  if (p.lastOpen && p.lastOpen !== today && p.completed.includes(reached) && reached < TOTAL_DAYS) {
    reached += 1;
  }
  return { ...p, reached, lastOpen: today };
}

type Ctx = {
  ready: boolean;
  days: Record<number, Day>;
  progress: Progress;
  version: string;
  setVersion: (v: string) => void;
  markComplete: (n: number) => void;
  refresh: () => Promise<void>;
  loadNote: (n: number) => Promise<string>;
  saveNote: (n: number, text: string) => Promise<void>;
  resetAll: () => Promise<void>;
  offline: boolean;
};

const TrailContext = createContext<Ctx | null>(null);

export function TrailProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [days, setDays] = useState<Record<number, Day>>({});
  const [progress, setProgress] = useState<Progress>(freshProgress);
  const [version, setVersionState] = useState("NRSVUE");
  const [offline, setOffline] = useState(false);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const persistProgress = useCallback((p: Progress) => {
    setProgress(p);
    AsyncStorage.setItem(KEYS.progress, JSON.stringify(p)).catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("days")
      .select("day_number,title,prayer,reference,bible_search,commentary,questions,audio_path,audio_seconds")
      .eq("status", "published")
      .order("day_number");
    if (error || !data) {
      setOffline(true);
      return;
    }
    const map: Record<number, Day> = {};
    data.forEach((d) => (map[d.day_number] = d as Day));
    setDays(map);
    setOffline(false);
    AsyncStorage.setItem(KEYS.days, JSON.stringify(map)).catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [p, cached, v] = await Promise.all([
          AsyncStorage.getItem(KEYS.progress),
          AsyncStorage.getItem(KEYS.days),
          AsyncStorage.getItem(KEYS.version),
        ]);
        if (cached) setDays(JSON.parse(cached));
        if (v) setVersionState(v);
        persistProgress(advance(p ? JSON.parse(p) : freshProgress));
      } catch {
        persistProgress(advance(freshProgress));
      }
      setReady(true);
      refresh();
    })();
  }, [persistProgress, refresh]);

  // When the app comes back to the foreground on a new day, open the next stop.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") {
        persistProgress(advance(progressRef.current));
        refresh();
      }
    });
    return () => sub.remove();
  }, [persistProgress, refresh]);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      days,
      progress,
      version,
      offline,
      setVersion: (v) => {
        setVersionState(v);
        AsyncStorage.setItem(KEYS.version, v).catch(() => {});
      },
      markComplete: (n) => {
        const p = progressRef.current;
        if (!p.completed.includes(n)) persistProgress({ ...p, completed: [...p.completed, n] });
      },
      refresh,
      loadNote: async (n) => (await AsyncStorage.getItem(KEYS.note(n))) ?? "",
      saveNote: async (n, text) => {
        await AsyncStorage.setItem(KEYS.note(n), text);
      },
      resetAll: async () => {
        const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith("trail:") && k !== KEYS.days);
        await AsyncStorage.multiRemove(keys);
        persistProgress(advance(freshProgress));
      },
    }),
    [ready, days, progress, version, offline, refresh, persistProgress]
  );

  return <TrailContext.Provider value={value}>{children}</TrailContext.Provider>;
}

export function useTrail() {
  const ctx = useContext(TrailContext);
  if (!ctx) throw new Error("useTrail must be used inside TrailProvider");
  return ctx;
}
