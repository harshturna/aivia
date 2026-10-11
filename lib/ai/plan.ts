/**
 * Turns an assistant message into the parts a run renders (design §5.3): the plan the agent
 * wrote as numbered steps, each step's status, the outputs, and the notes.
 *
 * The agent is asked to open with its plan as a numbered list. The first text block that
 * holds such a list, before any tool call, is the plan (a list written after the tools, like
 * three taglines, is part of the answer); its numbered lines become steps and the rest of the text
 * becomes notes. Tool calls are matched to steps by order, which is how the agent works
 * through them; a plan with more steps than tool calls finishes its text-only steps when
 * the run finishes.
 */

export type StepStatus = "queued" | "running" | "done" | "failed";

export interface PlanStep {
  text: string;
  status: StepStatus;
}

/** The minimum of a UIMessage part this module reads. */
export interface PartLike {
  type: string;
  text?: string;
  state?: string;
}

const STEP = /^\s*(\d{1,2})[.)]\s+(.+?)\s*$/;
const PLAN_LABEL = /^\s*(?:\*\*)?(?:plan|steps)(?:\*\*)?\s*:?\s*(?:\*\*)?\s*$/i;

export function isToolPart(part: PartLike) {
  return part.type.startsWith("tool-") || part.type === "dynamic-tool";
}

/** Splits a block of text into its numbered lines and everything else. */
export function splitPlan(text: string): { steps: string[]; rest: string } {
  const lines = text.split("\n");
  const steps: string[] = [];
  const rest: string[] = [];
  let inList = false;
  let listEnded = false;
  for (const line of lines) {
    const m = line.match(STEP);
    if (m && !listEnded) {
      steps.push(m[2].replace(/\*\*/g, "").trim());
      inList = true;
      continue;
    }
    if (inList && line.trim() === "") {
      listEnded = true;
      continue;
    }
    if (!inList && PLAN_LABEL.test(line)) continue;
    if (inList && line.trim() !== "") listEnded = true;
    rest.push(line);
  }
  // A list of one is a sentence that starts with a number, not a plan.
  if (steps.length < 2) return { steps: [], rest: text };
  return { steps, rest: rest.join("\n").trim() };
}

export interface RunShape {
  steps: PlanStep[];
  /** Text that is not the plan, in order, already merged. */
  notes: string;
  done: number;
  /** A tool call failed, so the run did not do everything it planned. */
  failed: boolean;
}

/**
 * The plan and its statuses for one assistant message. `finished` is whether the run has
 * ended (the chat is idle and this is the last message, or it is an older one).
 */
export function readPlan(parts: PartLike[], finished: boolean): RunShape {
  let steps: string[] = [];
  const notes: string[] = [];
  let planFound = false;
  let text = "";
  const tools: PartLike[] = [];

  const flush = () => {
    if (!text) return;
    if (!planFound && tools.length === 0) {
      const split = splitPlan(text);
      if (split.steps.length) {
        planFound = true;
        steps = split.steps;
        if (split.rest) notes.push(split.rest);
        text = "";
        return;
      }
    }
    notes.push(text);
    text = "";
  };

  for (const part of parts) {
    if (part.type === "text") {
      text += part.text ?? "";
      continue;
    }
    // Only a tool call breaks the text: sources, step markers and reasoning sit between
    // fragments of one sentence when the answer cites the web.
    if (!isToolPart(part)) continue;
    flush();
    tools.push(part);
  }
  flush();

  const finishedTools = tools.filter(
    (t) => t.state === "output-available" || t.state === "output-error"
  );
  // an error, or a call the run ended without finishing (stopped), did not do its step
  const failedAt = new Set(
    tools
      .map((t, i) =>
        t.state === "output-error" ||
        (finished && t.state !== "output-available")
          ? i
          : -1
      )
      .filter((i) => i >= 0)
  );

  const status = (i: number): StepStatus => {
    if (failedAt.has(i)) return "failed";
    if (finished) return "done";
    if (i < finishedTools.length) return "done";
    if (i === finishedTools.length) return "running";
    return "queued";
  };

  const planSteps: PlanStep[] = steps.map((s, i) => ({
    text: s,
    status: status(i),
  }));

  return {
    steps: planSteps,
    // Chunks split by a tool call are separate thoughts: keep a paragraph between them.
    notes: notes
      .map((n) => n.trim())
      .filter(Boolean)
      .join("\n\n"),
    done: planSteps.filter((s) => s.status === "done").length,
    failed: failedAt.size > 0,
  };
}
