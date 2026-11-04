"use client";
import { useState } from "react";
import Modal from "./Modal";
import { supabase } from "../lib/supabase";

const toDate = (v) => {
  if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10);
  const s = String(v ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};
const toInt = (v) => {
  const s = String(v ?? "").trim();
  return s !== "" && Number.isInteger(Number(s)) ? Number(s) : null;
};
const toText = (v) => String(v ?? "").trim();

async function downloadTemplate() {
  const { default: writeXlsxFile } = await import("write-excel-file");
  const header = ["Date", "ID", "From", "To", "Missing", "Undelivered"].map((value) => ({ value, fontWeight: "bold" }));
  await writeXlsxFile([header], {
    columns: [{ width: 14 }, { width: 12 }, { width: 10 }, { width: 10 }, { width: 24 }, { width: 24 }],
    fileName: "payment-data-template.xlsx",
  });
}

async function parse(file) {
  const { default: readXlsxFile } = await import("read-excel-file");
  const rows = await readXlsxFile(file);
  if (!rows.length) throw new Error("The sheet is empty.");
  const head = rows[0].map((h) => String(h ?? "").trim().toLowerCase());
  const idx = {};
  ["date", "id", "from", "to", "missing", "undelivered"].forEach((n) => (idx[n] = head.indexOf(n)));
  const absent = ["date", "id", "from", "to"].filter((n) => idx[n] < 0);
  if (absent.length) throw new Error("Missing column(s): " + absent.join(", ") + ". Check the header row.");

  const ok = [], errors = [];
  rows.slice(1).forEach((r, i) => {
    if (r.every((c) => c === null || c === "")) return;
    const line = i + 2;
    const date = toDate(r[idx.date]), ref = toText(r[idx.id]);
    const a = toInt(r[idx.from]), b = toInt(r[idx.to]);
    if (!date) return errors.push(`Row ${line}: Date must be a date or YYYY-MM-DD`);
    if (!ref) return errors.push(`Row ${line}: ID is empty`);
    if (a === null || b === null) return errors.push(`Row ${line}: From and To must be whole numbers`);
    if (b < a) return errors.push(`Row ${line}: To is less than From`);
    ok.push({
      date, ref, from_num: a, to_num: b,
      missing: idx.missing >= 0 ? toText(r[idx.missing]) : "",
      undelivered: idx.undelivered >= 0 ? toText(r[idx.undelivered]) : "",
    });
  });
  return { ok, errors };
}

export default function ExcelUpload({ onClose, onDone }) {
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function pick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(""); setRes(null);
    try { setRes(await parse(f)); }
    catch (x) { setErr(x.message || "Could not read this file. Please use an .xlsx file."); }
  }

  async function doImport() {
    setBusy(true);
    const { error } = await supabase.from("entries").insert(res.ok);
    setBusy(false);
    if (error) return setErr(error.message);
    onDone();
  }

  return (
    <Modal title="Upload Excel data" wide onClose={onClose}>
      <p className="msg">Use an <b>.xlsx</b> file with this header row in the first sheet:</p>
      <div className="scroll">
        <table style={{ minWidth: 0 }}>
          <thead><tr><th>Date</th><th>ID</th><th>From</th><th>To</th><th>Missing</th><th>Undelivered</th></tr></thead>
          <tbody>
            <tr><td>2026-11-02</td><td>A101</td><td>2</td><td>50</td><td>2, 3, 15</td><td>23, 45</td></tr>
            <tr><td>2026-11-03</td><td>A102</td><td>51</td><td>90</td><td></td><td></td></tr>
          </tbody>
        </table>
      </div>
      <p className="hint">Missing and Undelivered are optional (comma separated, ranges like 10-12 work).</p>
      <p><button type="button" className="link" onClick={() => downloadTemplate().catch(() => setErr("Could not create the template."))}>Download template</button></p>
      <div className="f"><input type="file" accept=".xlsx" onChange={pick} /></div>
      {res && (
        <div className="f">
          <b>{res.ok.length}</b> row(s) ready to import{res.errors.length > 0 && <>, <b className="bad">{res.errors.length}</b> with problems (skipped)</>}.
          {res.errors.length > 0 && (
            <ul className="errs">{res.errors.slice(0, 6).map((m) => <li key={m}>{m}</li>)}{res.errors.length > 6 && <li>…and {res.errors.length - 6} more</li>}</ul>
          )}
        </div>
      )}
      <div className="err">{err}</div>
      <div className="acts">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn" disabled={!res || !res.ok.length || busy} onClick={doImport}>
          {busy ? "Importing…" : res?.ok.length ? `Import ${res.ok.length} rows` : "Import"}
        </button>
      </div>
    </Modal>
  );
}
