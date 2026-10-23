"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

export function useData() {
  const [d, setD] = useState({ entries: [], paid: new Set(), rate: 1, anchor: "2026-01-05" });

  const reload = useCallback(async () => {
    const [e, p, s] = await Promise.all([
      supabase.from("entries").select("*").order("date", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("paid_periods").select("start"),
      supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    setD({
      entries: e.data || [],
      paid: new Set((p.data || []).map((x) => x.start)),
      rate: Number(s.data?.rate ?? 1),
      anchor: s.data?.anchor ?? "2026-01-05",
    });
  }, []);

  useEffect(() => { reload(); }, [reload]);
  return { ...d, reload };
}
