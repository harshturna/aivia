import { describe, expect, it } from "vitest";
import { readPlan, splitPlan } from "./plan";

describe("splitPlan", () => {
  it("takes the numbered list and keeps the rest", () => {
    const { steps, rest } = splitPlan(
      "Plan:\n1. Generate the poster, 3:4\n2. Compose 30 s of lo-fi\n\nThen I will write the taglines."
    );
    expect(steps).toEqual([
      "Generate the poster, 3:4",
      "Compose 30 s of lo-fi",
    ]);
    expect(rest).toBe("Then I will write the taglines.");
  });

  it("accepts 1) and bold markers", () => {
    expect(
      splitPlan("1) **Search** for references\n2) Make the image").steps
    ).toEqual(["Search for references", "Make the image"]);
  });

  it("does not treat one numbered line as a plan", () => {
    const text = "1. That is the only thing I need to say.";
    expect(splitPlan(text)).toEqual({ steps: [], rest: text });
  });

  it("stops the list at the first prose line", () => {
    const { steps, rest } = splitPlan(
      "1. A\n2. B\nDone planning.\n3. Not a step"
    );
    expect(steps).toEqual(["A", "B"]);
    expect(rest).toBe("Done planning.\n3. Not a step");
  });
});

describe("readPlan", () => {
  const plan = {
    type: "text",
    text: "1. Make the poster\n2. Make the clip\n3. Write taglines\n",
  };
  const tool = (state: string) => ({ type: "tool-generate_image", state });

  it("marks steps by the tool calls that have finished", () => {
    const r = readPlan(
      [plan, tool("output-available"), tool("input-available")],
      false
    );
    expect(r.steps.map((s) => s.status)).toEqual(["done", "running", "queued"]);
    expect(r.done).toBe(1);
  });

  it("finishes every step when the run has ended", () => {
    const r = readPlan(
      [plan, tool("output-available"), { type: "text", text: "Taglines: …" }],
      true
    );
    expect(r.steps.map((s) => s.status)).toEqual(["done", "done", "done"]);
    expect(r.notes).toBe("Taglines: …");
  });

  it("shows a failed tool on its step", () => {
    const r = readPlan([plan, tool("output-error")], true);
    expect(r.steps[0].status).toBe("failed");
  });

  it("has no steps and keeps all the text when there is no plan", () => {
    const r = readPlan([{ type: "text", text: "Here is a poem." }], true);
    expect(r.steps).toEqual([]);
    expect(r.notes).toBe("Here is a poem.");
  });

  it("merges text fragments split by citations before parsing", () => {
    const r = readPlan(
      [
        { type: "text", text: "1. Search\n" },
        { type: "text", text: "2. Answer\n" },
      ],
      false
    );
    expect(r.steps.map((s) => s.text)).toEqual(["Search", "Answer"]);
  });

  it("keeps a paragraph between notes split by a tool call, and reports a failure", () => {
    const r = readPlan(
      [
        { type: "text", text: "Let me retry that one." },
        tool("output-error"),
        { type: "text", text: "The video tool failed again." },
      ],
      true
    );
    expect(r.notes).toBe(
      "Let me retry that one.\n\nThe video tool failed again."
    );
    expect(r.failed).toBe(true);
  });

  it("does not break a sentence at a citation", () => {
    const r = readPlan(
      [
        { type: "text", text: "The market opens at six" },
        { type: "source-url" },
        { type: "text", text: ", every Friday." },
      ],
      true
    );
    expect(r.notes).toBe("The market opens at six, every Friday.");
  });

  it("keeps a numbered list written after the tools as the answer", () => {
    const taglines = {
      type: "text",
      text: "Three taglines:\n1. Older than memory\n2. Listen to the roots\n3. Still growing",
    };
    const r = readPlan(
      [
        { type: "text", text: "Making the poster first." },
        tool("output-available"),
        taglines,
      ],
      true
    );
    expect(r.steps).toEqual([]);
    expect(r.notes).toContain("2. Listen to the roots");
  });

  it("marks a call the run ended without finishing as stopped, not failed", () => {
    const r = readPlan(
      [plan, tool("output-available"), tool("input-available")],
      true
    );
    expect(r.steps.map((s) => s.status)).toEqual(["done", "stopped", "done"]);
    expect(r.stopped).toBe(true);
    expect(r.failed).toBe(false);
  });

  it("keeps a list as the answer when the run made nothing", () => {
    const answer = {
      type: "text",
      text: "Here are three taglines.\n\n1. Older than memory\n2. Listen to the roots\n3. Still growing",
    };
    const r = readPlan([answer], true);
    expect(r.steps).toEqual([]);
    expect(r.notes).toContain("3. Still growing");
  });

  it("keeps a list as the answer when only a search came before it", () => {
    const r = readPlan(
      [
        { type: "tool-web_search", state: "output-available" },
        { type: "text", text: "1. Lisbon\n2. Porto\n3. Faro" },
      ],
      true
    );
    expect(r.steps).toEqual([]);
    expect(r.notes).toContain("2. Porto");
  });

  it("does not take text with a list in the middle as a plan while running", () => {
    const r = readPlan(
      [{ type: "text", text: "Here are three names.\n\n1. Moss\n2. Fern" }],
      false
    );
    expect(r.steps).toEqual([]);
  });

  it("still reads a plan written after a web search", () => {
    const r = readPlan(
      [
        { type: "tool-web_search", state: "output-available" },
        plan,
        tool("output-available"),
      ],
      false
    );
    expect(r.steps.length).toBe(3);
  });
});
