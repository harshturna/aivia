/**
 * Merge runs of adjacent text parts into one block, leaving everything else in
 * place.
 *
 * Anthropic's server-side web search cuts the answer into a separate text part
 * at every citation boundary, so a single sentence arrives as several parts:
 * the cited span, then the trailing ".", then the next connective. Rendering
 * each through its own <Markdown> gave every fragment its own <p>, which is
 * why answers came out with stray full stops on their own lines.
 *
 * Non-text parts still act as boundaries, so a tool call or a plan block
 * appears exactly where it happened in the run.
 */
export type Grouped<T> =
  | { kind: "text"; text: string }
  | { kind: "part"; part: T };

export function groupTextParts<T extends { type: string }>(
  parts: T[]
): Grouped<T>[] {
  const groups: Grouped<T>[] = [];

  for (const part of parts) {
    if (part.type === "text") {
      const previous = groups[groups.length - 1];
      const text = (part as unknown as { text: string }).text ?? "";
      if (previous?.kind === "text") {
        previous.text += text;
      } else {
        groups.push({ kind: "text", text });
      }
      continue;
    }
    groups.push({ kind: "part", part });
  }

  return groups;
}
