"use client";
import { useState } from "react";
import Shell from "../../components/Shell";
import Modal from "../../components/Modal";
import ExcelUpload from "../../components/ExcelUpload";
import D from "../../components/D";
import { supabase } from "../../lib/supabase";
import { useData } from "../../lib/useData";
import { countOf, fmt, money, rangeOf } from "../../lib/calc";

const blank = () => ({ date: new Date().toISOString().slice(0, 10), ref: "", from_num: "", to_num: "", missing: "", undelivered: "", comment: "" });

export default function Reports() {
  const { entries, rate, reload } = useData();
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [view, setView] = useState(false);
  const [upload, setUpload] = useState(false);
  const [delId, setDelId] = useState(null);
  const [err, setErr] = useState("");
  const [df, setDf] = useState("");
  const [dt, setDt] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const shown = entries.filter((e) => (!df || e.date >= df) && (!dt || e.date <= dt));
  const total = shown.reduce((s, e) => s + countOf(e), 0);
  const filtered = !!(df || dt);
  const rangeLabel = filtered ? `${df ? fmt(df) : "Beginning"} – ${dt ? fmt(dt) : "Latest"}` : "All dates";

  async function submit() {
    const a = parseInt(form.from_num, 10), b = parseInt(form.to_num, 10);
    if (!form.date || !form.ref.trim() || isNaN(a) || isNaN(b)) return setErr("Please fill in date, ID, From and To.");
    if (b < a) return setErr("To must be greater than or equal to From.");
    const row = {
      date: form.date, ref: form.ref.trim(), from_num: a, to_num: b,
      missing: form.missing.trim(), undelivered: form.undelivered.trim(), comment: form.comment.trim(),
    };
    const { error } = editId
      ? await supabase.from("entries").update(row).eq("id", editId)
      : await supabase.from("entries").insert(row);
    if (error) return setErr(error.message);
    setForm(null);
    setEditId(null);
    reload();
  }

  function openEdit(e) {
    setErr("");
    setEditId(e.id);
    setForm({
      date: e.date, ref: e.ref, from_num: String(e.from_num), to_num: String(e.to_num),
      missing: e.missing || "", undelivered: e.undelivered || "", comment: e.comment || "",
    });
  }

  async function del() {
    const { error } = await supabase.from("entries").delete().eq("id", delId);
    setDelId(null);
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
            <button className="btn ghost" onClick={() => setUpload(true)}>Upload Excel</button>
            <button className="btn" onClick={() => { setErr(""); setEditId(null); setForm(blank()); }}>+ Add</button>
          </div>
        </div>

        <div className="filters">
          <label>From date<input type="date" value={df} max={dt || undefined} onChange={(e) => setDf(e.target.value)} /></label>
          <label>To date<input type="date" value={dt} min={df || undefined} onChange={(e) => setDt(e.target.value)} /></label>
          {filtered && <button className="btn ghost" onClick={() => { setDf(""); setDt(""); }}>Clear</button>}
        </div>
        <div className="sum">Showing {shown.length} of {entries.length} entries · Total count: <b>{total}</b></div>

        <div className="scroll">
          <table className="rt">
            <thead>
              <tr><th>Date</th><th>ID</th><th>From</th><th>To</th><th>Missing</th><th>Undelivered</th><th className="num">Count</th><th className="num">Amount</th><th>Comment</th><th></th></tr>
            </thead>
            <tbody>
              {shown.map((e) => {
                const c = countOf(e);
                return (
                  <tr key={e.id}>
                    <td><D s={e.date} /></td>
                    <td>{e.ref}</td>
                    <td>{e.from_num}</td>
                    <td>{e.to_num}</td>
                    <td className="wrapc">{e.missing || "—"}</td>
                    <td className="wrapc">{e.undelivered || "—"}</td>
                    <td className="num">{c}</td>
                    <td className="num">{money(c * rate)}</td>
                    <td className="cmt">{e.comment || "—"}</td>
                    <td>
                      <span className="acell">
                        <button className="edit" title="Edit" onClick={() => openEdit(e)}>✏️</button>
                        <button className="del" title="Delete" onClick={() => setDelId(e.id)}>🗑️</button>
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!shown.length && (
                <tr><td colSpan={10} className="empty">
                  {entries.length ? "No entries in this date range." : "No data yet. Click Add or Upload Excel to create entries."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <Modal title={editId ? "Edit data" : "Add new data"} onClose={() => setForm(null)}>
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
          <div className="f"><label>Comment<input value={form.comment} onChange={set("comment")} placeholder="Optional note" /></label></div>
          <div className="err">{err}</div>
          <div className="acts">
            <button className="btn ghost" onClick={() => setForm(null)}>Cancel</button>
            <button className="btn" onClick={submit}>{editId ? "Save changes" : "Submit"}</button>
          </div>
        </Modal>
      )}

      {view && (
        <Modal title="View" wide onClose={() => setView(false)}>
          <p className="msg" style={{ marginBottom: 10 }}>Date range: <b>{rangeLabel}</b></p>
          <div className="scroll">
            <table style={{ minWidth: 0 }}>
              <thead><tr><th>Date</th><th>Numbers</th><th className="num">Count</th></tr></thead>
              <tbody>
                {shown.map((e) => (
                  <tr key={e.id}>
                    <td><D s={e.date} /></td>
                    <td>{rangeOf(e)}</td>
                    <td className="num">{countOf(e)}</td>
                  </tr>
                ))}
                {!shown.length && <tr><td colSpan={3} className="empty">No data in this range.</td></tr>}
              </tbody>
              <tfoot><tr><td colSpan={2}>Total count</td><td className="num">{total}</td></tr></tfoot>
            </table>
          </div>
          <div className="acts" style={{ marginTop: 12 }}><button className="btn" onClick={() => setView(false)}>Close</button></div>
        </Modal>
      )}

      {upload && <ExcelUpload onClose={() => setUpload(false)} onDone={() => { setUpload(false); reload(); }} />}

      {delId && (
        <Modal title="Delete this entry?" onClose={() => setDelId(null)}>
          <p className="msg">Are you sure? This can’t be undone.</p>
          <div className="acts">
            <button className="btn ghost" onClick={() => setDelId(null)}>Cancel</button>
            <button className="btn danger" onClick={del}>Delete</button>
          </div>
        </Modal>
      )}
    </Shell>
  );
}
