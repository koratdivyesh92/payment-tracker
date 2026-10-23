export const money = (n) =>
  "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const day = (s) => Math.floor(Date.parse(s + "T00:00:00Z") / 86400000);
export const dayStr = (n) => new Date(n * 86400000).toISOString().slice(0, 10);
export const addDays = (s, n) => dayStr(day(s) + n);
export const fmt = (s) =>
  new Date(s + "T00:00:00Z").toLocaleDateString("en-CA", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });

// "4, 7, 10-12" -> 5 unique numbers
function countList(str) {
  const set = new Set();
  String(str || "").split(/[,\s]+/).forEach((t) => {
    const m = t.match(/^(\d+)-(\d+)$/);
    if (m) {
      const a = +m[1], b = +m[2];
      if (b >= a && b - a < 100000) for (let i = a; i <= b; i++) set.add(i);
    } else if (/^\d+$/.test(t)) set.add(+t);
  });
  return set.size;
}

// (to - from + 1) - missing - undelivered
export const countOf = (e) =>
  Math.max(0, e.to_num - e.from_num + 1 - countList(e.missing) - countList(e.undelivered));

// from-(from + count - 1), e.g. 2..50 minus 5 removed -> 2-45
export const rangeOf = (e) => {
  const c = countOf(e);
  return c > 0 ? `${e.from_num}-${e.from_num + c - 1}` : "—";
};

// start date (YYYY-MM-DD) of the 14-day pay period containing `date`
export const periodStart = (date, anchor) => {
  const a = day(anchor);
  return dayStr(a + Math.floor((day(date) - a) / 14) * 14);
};
