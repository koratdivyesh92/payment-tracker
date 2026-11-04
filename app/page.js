"use client";
import Shell from "../components/Shell";
import { supabase } from "../lib/supabase";
import { useData } from "../lib/useData";
import { addDays, countOf, fmt, money, periodStart } from "../lib/calc";

export default function Dashboard() {
  const { entries, paid, rate, anchor, reload } = useData();

  const map = {};
  entries.forEach((e) => {
    const k = periodStart(e.date, anchor);
    const c = countOf(e);
    map[k] = map[k] || { count: 0, amount: 0 };
    map[k].count += c;
    map[k].amount += c * rate;
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
        <div className="bar"><h2>Bi-weekly payments</h2></div>
        <div className="scroll">
          <table className="rt">
            <thead><tr><th>Date range</th><th className="num">Count</th><th className="num">Amount</th><th>Payment status</th></tr></thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k}>
                  <td data-label="Date range">{fmt(k)} – {fmt(addDays(k, 13))}</td>
                  <td data-label="Count" className="num">{map[k].count}</td>
                  <td data-label="Amount" className="num">{money(map[k].amount)}</td>
                  <td data-label="Status">
                    <button className={"badge " + (paid.has(k) ? "paid" : "pending")} onClick={() => toggle(k)}>
                      {paid.has(k) ? "Paid" : "Pending"}
                    </button>
                  </td>
                </tr>
              ))}
              {!keys.length && <tr><td colSpan={4} className="empty">No data yet. Add entries on the Reports page.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
