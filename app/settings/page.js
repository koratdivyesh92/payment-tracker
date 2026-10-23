"use client";
import { useEffect, useState } from "react";
import Shell from "../../components/Shell";
import { supabase } from "../../lib/supabase";
import { useData } from "../../lib/useData";

export default function Settings() {
  const { rate, anchor } = useData();
  const [f, setF] = useState({ rate: "1", anchor: "2026-01-05" });
  const [msg, setMsg] = useState("");

  useEffect(() => { setF({ rate: String(rate), anchor }); }, [rate, anchor]);

  async function save() {
    const { error } = await supabase.from("settings").upsert({ id: 1, rate: parseFloat(f.rate) || 0, anchor: f.anchor });
    setMsg(error ? error.message : "Saved");
  }

  return (
    <Shell>
      <div className="panel">
        <div className="bar"><h2>Settings</h2></div>
        <div className="set">
          <label>Rate per item ($)<input type="number" step="0.01" min="0" value={f.rate} onChange={(e) => setF({ ...f, rate: e.target.value })} /></label>
          <label>First period starts<input type="date" value={f.anchor} onChange={(e) => setF({ ...f, anchor: e.target.value })} /></label>
          <button className="btn" onClick={save}>Save</button>
        </div>
        <div className="hint" style={{ marginTop: 8 }}>{msg}</div>
      </div>
    </Shell>
  );
}
