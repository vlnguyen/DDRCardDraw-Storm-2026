/** True if every character of `query` appears in `text`, in order (case-insensitive). */
export function fuzzySubsequenceMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const s = text.toLowerCase();
  let qi = 0;
  for (let si = 0; si < s.length && qi < q.length; si++) {
    if (s[si] === q[qi]) qi++;
  }
  return qi === q.length;
}
