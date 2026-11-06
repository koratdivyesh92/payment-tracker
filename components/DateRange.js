"use client";
import { useEffect, useRef, useState } from "react";
import { fmt } from "../lib/calc";

const localToday = () => {
  const t = new Date();
  return new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate())).toISOString().slice(0, 10);
};
const monthOf = (s) => {
  const [y, m] = (s || localToday()).split("-");
  return { y: +y, m: +m - 1 };
};
const sort2 = (a, b) => (a <= b ? [a, b] : [b, a]);
const label = (from, to) => (!from ? "Select date range" : from === to ? fmt(from) : `${fmt(from)} – ${fmt(to)}`);
const DOW = ["S", "M", "T", "W", "T", "F", "S"];

// One box + calendar popup. Click and drag across days, or click a start day then an end day.
export default function DateRange({ value, onChange }) {
  const { from, to } = value;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => monthOf(from));
  const [anchor, setAnchorS] = useState(null);
  const [hover, setHoverS] = useState(null);
  const wrap = useRef(null);
  const r = useRef({ anchor: null, hover: null, down: null, before: null, moved: false, dragging: false });
  const cb = useRef(onChange);
  cb.current = onChange;

  const setAnchor = (v) => { r.current.anchor = v; setAnchorS(v); };
  const setHover = (v) => { r.current.hover = v; setHoverS(v); };
  const close = () => { r.current.dragging = false; setOpen(false); setAnchor(null); setHover(null); };
  const commit = (a, b) => { const [x, y] = sort2(a, b); cb.current({ from: x, to: y }); close(); };

  useEffect(() => {
    if (!open) return;
    const up = () => {
      const s = r.current;
      if (!s.dragging) return;
      s.dragging = false;
      const end = s.hover || s.down;
      if (s.before) commit(s.before, end);       // second click picks the end date
      else if (s.moved) commit(s.down, end);     // drag finished
      else setHover(null);                       // first click: now pick the end date
    };
    const outside = (e) => { if (wrap.current && !wrap.current.contains(e.target)) close(); };
    window.addEventListener("pointerup", up);
    document.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);

  const onDown = (d, e) => {
    e.preventDefault();
    const s = r.current;
    s.dragging = true; s.moved = false; s.down = d; s.before = s.anchor;
    if (!s.anchor) setAnchor(d);
    setHover(d);
  };
  const onMove = (e) => {
    const s = r.current;
    if (!s.dragging && !s.anchor) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const hit = el && el.closest ? el.closest("[data-d]") : null;
    const d = hit ? hit.getAttribute("data-d") : null;
    if (!d || d === s.hover) return;
    setHover(d);
    if (s.dragging && d !== s.down) s.moved = true;
  };

  const openPicker = () => { setView(monthOf(from)); setAnchor(null); setHover(null); setOpen(true); };
  const go = (n) => setView(({ y, m }) => {
    const t = new Date(Date.UTC(y, m + n, 1));
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() };
  });

  const first = new Date(Date.UTC(view.y, view.m, 1));
  const lead = first.getUTCDay();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const t = new Date(Date.UTC(view.y, view.m, 1 - lead + i));
    return { d: t.toISOString().slice(0, 10), n: t.getUTCDate(), out: t.getUTCMonth() !== view.m };
  });
  const title = first.toLocaleDateString("en-CA", { month: "long", year: "numeric", timeZone: "UTC" });
  const [lo, hi] = anchor ? sort2(anchor, hover || anchor) : from && to ? [from, to] : [null, null];
  const today = localToday();

  return (
    <div className="dr" ref={wrap}>
      <div className="drbox">
        <button type="button" className="drmain" onClick={() => (open ? close() : openPicker())}>
          <span>📅</span>
          <span className={from ? "" : "ph"}>{label(from, to)}</span>
        </button>
        {from && (
          <button type="button" className="drx" title="Clear" onClick={() => { cb.current({ from: "", to: "" }); close(); }}>✕</button>
        )}
      </div>
      {open && (
        <div className="drpop">
          <div className="drnav">
            <button type="button" onClick={() => go(-1)} aria-label="Previous month">‹</button>
            <b>{title}</b>
            <button type="button" onClick={() => go(1)} aria-label="Next month">›</button>
          </div>
          <div className="drgrid dow">{DOW.map((x, i) => <span key={i}>{x}</span>)}</div>
          <div className="drgrid days" onPointerMove={onMove}>
            {cells.map((c) => {
              const inR = lo && c.d >= lo && c.d <= hi;
              const edge = lo && (c.d === lo || c.d === hi);
              return (
                <button
                  type="button" key={c.d} data-d={c.d}
                  className={"day" + (c.out ? " out" : "") + (inR ? " in" : "") + (edge ? " edge" : "") + (c.d === today ? " today" : "")}
                  onPointerDown={(e) => onDown(c.d, e)}
                >
                  {c.n}
                </button>
              );
            })}
          </div>
          <div className="drfoot hint">Click and drag across days, or click a start day then an end day</div>
        </div>
      )}
    </div>
  );
}
