export function timeOf(ts: string) {
  return ts.slice(11, 16);
}

export function dateOf(ts: string) {
  return ts.slice(0, 10);
}

export function fullTs(ts: string) {
  return ts;
}

export function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function shortHash(hash: string, head = 4, tail = 4) {
  if (hash.length <= head + tail) return hash;
  return `${hash.slice(0, head)}...${hash.slice(-tail)}`;
}

export function minutesBetween(a: string, b: string) {
  const toMin = (t: string) => Number(t.slice(11, 13)) * 60 + Number(t.slice(14, 16));
  return Math.abs(toMin(b) - toMin(a));
}
