import { createClient } from "@supabase/supabase-js";

// Trims spaces and removes any trailing path (e.g. "/rest/v1") from the URL.
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const origin = url ? new URL(url).origin : "";

export const supabase = createClient(
  origin,
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim()
);
