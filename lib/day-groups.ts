/** Day grouping with no database, safe for the client (TICKET-008). */
/**
 * Groups rows by the day they were made, newest day first, labelled "Today", "Yesterday"
 * or the date, in the viewer's time zone (design §6).
 */
export function groupByDay<T extends { createdAt: Date }>(
  rows: T[],
  now = new Date(),
  timeZone?: string
): Array<{ label: string; day: string; items: T[] }> {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dayOf = (d: Date) => fmt.format(d);
  const today = dayOf(now);
  const yesterday = dayOf(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const label = (day: string) =>
    day === today
      ? "Today"
      : day === yesterday
        ? "Yesterday"
        : new Intl.DateTimeFormat("en-GB", {
            timeZone,
            day: "numeric",
            month: "long",
            ...(day.slice(0, 4) !== today.slice(0, 4)
              ? { year: "numeric" }
              : {}),
          }).format(new Date(`${day}T12:00:00Z`));

  const groups: Array<{ label: string; day: string; items: T[] }> = [];
  for (const row of rows) {
    const day = dayOf(row.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(row);
    else groups.push({ label: label(day), day, items: [row] });
  }
  return groups;
}
