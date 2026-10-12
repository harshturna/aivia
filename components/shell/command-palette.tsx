"use client";

import {
  Image as ImageIcon,
  LayoutGrid,
  type LucideIcon,
  Music,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  Video,
  Volume2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { listLocalSessions } from "@/lib/guest-local";
import { projectTitle } from "@/lib/session-text";
import { isTyping, SHORTCUTS } from "@/lib/shortcuts";
import { cn } from "@/lib/utils";

/** Opens the palette from anywhere in the shell (the sidebar's Search item). */
export const PaletteContext = createContext<() => void>(() => {});
export const usePalette = () => useContext(PaletteContext);
/** Opens the keyboard shortcuts from the account menu (TICKET-054). */
export const ShortcutsContext = createContext<() => void>(() => {});
export const useShortcuts = () => useContext(ShortcutsContext);

const KIND_LABEL: Record<string, string> = {
  image: "Image",
  video: "Video",
  music: "Music",
  sound: "Sound",
};

interface Item {
  id: string;
  label: string;
  hint?: React.ReactNode;
  icon: LucideIcon;
  group: string;
  run: () => void;
}

/**
 * The command palette (design §4, TICKET-013): ⌘K opens it with no animation; it searches
 * actions, your sessions and the prompts of what you made. ⌘⇧O starts a session; `?` shows
 * the shortcuts.
 */
export function CommandPalette({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((o) => !o);
      } else if (mod && event.shiftKey && event.key.toLowerCase() === "o") {
        event.preventDefault();
        router.push("/studio");
      } else if (event.key === "?" && !mod && !isTyping(event.target)) {
        event.preventDefault();
        setHelp(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <PaletteContext.Provider value={() => setOpen(true)}>
      <ShortcutsContext.Provider value={() => setHelp(true)}>
        {children}
      </ShortcutsContext.Provider>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[12%] max-w-[600px] translate-y-0 sm:top-[18%] gap-0 overflow-hidden p-0 duration-0 data-[state=open]:animate-none data-[state=closed]:animate-none [&>button:last-child]:hidden">
          <DialogTitle className="sr-only">Search and commands</DialogTitle>
          {open && <Palette onClose={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="max-w-[440px]">
          <DialogTitle className="text-[17px] font-medium">
            Keyboard shortcuts
          </DialogTitle>
          <ShortcutList />
        </DialogContent>
      </Dialog>
    </PaletteContext.Provider>
  );
}

export function ShortcutList() {
  return (
    <dl className="divide-y divide-border">
      {SHORTCUTS.map((s) => (
        <div
          key={s.label}
          className="flex items-center justify-between py-2.5 text-[13.5px]"
        >
          <dt className="text-fg-2">{s.label}</dt>
          <dd className="flex gap-1">
            {s.keys.map((k) => (
              <Kbd key={k}>{k}</Kbd>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [sessions, setSessions] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [assets, setAssets] = useState<
    Array<{ id: string; prompt: string; kind: string }>
  >([]);
  const list = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router]
  );

  // a guest's own sessions live in this browser: they are found here too (TICKET-054)
  const [local] = useState(() =>
    listLocalSessions().map((s) => ({ id: s.id, title: s.title }))
  );
  useEffect(() => {
    fetch("/api/sessions?limit=30")
      .then((r) => (r.ok ? r.json() : []))
      .then(setSessions)
      .catch(() => {});
  }, []);

  // What you made, searched by its prompt once there is something to search for.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setAssets([]);
      return;
    }
    const id = setTimeout(() => {
      fetch(`/api/assets?q=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : { items: [] }))
        .then((page) => setAssets(page.items.slice(0, 6)))
        .catch(() => {});
    }, 200);
    return () => clearTimeout(id);
  }, [query]);

  const items = useMemo<Item[]>(() => {
    const actions: Item[] = [
      {
        id: "new",
        label: "New project",
        hint: (
          <span className="flex gap-0.5">
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>O</Kbd>
          </span>
        ),
        icon: Plus,
        group: "Actions",
        run: () => go("/studio"),
      },
      {
        id: "img",
        label: "Make an image",
        icon: ImageIcon,
        group: "Actions",
        run: () => go("/studio?mode=image"),
      },
      {
        id: "vid",
        label: "Make a video",
        icon: Video,
        group: "Actions",
        run: () => go("/studio?mode=video"),
      },
      {
        id: "mus",
        label: "Make music",
        icon: Music,
        group: "Actions",
        run: () => go("/studio?mode=music"),
      },
      {
        id: "snd",
        label: "Make a sound",
        icon: Volume2,
        group: "Actions",
        run: () => go("/studio?mode=sound"),
      },
      {
        id: "lib",
        label: "Open the library",
        icon: LayoutGrid,
        group: "Go to",
        run: () => go("/library"),
      },
      {
        id: "chr",
        label: "Characters",
        icon: Users,
        group: "Go to",
        run: () => go("/characters"),
      },
      {
        id: "set",
        label: "Settings",
        icon: Settings,
        group: "Go to",
        run: () => go("/settings"),
      },
    ];
    const q = query.trim().toLowerCase();
    const match = (s: string) => !q || s.toLowerCase().includes(q);
    return [
      ...actions.filter((a) => match(a.label)),
      ...local
        .filter((s) => match(s.title))
        .slice(0, q ? 5 : 3)
        .map((s) => ({
          id: `l-${s.id}`,
          label: projectTitle(s.title),
          icon: Sparkles,
          group: "On this device",
          run: () => go(`/p/${s.id}`),
        })),
      ...sessions
        .filter((s) => match(s.title))
        .slice(0, q ? 8 : 5)
        .map((s) => ({
          id: `s-${s.id}`,
          label: projectTitle(s.title),
          icon: Sparkles,
          group: "Projects",
          run: () => go(`/p/${s.id}`),
        })),
      ...assets.map((a) => ({
        id: `a-${a.id}`,
        label: a.prompt,
        hint: KIND_LABEL[a.kind] ?? a.kind,
        icon:
          a.kind === "image"
            ? ImageIcon
            : a.kind === "video"
              ? Video
              : a.kind === "music"
                ? Music
                : Volume2,
        group: "Made",
        run: () => go(`/library/a/${a.id}`),
      })),
    ];
  }, [query, sessions, local, assets, go]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    list.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      items[active]?.run();
    }
  };

  let lastGroup = "";
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2.5 border-b border-border px-4">
        <Search className="size-4 shrink-0 text-mute" />
        <input
          // biome-ignore lint/a11y/noAutofocus: the palette exists to be typed into
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search projects, what you made, or type a command…"
          aria-label="Search and commands"
          aria-controls="palette-list"
          aria-activedescendant={
            items[active] ? `palette-${items[active].id}` : undefined
          }
          role="combobox"
          aria-expanded
          autoComplete="off"
          className="h-12 w-full min-w-0 bg-transparent text-[15px] text-fg outline-none placeholder:text-mute"
        />
        <Kbd className="max-sm:hidden">Esc</Kbd>
        {/* a touch screen has no Esc: a word to tap instead (TICKET-054) */}
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-[13px] text-fg-2 transition-colors hover:text-fg sm:hidden"
        >
          Cancel
        </button>
      </div>
      <div
        ref={list}
        id="palette-list"
        role="listbox"
        aria-label="Results"
        className="max-h-[360px] overflow-y-auto p-1.5"
      >
        {items.length === 0 && (
          <p className="px-3 py-6 text-center text-[13px] text-mute">
            Nothing matches “{query.trim()}”. Try fewer words.
          </p>
        )}
        {items.map((item, i) => {
          const heading = item.group !== lastGroup ? item.group : null;
          lastGroup = item.group;
          return (
            <div key={item.id}>
              {heading && (
                <div className="px-2.5 pb-1 pt-2.5 text-[11.5px] font-medium text-mute">
                  {heading}
                </div>
              )}
              <div
                id={`palette-${item.id}`}
                role="option"
                aria-selected={i === active}
                data-index={i}
                tabIndex={-1}
                onMouseMove={() => setActive(i)}
                onClick={item.run}
                className={cn(
                  "flex h-9 cursor-default items-center gap-2.5 rounded-control px-2.5 text-[13.5px]",
                  i === active ? "bg-surface-3 text-fg" : "text-fg-2"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="min-w-0 truncate">{item.label}</span>
                {item.hint && (
                  <span className="ml-auto shrink-0 pl-2 text-[11.5px] text-mute">
                    {item.hint}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
