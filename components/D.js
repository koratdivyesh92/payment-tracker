import { fmt, fmtShort } from "../lib/calc";

// long date on large screens, compact date on phones (see globals.css)
export default function D({ s }) {
  return (
    <>
      <span className="dl">{fmt(s)}</span>
      <span className="ds">{fmtShort(s)}</span>
    </>
  );
}
