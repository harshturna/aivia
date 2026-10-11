import { type RefObject, useRef } from "react";

type Opener = RefObject<HTMLElement | null>;

/**
 * Focus goes back where it came from when a dialog or sheet closes (TICKET-045). Radix does
 * this only when the dialog has a Trigger; the controlled ones here (the Cut dialog, the
 * palette, the phone menu) open from code. `OpenerCapture` renders inside the content, which
 * mounts only while open, and reads the opener before a field inside can take focus.
 */
export function useReturnFocus(handlers: {
  onCloseAutoFocus?: (event: Event) => void;
}) {
  const opener = useRef<HTMLElement | null>(null);
  return {
    opener,
    onCloseAutoFocus: (event: Event) => {
      handlers.onCloseAutoFocus?.(event);
      const el = opener.current;
      opener.current = null;
      if (event.defaultPrevented || !el?.isConnected) return;
      event.preventDefault();
      el.focus();
    },
  };
}

export function OpenerCapture({ into }: { into: Opener }) {
  const read = useRef(false);
  if (!read.current && typeof document !== "undefined") {
    read.current = true;
    const active = document.activeElement;
    into.current =
      active instanceof HTMLElement && active !== document.body ? active : null;
  }
  return null;
}
