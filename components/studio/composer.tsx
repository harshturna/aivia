"use client";

import {
  ArrowUp,
  ChevronDown,
  FileText,
  Paperclip,
  Square,
  X,
} from "lucide-react";
import {
  type ClipboardEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

/**
 * The composer (design §5.2): the one place a brief is written, on the landing page and in
 * the Studio. A glass surface, a textarea that grows, attachments above it, the mode pill
 * and that mode's parameters on the left, the cost and the send button on the right.
 */
export { type ComposerMode, MODES } from "./modes";

import { type ComposerMode, MODES } from "./modes";

export const ACCEPT =
  "image/*,application/pdf,text/plain,text/markdown,text/csv,.md,.txt,.csv";
const MAX_FILES = 4;
const MAX_BYTES = 10 * 1024 * 1024;

export interface ComposerProps {
  mode?: ComposerMode;
  onModeChange?: (mode: ComposerMode) => void;
  onSubmit: (text: string, mode: ComposerMode, files: File[]) => void;
  onStop?: () => void;
  busy?: boolean;
  /** Nothing can be sent (the allowance is spent); the field still shows. */
  disabled?: boolean;
  /** Fill the field from outside (an example chip, "reuse prompt"). */
  value?: string;
  onChange?: (text: string) => void;
  /** Show the attach control; the Studio owns the files so a page-wide drop can add them. */
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  /** The current mode's parameter pills. */
  params?: React.ReactNode;
  /** Hide the mode pill: a character chat has one mode. */
  showModes?: boolean;
  /** Override the mode's placeholder. */
  placeholder?: string;
  cost?: string;
  /** The last brief, recalled with ↑ in an empty field. */
  lastBrief?: string;
  autoFocus?: boolean;
  className?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

/** Keeps the files a composer accepts: the right types, at most four, at most 10 MB each. */
export function acceptFiles(current: File[], incoming: File[]) {
  const ok = incoming.filter(
    (f) =>
      f.size <= MAX_BYTES &&
      (f.type.startsWith("image/") ||
        f.type === "application/pdf" ||
        f.type.startsWith("text/") ||
        /\.(md|txt|csv)$/i.test(f.name))
  );
  return [...current, ...ok].slice(0, MAX_FILES);
}

export function Composer({
  mode = "auto",
  onModeChange,
  onSubmit,
  onStop,
  busy = false,
  disabled = false,
  value,
  onChange,
  files,
  onFilesChange,
  params,
  showModes = true,
  placeholder,
  cost,
  lastBrief,
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
  const fileInput = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const current = MODES.find((m) => m.id === mode) ?? MODES[0];
  const canAttach = files !== undefined && onFilesChange !== undefined;

  // biome-ignore lint/correctness/useExhaustiveDependencies: on mount only
  useEffect(() => {
    // Desktop only: on a phone, focus opens the keyboard over the page.
    if (autoFocus && window.matchMedia("(pointer: fine)").matches)
      ref.current?.focus();
  }, []);

  // Grow with the text, to a ceiling, then scroll.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [text, ref]);

  // Close the mode menu on an outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || busy || disabled) return;
    onSubmit(trimmed, mode, files ?? []);
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
    if (event.key === "ArrowUp" && !text && lastBrief) {
      event.preventDefault();
      setText(lastBrief);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!canAttach) return;
    const pasted = Array.from(event.clipboardData.files);
    if (!pasted.length) return;
    event.preventDefault();
    onFilesChange(acceptFiles(files, pasted));
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
      {canAttach && files.length > 0 && (
        <Attachments
          files={files}
          onRemove={(i) => onFilesChange(files.filter((_, j) => j !== i))}
        />
      )}
      <label htmlFor={`${menuId}-field`} className="sr-only">
        {placeholder ?? current.placeholder}
      </label>
      <textarea
        ref={ref}
        id={`${menuId}-field`}
        rows={1}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        placeholder={placeholder ?? current.placeholder}
        aria-keyshortcuts="/"
        className="block w-full resize-none bg-transparent px-1.5 py-1 text-[15px] leading-6 text-fg outline-none placeholder:text-mute"
      />
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {canAttach && (
          <>
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPT}
              multiple
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(event) => {
                onFilesChange(
                  acceptFiles(files, Array.from(event.target.files ?? []))
                );
                event.target.value = "";
              }}
            />
            <Pill
              aria-label="Attach an image or a document"
              title="Attach an image or a document"
              className="w-7 justify-center px-0"
              onClick={() => fileInput.current?.click()}
            >
              <Paperclip />
            </Pill>
          </>
        )}
        {showModes && (
          <div ref={menuRef} className="relative">
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
        )}
        {params}
        <div className="ml-auto flex items-center gap-3">
          {cost && (
            <span className="tabular text-[12px] text-mute">{cost}</span>
          )}
          {busy ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop"
              title="Stop (Esc)"
              className="grid size-8 place-items-center rounded-full bg-white text-black transition-transform active:scale-[.96]"
            >
              <Square className="size-3 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send"
              disabled={!text.trim() || disabled}
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

function Attachments({
  files,
  onRemove,
}: {
  files: File[];
  onRemove: (i: number) => void;
}) {
  const urls = useMemo(
    () =>
      files.map((f) =>
        f.type.startsWith("image/") ? URL.createObjectURL(f) : null
      ),
    [files]
  );
  useEffect(
    () => () => {
      for (const u of urls) if (u) URL.revokeObjectURL(u);
    },
    [urls]
  );
  return (
    <ul className="mb-2 flex flex-wrap gap-2 px-1">
      {files.map((file, i) => (
        <li
          key={`${file.name}-${file.size}-${file.lastModified}`}
          className="group relative"
        >
          {urls[i] ? (
            // biome-ignore lint/performance/noImgElement: an object URL thumbnail
            <img
              src={urls[i] ?? ""}
              alt={file.name}
              className="size-14 rounded-control object-cover"
            />
          ) : (
            <span className="flex h-14 max-w-[200px] items-center gap-2 rounded-control border border-border bg-surface px-3 text-[12px] text-fg-2">
              <FileText className="size-4 shrink-0" />
              <span className="truncate">{file.name}</span>
            </span>
          )}
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label={`Remove ${file.name}`}
            className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full border border-border bg-surface-3 text-fg opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <X className="size-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}
