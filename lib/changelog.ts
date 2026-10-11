/**
 * What changed, newest first (design §11). Every ticket that changes what a user can do
 * adds a line; the landing page shows the latest five.
 */
export type ChangelogEntry = { date: string; text: string };

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-10-10",
    text: "A new look, built around the things you make.",
  },
  {
    date: "2026-07-21",
    text: "Video clips cost a fifth of what they did, music a fifteenth.",
  },
  { date: "2026-07-21", text: "Sound effects, as their own mode." },
  {
    date: "2026-07-20",
    text: "The Studio: one brief, a plan, and whatever tools it takes, with web search.",
  },
  {
    date: "2026-07-19",
    text: "Ask questions about a PDF or text file you attach.",
  },
  { date: "2026-07-18", text: "Image, video and music on faster models." },
];

export function formatChangelogDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
