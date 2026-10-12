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
  { keys: ["⌘", "⇧", "O"], label: "New project" },
  { keys: ["⌘", "B"], label: "Collapse or expand the sidebar (in Cut, split)" },
  { keys: ["⌘", "."], label: "Show or hide a project's media" },
  { keys: ["/"], label: "Write in the composer" },
  { keys: ["Enter"], label: "Send" },
  { keys: ["⇧", "Enter"], label: "New line" },
  { keys: ["↑"], label: "Bring back the last brief" },
  { keys: ["Esc"], label: "Stop a run, close a dialog" },
  { keys: ["?"], label: "Show these shortcuts" },
  { keys: ["Space"], label: "Cut: play or pause" },
  { keys: ["S"], label: "Cut: split at the playhead" },
  { keys: ["⌘", "Z"], label: "Cut: undo (⇧ to redo)" },
  { keys: ["←", "→"], label: "Cut: a frame back or on (⇧ a second)" },
  { keys: ["⌥", "←", "→"], label: "Cut: move the selected piece" },
  { keys: ["[", "]"], label: "Cut: trim the selected piece to the playhead" },
  { keys: ["Delete"], label: "Cut: remove the selected piece" },
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
