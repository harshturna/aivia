/**
 * One plain line for a piece that failed (design §5.3). The raw error comes from the media
 * service and can carry status codes, request ids and vendor names; none of that helps the
 * person, so it never reaches the screen (TICKET-051).
 */
export function plainFailure(error?: string): string {
  const e = error ?? "";
  // our own cap on a run's pieces is already written for people
  if (/^One brief can make up to/.test(e)) return e;
  if (
    /flag|safety|nsfw|content.?polic|moderat|not allowed|inappropriate/i.test(e)
  )
    return "The safety filter blocked this one. Try wording it differently.";
  if (
    /\b(429|502|503|504)\b|busy|unavailable|overload|timed? ?out|timeout|rate.?limit|ECONN|fetch failed|network/i.test(
      e
    )
  )
    return "The service was busy. Try again in a moment.";
  if (/returned no/i.test(e)) return "It came back empty. Try again.";
  return "Something went wrong making it. Try again.";
}
