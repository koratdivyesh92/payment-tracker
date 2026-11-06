"use client";

// Rows-per-page selector + previous/next. The parent slices its rows with `page` and `size`.
export default function Pagination({ total, page, size, onPage, onSize }) {
  const pages = Math.max(1, Math.ceil(total / size));
  const p = Math.min(page, pages);
  const from = total ? (p - 1) * size + 1 : 0;
  const to = Math.min(total, p * size);
  return (
    <div className="pager">
      <label className="rows">
        Rows per page
        <select value={size} onChange={(e) => onSize(Number(e.target.value))}>
          {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <span>{from}–{to} of {total}</span>
      <div className="pbtns">
        <button type="button" className="pbtn" disabled={p <= 1} onClick={() => onPage(p - 1)}>‹ Prev</button>
        <span>Page {p} of {pages}</span>
        <button type="button" className="pbtn" disabled={p >= pages} onClick={() => onPage(p + 1)}>Next ›</button>
      </div>
    </div>
  );
}
