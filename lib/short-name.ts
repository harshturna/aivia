/**
 * A piece's short name, from the prompt that made it (TICKET-077): what a person would call it,
 * not the brief a model was given. "A tall waterfall pouring into an emerald pool…" is "Tall
 * waterfall"; "A vertical poster: one colossal ancient tree alone on a hill…" is "Colossal
 * ancient tree". Pure, so the timeline, the storyboard, the editor and the tray agree.
 */
const STOP = new Set([
  "in",
  "into",
  "on",
  "onto",
  "over",
  "above",
  "under",
  "below",
  "with",
  "at",
  "from",
  "through",
  "across",
  "behind",
  "beside",
  "near",
  "against",
  "alone",
  "while",
  "as",
  "for",
  "beneath",
  "among",
  "toward",
  "towards",
  "under",
  "around",
  "inside",
  "during",
]);
const ARTICLES = new Set(["a", "an", "the", "one"]);
const FRAMING =
  /^(?:(?:a|an|the)\s+)?(?:(?:macro|close-up|wide|aerial|vertical|square|cinematic|storybook)\s+)*(?:photo(?:graph)?|illustration|painting|portrait|poster|shot|still|render|image|picture|drawing)\s+(?:in\s+[\w-]+\s+)?(?:of\s+)?/i;
const MAX_WORDS = 4;

export function shortName(prompt: string, fallback = "Untitled"): string {
  let text = prompt.trim();
  if (!text) return fallback;
  // "A vertical poster: one colossal tree…": the subject is after the colon
  const colon = text.indexOf(":");
  if (colon > 0 && colon < 60 && text.length - colon > 8)
    text = text.slice(colon + 1);
  // the first clause only
  text = text.split(/[,;.()—–]/)[0].trim();
  text = text.replace(FRAMING, "");
  const words = text.split(/\s+/).filter(Boolean);
  const kept: string[] = [];
  for (const [i, word] of words.entries()) {
    const w = word.toLowerCase();
    // stop where the subject ends: a preposition or a verb in -ing, once there is a subject
    if (kept.length >= 2 && (STOP.has(w) || (/ing$/.test(w) && w.length > 4)))
      break;
    if (i === 0 && ARTICLES.has(w)) continue;
    kept.push(word);
    if (kept.length >= MAX_WORDS) break;
  }
  while (
    kept.length > 1 &&
    /^(of|and|a|an|the|with)$/i.test(kept[kept.length - 1])
  )
    kept.pop();
  const name = kept.join(" ");
  if (!name) return fallback;
  return name.charAt(0).toUpperCase() + name.slice(1);
}
