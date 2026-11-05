"use client";
import { useState } from "react";
import Shell from "../components/Shell";
import D from "../components/D";
import { supabase } from "../lib/supabase";
import { useData } from "../lib/useData";
import { addDays, countOf, money, periodStart } from "../lib/calc";

export default function Dashboard() {
  const { entries, paid, rate, anchor, reload } = useData();
  const [open, setOpen] = useState({});

  const map = {};
  entries.forEach((e) => {
    const k = periodStart(e.date, anchor);
    const c = countOf(e);
    map[k] = map[k] || { count: 0, amount: 0, items: [] };
    map[k].count += c;
    map[k].amount += c * rate;
    map[k].items.push(e);
  });
  const keys = Object.keys(map).sort().reverse();
  let earn = 0, paidAmt = 0;
  keys.forEach((k) => { earn += map[k].amount; if (paid.has(k)) paidAmt += map[k].amount; });

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
      <div className="panel">
        <div className="bar"><h2>Bi-weekly payments</h2><span className="hint">Tap a row to see its entries</span></div>
        <div className="scroll">
          <table className="zg">
            <thead><tr><th>Date range</th><th className="num">Count</th><th className="num">Amount</th><th>Status</th></tr></thead>
            {keys.map((k) => {
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
                        onClick={(ev) => { ev.stopPropagation(); toggle(k); }}
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
            {!keys.length && <tbody><tr><td colSpan={4} className="empty">No data yet. Add entries on the Reports page.</td></tr></tbody>}
          </table>
        </div>
      </div>
    </Shell>
  );
}
