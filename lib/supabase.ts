import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";

// Readers never sign in, so no session is stored.
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type Day = {
  day_number: number;
  title: string;
  prayer: string;
  reference: string;
  bible_search: string;
  commentary: string;
  questions: string[];
  audio_path: string | null;
  audio_seconds: number | null;
  slides: string[]; // storage paths in the slides bucket, in display order (0–5)
};
