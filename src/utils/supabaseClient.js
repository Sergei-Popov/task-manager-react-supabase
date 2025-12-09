import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Supabase configuration is missing: VITE_SUPABASE_URL or VITE_SUPABASE_KEY is not defined.",
  );
}

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabaseClient;
