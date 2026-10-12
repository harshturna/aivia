import { describe, expect, it } from "vitest";
import { commitTo, HISTORY_LIMIT, startHistory, stepIn } from "./history";

const doc = (n: number) => ({ n });

describe("the undo history", () => {
  it("drops a commit that changes nothing", () => {
    const a = doc(1);
    const h = startHistory(a);
    expect(commitTo(h, a)).toBe(h);
  });

  it("makes typing into one card one step", () => {
    let h = startHistory(doc(0));
    h = commitTo(h, doc(1), "text:c1");
    h = commitTo(h, doc(2), "text:c1");
    h = commitTo(h, doc(3), "text:c1");
    expect(h.stack.map((d) => d.n)).toEqual([0, 3]);
    // another card, or any other change, is a step of its own
    h = commitTo(h, doc(4), "text:c2");
    h = commitTo(h, doc(5));
    expect(h.stack.map((d) => d.n)).toEqual([0, 3, 4, 5]);
  });

  it("does not merge into the first state, nor after an undo", () => {
    let h = startHistory(doc(0));
    h = commitTo(h, doc(1), "k");
    const back = stepIn(h, -1);
    expect(back?.doc.n).toBe(0);
    h = commitTo(back?.history ?? h, doc(2), "k");
    expect(h.stack.map((d) => d.n)).toEqual([0, 2]);
  });

  it("steps back and forward, and keeps a hundred", () => {
    let h = startHistory(doc(0));
    for (let i = 1; i <= HISTORY_LIMIT + 20; i++) h = commitTo(h, doc(i));
    expect(h.stack).toHaveLength(HISTORY_LIMIT);
    expect(stepIn(h, 1)).toBeNull();
    expect(stepIn(h, -1)?.doc.n).toBe(HISTORY_LIMIT + 19);
    expect(stepIn(startHistory(doc(0)), -1)).toBeNull();
  });
});
