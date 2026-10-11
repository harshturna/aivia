"use client";

import { ArrowUp, ChevronDown, Paperclip, Square } from "lucide-react";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

/**
 * The composer (design §5.2): the one place a brief is written, on the landing page and in
 * the Studio. A glass surface, a textarea that grows, the mode pill and that mode's
 * parameters on the left, the cost and the send button on the right.
 *
 * This is the shape; the Studio ticket adds attachments, parameter pills per mode, slash
 * commands and the stop state. The landing uses it in Auto mode and hands the text on.
 */
export type ComposerMode = "auto" | "image" | "video" | "music" | "sound";

export const MODES: Array<{
  id: ComposerMode;
  label: string;
  hint: string;
  placeholder: string;
}> = [
  {
    id: "auto",
    label: "Auto",
    hint: "Aivia plans the work and picks the tools",
    placeholder: "Describe what you want made",
  },
  {
    id: "image",
    label: "Image",
    hint: "One prompt, one to four images",
    placeholder: "Describe the image",
  },
  {
    id: "video",
    label: "Video",
    hint: "A short clip, six seconds and up",
    placeholder: "Describe the scene and the motion",
  },
  {
    id: "music",
    label: "Music",
    hint: "A track with melody and rhythm",
    placeholder: "Describe the music",
  },
  {
    id: "sound",
    label: "Sound",
    hint: "A sound effect, no melody",
    placeholder: "Describe the sound",
  },
];

export interface ComposerProps {
  mode?: ComposerMode;
  onModeChange?: (mode: ComposerMode) => void;
  onSubmit: (text: string, mode: ComposerMode) => void;
  onStop?: () => void;
  busy?: boolean;
  /** Fill the field from outside (an example chip). */
  value?: string;
  onChange?: (text: string) => void;
  attachments?: boolean;
  cost?: string;
  autoFocus?: boolean;
  className?: string;
  /** Lets the parent focus the field (the `/` shortcut). */
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function Composer({
  mode = "auto",
  onModeChange,
  onSubmit,
  onStop,
  busy = false,
  value,
  onChange,
  attachments = false,
  cost,
  autoFocus = false,
  className,
  inputRef,
}: ComposerProps) {
  const [inner, setInner] = useState("");
  const text = value ?? inner;
  const setText = useCallback(
    (next: string) => {
      setInner(next);
      onChange?.(next);
    },
    [onChange]
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const localRef = useRef<HTMLTextAreaElement | null>(null);
  const ref = inputRef ?? localRef;
  const menuId = useId();
  const current = MODES.find((m) => m.id === mode) ?? MODES[0];

  // Focus on mount when asked (a new session, the `/` key); an effect rather than the
  // attribute so the field never steals focus on a page that only shows the composer.
  // biome-ignore lint/correctness/useExhaustiveDependencies: on mount only
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, []);

  // Grow with the text, to a ceiling, then scroll.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [text, ref]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    onSubmit(trimmed, mode);
    setText("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      send();
    }
    if (event.key === "Escape" && busy) onStop?.();
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
      className={cn(
        "glass relative w-full rounded-panel border border-border p-3 shadow-float transition-colors duration-150 focus-within:border-border-strong",
        className
      )}
    >
      <label htmlFor={`${menuId}-field`} className="sr-only">
        {current.placeholder}
      </label>
      <textarea
        ref={ref}
        id={`${menuId}-field`}
        rows={1}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={current.placeholder}
        disabled={busy}
        className="block w-full resize-none bg-transparent px-1.5 py-1 text-[15px] leading-6 text-fg outline-none placeholder:text-mute disabled:opacity-60"
      />
      <div className="mt-2 flex items-center gap-1.5">
        {attachments && (
          <Pill aria-label="Attach a file" className="w-7 justify-center px-0">
            <Paperclip />
          </Pill>
        )}
        <div className="relative">
          <Pill
            on
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {current.label}
            <ChevronDown className="opacity-70" />
          </Pill>
          {menuOpen && (
            <div
              id={menuId}
              role="menu"
              className="absolute bottom-full left-0 z-20 mb-2 w-64 rounded-media border border-border bg-surface-2 p-1 shadow-float animate-in fade-in-0 zoom-in-95 duration-150"
            >
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={m.id === mode}
                  onClick={() => {
                    onModeChange?.(m.id);
                    setMenuOpen(false);
                    ref.current?.focus();
                  }}
                  className={cn(
                    "flex w-full flex-col items-start rounded-control px-2.5 py-1.5 text-left transition-colors hover:bg-surface-3",
                    m.id === mode ? "text-fg" : "text-fg-2"
                  )}
                >
                  <span className="text-[13px] font-medium">{m.label}</span>
                  <span className="text-[12px] text-mute">{m.hint}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3">
          {cost && (
            <span className="tabular text-[12px] text-mute">{cost}</span>
          )}
          {busy ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop"
              className="grid size-8 place-items-center rounded-full bg-white text-black transition-transform active:scale-[.96]"
            >
              <Square className="size-3 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send"
              disabled={!text.trim()}
              className="grid size-8 place-items-center rounded-full bg-white text-black transition-[opacity,transform] duration-150 active:scale-[.96] disabled:opacity-30"
            >
              <ArrowUp className="size-4" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
