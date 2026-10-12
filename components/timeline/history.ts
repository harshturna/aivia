/**
 * Cut's undo history (TICKET-071), as pure functions so its rules are tested: a commit that
 * changes nothing is not a step; typing into one card is one step, not one per letter; at most
 * a hundred steps are kept.
 */
export const HISTORY_LIMIT = 100;

export type History<T> = {
  stack: T[];
  at: number;
  /** What the top step was made by, when consecutive commits of it merge (a card's words). */
  key: string | null;
};

export function startHistory<T>(doc: T | null): History<T> {
  return doc
    ? { stack: [doc], at: 0, key: null }
    : { stack: [], at: -1, key: null };
}

/** The history with `next` committed; the same history object when nothing changed. */
export function commitTo<T>(h: History<T>, next: T, key?: string): History<T> {
  if (h.at >= 0 && h.stack[h.at] === next) return h;
  if (key && h.key === key && h.at > 0 && h.at === h.stack.length - 1)
    return { stack: [...h.stack.slice(0, h.at), next], at: h.at, key };
  const stack = [...h.stack.slice(0, h.at + 1), next].slice(-HISTORY_LIMIT);
  return { stack, at: stack.length - 1, key: key ?? null };
}

/** One step back or forward, or null at either end. */
export function stepIn<T>(
  h: History<T>,
  by: -1 | 1
): { history: History<T>; doc: T } | null {
  const at = h.at + by;
  if (at < 0 || at >= h.stack.length) return null;
  return { history: { ...h, at, key: null }, doc: h.stack[at] };
}
