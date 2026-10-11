/**
 * Every keyboard shortcut in one list (design §4), read by the palette, the `?` sheet and
 * Settings. ⌘N is the browser's (a new window), so a new session is ⌘⇧O.
 */
export interface Shortcut {
  keys: string[];
  label: string;
}

export const SHORTCUTS: Shortcut[] = [
  { keys: ["⌘", "K"], label: "Search and commands" },
  { keys: ["⌘", "⇧", "O"], label: "New session" },
  { keys: ["⌘", "B"], label: "Collapse or expand the sidebar" },
  { keys: ["/"], label: "Write in the composer" },
  { keys: ["Enter"], label: "Send" },
  { keys: ["⇧", "Enter"], label: "New line" },
  { keys: ["↑"], label: "Bring back the last brief" },
  { keys: ["Esc"], label: "Stop a run, close a dialog" },
  { keys: ["?"], label: "Show these shortcuts" },
];

/** True when a key event happened while typing, so single-key shortcuts stay out of the way. */
export function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return Boolean(
    el?.closest?.(
      "input, textarea, select, [contenteditable=true], [role=textbox]"
    )
  );
}
