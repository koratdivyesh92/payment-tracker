"use client";
import { useState } from "react";
import Shell from "../../components/Shell";
import Modal from "../../components/Modal";
import { supabase } from "../../lib/supabase";
import { useData } from "../../lib/useData";
import { countOf, fmt, money, rangeOf } from "../../lib/calc";

const blank = () => ({ date: new Date().toISOString().slice(0, 10), ref: "", from_num: "", to_num: "", missing: "", undelivered: "" });

export default function Reports() {
  const { entries, rate, reload } = useData();
  const [form, setForm] = useState(null);
  const [view, setView] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit() {
    const a = parseInt(form.from_num, 10), b = parseInt(form.to_num, 10);
    if (!form.date || !form.ref.trim() || isNaN(a) || isNaN(b)) return setErr("Please fill in date, ID, From and To.");
    if (b < a) return setErr("To must be greater than or equal to From.");
    const { error } = await supabase.from("entries").insert({
      date: form.date, ref: form.ref.trim(), from_num: a, to_num: b,
      missing: form.missing.trim(), undelivered: form.undelivered.trim(),
    });
    if (error) return setErr(error.message);
    setForm(null);
    reload();
  }

  async function del(id) {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) alert(error.message);
    reload();
  }

  return (
    <Shell>
      <div className="panel">
        <div className="bar">
          <h2>Daily data</h2>
          <div className="grp">
            <button className="btn ghost" onClick={() => setView(true)}>View</button>
            <button className="btn" onClick={() => { setErr(""); setForm(blank()); }}>+ Add</button>
          </div>
        </div>
        <div className="scroll">
          <table>
            <thead>
              <tr><th>Date</th><th>ID</th><th>From</th><th>To</th><th>Missing</th><th>Undelivered</th><th className="num">Count</th><th className="num">Amount</th><th></th></tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const c = countOf(e);
                return (
                  <tr key={e.id}>
                    <td>{fmt(e.date)}</td><td>{e.ref}</td><td>{e.from_num}</td><td>{e.to_num}</td>
                    <td>{e.missing || "—"}</td><td>{e.undelivered || "—"}</td>
                    <td className="num">{c}</td><td className="num">{money(c * rate)}</td>
                    <td><button className="del" title="Delete" onClick={() => del(e.id)}>🗑️</button></td>
                  </tr>
                );
              })}
              {!entries.length && <tr><td colSpan={9} className="empty">No data yet. Click Add to create the first entry.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <Modal title="Add new data" onClose={() => setForm(null)}>
          <div className="f"><label>Date<input type="date" value={form.date} onChange={set("date")} /></label></div>
          <div className="f"><label>ID<input value={form.ref} onChange={set("ref")} /></label></div>
          <div className="row2 f">
            <label>From<input type="number" value={form.from_num} onChange={set("from_num")} /></label>
            <label>To<input type="number" value={form.to_num} onChange={set("to_num")} /></label>
          </div>
          <div className="f">
            <label>Missing<input value={form.missing} onChange={set("missing")} placeholder="e.g. 4, 7, 10-12" /></label>
            <div className="hint">Numbers separated by commas; ranges like 10-12 work too.</div>
          </div>
          <div className="f"><label>Undelivered<input value={form.undelivered} onChange={set("undelivered")} placeholder="e.g. 15, 18" /></label></div>
          <div className="err">{err}</div>
          <div className="acts">
            <button className="btn ghost" onClick={() => setForm(null)}>Cancel</button>
            <button className="btn" onClick={submit}>Submit</button>
          </div>
        </Modal>
      )}

      {view && (
        <Modal title="View" wide onClose={() => setView(false)}>
          <div className="scroll">
            <table style={{ minWidth: 0 }}>
              <thead><tr><th>Date</th><th>Numbers</th><th className="num">Count</th></tr></thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}><td>{fmt(e.date)}</td><td>{rangeOf(e)}</td><td className="num">{countOf(e)}</td></tr>
                ))}
                {!entries.length && <tr><td colSpan={3} className="empty">No data yet.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="acts" style={{ marginTop: 12 }}><button className="btn" onClick={() => setView(false)}>Close</button></div>
        </Modal>
      )}
    </Shell>
  );
}
