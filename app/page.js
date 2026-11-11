"use client";
import { useState } from "react";
import Shell from "../components/Shell";
import D from "../components/D";
import Modal from "../components/Modal";
import DateRange from "../components/DateRange";
import Pagination from "../components/Pagination";
import { supabase } from "../lib/supabase";
import { useData } from "../lib/useData";
import { addDays, countOf, fmt, money, periodStart } from "../lib/calc";

export default function Dashboard() {
  const { entries, paid, rate, anchor, reload } = useData();
  const [open, setOpen] = useState({});
  const [df, setDf] = useState("");
  const [dt, setDt] = useState("");
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [ask, setAsk] = useState(null);

  const build = (arr) => {
    const m = {};
    arr.forEach((e) => {
      const k = periodStart(e.date, anchor);
      const c = countOf(e);
      m[k] = m[k] || { count: 0, amount: 0, items: [] };
      m[k].count += c;
      m[k].amount += c * rate;
      m[k].items.push(e);
    });
    return m;
  };

  // payment cards always use all data
  const all = build(entries);
  let earn = 0, paidAmt = 0;
  Object.keys(all).forEach((k) => { earn += all[k].amount; if (paid.has(k)) paidAmt += all[k].amount; });

  // the table follows the date filter
  const filtered = !!(df || dt);
  const list = entries.filter((e) => (!df || e.date >= df) && (!dt || e.date <= dt));
  const map = build(list);
  const keys = Object.keys(map).sort().reverse();
  const pages = Math.max(1, Math.ceil(keys.length / size));
  const cur = Math.min(page, pages);
  const rows = keys.slice((cur - 1) * size, cur * size);

  async function toggle(k) {
    const r = paid.has(k)
      ? await supabase.from("paid_periods").delete().eq("start", k)
      : await supabase.from("paid_periods").insert({ start: k });
    if (r.error) alert(r.error.message);
    reload();
  }

  return (
    <Shell>
      <div className="cards">
        <div className="card g1"><small>Total earning</small><b>{money(earn)}</b></div>
        <div className="card g2"><small>Total paid</small><b>{money(paidAmt)}</b></div>
        <div className="card g3"><small>Total pending</small><b>{money(earn - paidAmt)}</b></div>
      </div>

      <div className="filters">
        <DateRange value={{ from: df, to: dt }} onChange={({ from, to }) => { setDf(from); setDt(to); setPage(1); }} />
      </div>
      {filtered && <div className="sum" style={{ textAlign: "right" }}>Showing {list.length} of {entries.length} entries in the selected dates</div>}

      <div className="panel">
        <div className="bar"><h2>Bi-weekly payments</h2><span className="hint">Tap a row to see its entries</span></div>
        <div className="scroll">
          <table className="zg">
            <thead><tr><th>Date range</th><th className="num">Count</th><th className="num">Amount</th><th>Status</th></tr></thead>
            {rows.map((k) => {
              const isOpen = !!open[k];
              return (
                <tbody key={k}>
                  <tr className="main" onClick={() => setOpen({ ...open, [k]: !isOpen })} aria-expanded={isOpen}>
                    <td><span className="chev">{isOpen ? "▾" : "▸"}</span> <D s={k} /> – <D s={addDays(k, 13)} /></td>
                    <td className="num">{map[k].count}</td>
                    <td className="num">{money(map[k].amount)}</td>
                    <td>
                      <button
                        className={"badge " + (paid.has(k) ? "paid" : "pending")}
                        onClick={(ev) => { ev.stopPropagation(); setAsk(k); }}
                      >
                        {paid.has(k) ? "Paid" : "Pending"}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="detail">
                      <td colSpan={4}>
                        <table className="sub">
                          <thead><tr><th>Date</th><th>ID</th><th className="num">Count</th><th className="num">Amount</th></tr></thead>
                          <tbody>
                            {map[k].items.map((e) => (
                              <tr key={e.id}>
                                <td><D s={e.date} /></td>
                                <td>{e.ref}</td>
                                <td className="num">{countOf(e)}</td>
                                <td className="num">{money(countOf(e) * rate)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </tbody>
              );
            })}
            {!keys.length && <tbody><tr><td colSpan={4} className="empty">{entries.length ? "No entries in this date range." : "No data yet. Add entries on the Reports page."}</td></tr></tbody>}
          </table>
        </div>
        {keys.length > 0 && <Pagination total={keys.length} page={cur} size={size} onPage={setPage} onSize={(n) => { setSize(n); setPage(1); }} />}
      </div>
      {ask && (
        <Modal title={paid.has(ask) ? "Mark as pending?" : "Mark as paid?"} onClose={() => setAsk(null)}>
          <p className="msg">
            Are you sure you want to mark <b>{fmt(ask)} – {fmt(addDays(ask, 13))}</b> ({money(all[ask]?.amount || 0)}) as{" "}
            <b>{paid.has(ask) ? "Pending" : "Paid"}</b>?
          </p>
          <div className="acts">
            <button className="btn ghost" onClick={() => setAsk(null)}>Cancel</button>
            <button className="btn" onClick={() => { const k = ask; setAsk(null); toggle(k); }}>Yes, confirm</button>
          </div>
        </Modal>
      )}
    </Shell>
  );
}
