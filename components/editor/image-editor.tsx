"use client";

import {
  ArrowLeft,
  Crop as CropIcon,
  Download,
  Eye,
  FlipHorizontal2,
  Plus,
  Redo2,
  RotateCw,
  SlidersHorizontal,
  Sparkles,
  Type,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type MediaHandlers,
  MediaHandlersProvider,
} from "@/components/media/actions";
import { MediaTray } from "@/components/media/tray";
import { ScreenHeader } from "@/components/shell/screen";
import { queueForCut } from "@/components/timeline/cut-view";
import {
  commitTo,
  type History,
  startHistory,
  stepIn,
} from "@/components/timeline/history";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { userProModal } from "@/hooks/useProModal";
import { downloadFile, fileNameFrom } from "@/lib/download";
import {
  EDIT_TOOLS,
  type EditInput,
  type EditTool,
  FILL_ASPECTS,
  type FillAspect,
  isReady,
} from "@/lib/edit";
import { getLocalSession } from "@/lib/guest-local";
import { fitCrop, turnCrop, turned, withStep } from "@/lib/image-edit/geometry";
import {
  type Adjust,
  baseOf,
  CROP_SHAPES,
  type CropShape,
  emptyEdit,
  type ImageEdit,
  isChanged,
  NO_ADJUST,
  type TextBox,
} from "@/lib/image-edit/schema";
import { type MediaItem, mediaByBrief, withVersions } from "@/lib/media";
import { uploadMedia } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { runTool } from "./ai";
import { CropBox } from "./crop-box";
import {
  type Box,
  type Fonts,
  keepsAlpha,
  loadImage,
  readFonts,
  renderEdit,
} from "./render";

/**
 * The image editor (D-005 §17.7, TICKET-067): one picture on the stage, the project's media
 * beside it. Crop, Adjust, Text and the AI tools are steps on the source, drawn by the same
 * render the save uses; Save keeps a new version in the project (the guest downloads it).
 */
type Tab = "crop" | "adjust" | "text" | "ai";
type Message = { id: string; role: string; parts: unknown[] };

const TABS: Array<{ id: Tab; label: string; icon: typeof CropIcon }> = [
  { id: "crop", label: "Crop", icon: CropIcon },
  { id: "adjust", label: "Adjust", icon: SlidersHorizontal },
  { id: "text", label: "Text", icon: Type },
  { id: "ai", label: "AI", icon: Sparkles },
];
const ADJUSTS: Array<{ key: keyof Adjust; label: string }> = [
  { key: "brightness", label: "Brightness" },
  { key: "contrast", label: "Contrast" },
  { key: "saturation", label: "Saturation" },
  { key: "warmth", label: "Warmth" },
];
/** The words' colours: the interface's own and the media tints (§17.7). */
const SWATCHES = [
  { name: "Paper", token: "--color-fg" },
  { name: "Ink", token: "--color-bg" },
  { name: "Sun", token: "--color-sun" },
  { name: "Bark", token: "--color-tint-bark" },
  { name: "Water", token: "--color-tint-water" },
  { name: "Fern", token: "--color-tint-fern" },
];
const PREVIEW_SIDE = 1600;

function readSwatches() {
  const css = getComputedStyle(document.documentElement);
  return SWATCHES.map((s) => {
    const raw = css.getPropertyValue(s.token).trim();
    return { name: s.name, hex: /^#[0-9a-f]{6}$/i.test(raw) ? raw : "#ffffff" };
  });
}

export function ImageEditor({
  projectId,
  title: initialTitle,
  isGuest,
  initialMessages,
  versions,
  source,
  initialDoc,
}: {
  projectId: string;
  title: string;
  isGuest: boolean;
  initialMessages: Message[] | null;
  versions: MediaItem[];
  source: { url: string; assetId?: string; prompt: string };
  /** A saved version's steps, reopened. */
  initialDoc: ImageEdit | null;
}) {
  const router = useRouter();
  const proModal = userProModal();
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const [title, setTitle] = useState(initialTitle);
  const [doc, setDoc] = useState<ImageEdit | null>(initialDoc);
  // the picture as it is now, for an AI step that lands later (TICKET-072)
  const docNow = useRef(doc);
  docNow.current = doc;
  // one history rule for Cut and the editor: no-op commits are not steps (TICKET-075)
  const [history, setHistoryState] = useState(() => startHistory(initialDoc));
  const historyNow = useRef(history);
  const setHistory = useCallback((h: History<ImageEdit>) => {
    historyNow.current = h;
    setHistoryState(h);
  }, []);
  const [failed, setFailed] = useState<string | null>(null);
  const [base, setBase] = useState<HTMLImageElement | null>(null);
  const [tab, setTab] = useState<Tab>("crop");
  const [selected, setSelected] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [dims, setDims] = useState({ width: 1, height: 1 });
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const [fonts, setFonts] = useState<Fonts | null>(null);
  const [swatches, setSwatches] = useState<
    Array<{ name: string; hex: string }>
  >([]);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "failed">(
    "idle"
  );
  const savedDoc = useRef<ImageEdit | null>(initialDoc);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // a guest's browser project: its runs and title live here
  useEffect(() => {
    if (!isGuest || initialMessages) return;
    const local = getLocalSession(projectId);
    setMessages((local?.messages ?? []) as unknown as Message[]);
    if (local?.title) setTitle(local.title);
  }, [isGuest, initialMessages, projectId]);

  // the theme's faces and colours, once their fonts are in
  useEffect(() => {
    const f = readFonts();
    setSwatches(readSwatches());
    void Promise.all([
      document.fonts.load(`500 48px ${f.display}`),
      document.fonts.load(`600 48px ${f.body}`),
    ])
      .catch(() => {})
      .then(() => setFonts(f));
  }, []);

  // the source, measured: a new edit starts from it
  useEffect(() => {
    if (initialDoc) return;
    let cancelled = false;
    loadImage(source.url)
      .then((img) => {
        if (cancelled) return;
        const first = emptyEdit({
          url: source.url,
          ...(source.assetId ? { assetId: source.assetId } : {}),
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        docNow.current = first;
        setDoc(first);
        setHistory(startHistory(first));
        savedDoc.current = first;
      })
      .catch(
        () =>
          !cancelled &&
          setFailed("This picture did not load. Go back and try again.")
      );
    return () => {
      cancelled = true;
    };
  }, [initialDoc, source.url, source.assetId, setHistory]);

  // the picture the steps apply to: the source, or the last AI result
  const baseUrl = doc ? baseOf(doc).url : null;
  useEffect(() => {
    if (!baseUrl) return;
    let cancelled = false;
    loadImage(baseUrl)
      .then((img) => !cancelled && setBase(img))
      .catch(
        () =>
          !cancelled &&
          setFailed("This picture did not load. Go back and try again.")
      );
    return () => {
      cancelled = true;
    };
  }, [baseUrl]);

  // the stage's room, so the picture and what sits on it share one box
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setStage({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // the preview, drawn by the save's own render, a frame at a time
  const cropping = tab === "crop";
  useEffect(() => {
    if (!doc || !base || !fonts || !canvas.current) return;
    const id = requestAnimationFrame(() => {
      if (!canvas.current) return;
      const r = renderEdit(doc, base, {
        canvas: canvas.current,
        maxSide: PREVIEW_SIDE,
        fonts,
        crop: !cropping,
        words: !cropping,
      });
      setBoxes(r.boxes);
      setDims({ width: r.canvas.width, height: r.canvas.height });
    });
    return () => cancelAnimationFrame(id);
  }, [doc, base, fonts, cropping]);

  const fit = useMemo(() => {
    const s = Math.min(stage.width / dims.width, stage.height / dims.height);
    return Number.isFinite(s) && s > 0
      ? {
          width: Math.floor(dims.width * s),
          height: Math.floor(dims.height * s),
        }
      : { width: 0, height: 0 };
  }, [stage, dims]);

  // ── editing: every landed change is one undo step ───────────────────────────────────
  const change = useCallback(
    (next: ImageEdit, commit: boolean) => {
      docNow.current = next;
      setDoc(next);
      if (!commit) return;
      const h = historyNow.current;
      const after = commitTo(h, next);
      if (after !== h) setHistory(after);
    },
    [setHistory]
  );
  const step = useCallback(
    (by: -1 | 1) => {
      const r = stepIn(historyNow.current, by);
      if (!r) return;
      setHistory(r.history);
      docNow.current = r.doc;
      setDoc(r.doc);
    },
    [setHistory]
  );
  // ── AI: one run at a time, charged once; its result joins the picture as it is now ──────
  const [ai, setAi] = useState<AiRun>({ at: "idle" });
  const aiBusy = useRef(false);
  const runAi = useCallback(
    async (input: EditInput) => {
      const start = docNow.current;
      // set before anything awaits, so a second click cannot start a second paid run
      if (aiBusy.current || !start) return;
      aiBusy.current = true;
      setAi({ at: "working" });
      const r = await runTool(baseOf(start), input);
      aiBusy.current = false;
      if (!r.ok) {
        setAi(
          r.limit
            ? { at: "limit", who: r.limit }
            : { at: "failed", message: r.message }
        );
        return;
      }
      change(withStep(docNow.current ?? start, r.step), true);
      setAi({ at: "idle" });
    },
    [change]
  );
  // unsaved: different from what was last saved (or opened), and not just the opened picture
  const dirty = Boolean(doc && doc !== savedDoc.current && isChanged(doc));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const el = event.target as HTMLElement;
      if (el.closest("input, textarea, [contenteditable=true], [role=dialog]"))
        return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        step(event.shiftKey ? 1 : -1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  // leaving with changes not kept asks first
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // leaving inside the app with unsaved changes asks too (TICKET-075)
  const [leaving, setLeaving] = useState<string | null>(null);
  const leave = useCallback(
    (href: string) => (dirty ? setLeaving(href) : router.push(href)),
    [dirty, router]
  );

  const backHref = `/p/${projectId}`;
  const name = source.prompt.split(/\s+/).slice(0, 5).join(" ") || "image";

  // ── Save: a new version beside the original; the guest downloads it ────────────────────
  const save = async () => {
    if (!doc || !fonts) return;
    setSaving("saving");
    try {
      const full = await loadImage(baseOf(doc).url);
      const { canvas: out } = renderEdit(doc, full, { fonts, maxSide: 4096 });
      const alpha = keepsAlpha(doc);
      const blob = await new Promise<Blob | null>((r) =>
        out.toBlob(r, alpha ? "image/png" : "image/jpeg", 0.92)
      );
      if (!blob) throw new Error();
      if (isGuest) {
        const href = URL.createObjectURL(blob);
        await downloadFile(href, fileNameFrom(source.prompt, "edit"));
        setTimeout(() => URL.revokeObjectURL(href), 10_000);
        savedDoc.current = doc;
        setSaving("saved");
        return;
      }
      // the steps first: a version is never kept without them
      const made = await fetch("/api/edits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, kind: "image", title: name, doc }),
      });
      if (!made.ok) throw new Error();
      const edit = (await made.json()) as { id: string };
      const kept = async () => {
        const path = await uploadMedia(blob, alpha ? "png" : "jpg");
        return fetch("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path,
            title: `Edit of ${name}`,
            width: out.width,
            height: out.height,
            sessionId: projectId,
            parentAssetId: doc.source.assetId,
            editId: edit.id,
          }),
        });
      };
      const res = await kept().catch(() => null);
      if (!res?.ok) {
        // the picture did not land: its steps go too, so a retry leaves no orphan
        void fetch(`/api/edits/${edit.id}`, { method: "DELETE" });
        throw new Error();
      }
      savedDoc.current = doc;
      setSaving("saved");
      router.refresh();
    } catch {
      setSaving("failed");
    }
  };

  // ── the tray: the project's pieces, versions on top; an image opens here ──────────────
  const groups = useMemo(
    () => withVersions(versions, mediaByBrief(messages as never)),
    [messages, versions]
  );
  const openHere = useCallback(
    (item: MediaItem) => {
      if (item.kind !== "image") return;
      leave(
        `/p/${projectId}/edit?src=${encodeURIComponent(item.assetId ?? item.url)}`
      );
    },
    [leave, projectId]
  );
  const handlers = useMemo<MediaHandlers>(
    () => ({
      edit: openHere,
      addToCut: (item) => {
        queueForCut(projectId, item);
        router.push(`/p/${projectId}/cut`);
      },
    }),
    [openHere, projectId, router]
  );

  const turnedSize =
    doc && base
      ? turned(
          { width: base.naturalWidth, height: base.naturalHeight },
          doc.rotate
        )
      : null;
  const selectedText = doc?.texts.find((t) => t.id === selected) ?? null;

  return (
    <MediaHandlersProvider value={handlers}>
      <div className="relative flex h-dvh min-h-0">
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden">
          <ScreenHeader
            title={
              <span className="flex min-w-0 items-center gap-2">
                <Link
                  href={backHref}
                  onClick={(event) => {
                    if (!dirty) return;
                    event.preventDefault();
                    setLeaving(backHref);
                  }}
                  aria-label={`Back to ${title}`}
                  className="grid size-8 shrink-0 place-items-center rounded-control text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  <ArrowLeft className="size-4" />
                </Link>
                <span className="truncate max-sm:hidden">Editing “{name}”</span>
                <span className="sm:hidden">Edit</span>
              </span>
            }
          >
            <span
              className="hidden whitespace-nowrap text-[12.5px] text-mute xl:inline"
              aria-live="polite"
            >
              {saving === "saving"
                ? isGuest
                  ? "Preparing…"
                  : "Saving…"
                : saving === "saved" && !dirty
                  ? isGuest
                    ? "Downloaded"
                    : "Saved to the project"
                  : ""}
            </span>
            {saving === "failed" && (
              <span
                role="alert"
                className="whitespace-nowrap text-[12.5px] text-fg-2"
              >
                Not saved. Try again.
              </span>
            )}
            <IconButton
              label="Undo (⌘Z)"
              disabled={history.at <= 0}
              onClick={() => step(-1)}
            >
              <Undo2 />
            </IconButton>
            <IconButton
              label="Redo (⇧⌘Z)"
              disabled={history.at >= history.stack.length - 1}
              onClick={() => step(1)}
            >
              <Redo2 />
            </IconButton>
            <Button asChild variant="ghost" size="sm" className="max-sm:hidden">
              <Link
                href={backHref}
                onClick={(event) => {
                  if (!dirty) return;
                  event.preventDefault();
                  setLeaving(backHref);
                }}
              >
                Cancel
              </Link>
            </Button>
            <Button
              size="sm"
              onClick={save}
              disabled={
                !doc || !fonts || saving === "saving" || !isChanged(doc)
              }
            >
              {isGuest ? (
                <>
                  <Download />
                  <span className="max-[400px]:sr-only">Download</span>
                </>
              ) : (
                "Save"
              )}
            </Button>
          </ScreenHeader>

          {/* the stage */}
          <div className="relative grid min-h-[min(46dvh,520px)] shrink-0 place-items-center bg-surface/40 p-4 lg:min-h-0 lg:flex-1">
            <div ref={stageRef} className="absolute inset-4" />
            {failed ? (
              <p role="alert" className="relative text-[13px] text-fg-2">
                {failed}
              </p>
            ) : !doc || !base ? (
              <p className="relative text-[13px] text-mute">
                Opening the picture…
              </p>
            ) : (
              <div
                className={cn("relative", comparing && "invisible")}
                style={{ width: fit.width, height: fit.height }}
              >
                <canvas
                  ref={canvas}
                  role="img"
                  aria-label={`The picture${cropping ? ", uncropped while cropping" : ""}`}
                  className={cn(
                    "block size-full rounded-media bg-bg shadow-float",
                    !doc && "opacity-0"
                  )}
                />
                {cropping && doc && turnedSize && (
                  <CropBox
                    crop={
                      doc.crop ?? {
                        shape: "free",
                        x: 0,
                        y: 0,
                        width: 1,
                        height: 1,
                      }
                    }
                    size={turnedSize}
                    onChange={(crop, commit) =>
                      change({ ...doc, crop }, commit)
                    }
                  />
                )}
                {tab === "text" && doc && (
                  <TextHandles
                    doc={doc}
                    boxes={boxes}
                    selected={selected}
                    onSelect={setSelected}
                    onChange={change}
                  />
                )}
              </div>
            )}
            {/* the original, held over the edit */}
            {comparing && doc && (
              // biome-ignore lint/performance/noImgElement: the source as it came, for comparing
              <img
                src={doc.source.url}
                alt="The original"
                className="absolute inset-4 size-[calc(100%-2rem)] object-contain"
              />
            )}
          </div>

          {/* the tools */}
          <div className="shrink-0 border-t border-border">
            <div className="flex items-center gap-1 px-3 pt-2 lg:px-6">
              <div
                role="tablist"
                aria-label="Tools"
                className="flex min-w-0 gap-1 overflow-x-auto"
                onKeyDown={(event) => {
                  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
                    return;
                  event.preventDefault();
                  const at = TABS.findIndex((t) => t.id === tab);
                  const next =
                    TABS[
                      (at +
                        (event.key === "ArrowRight" ? 1 : TABS.length - 1)) %
                        TABS.length
                    ];
                  setTab(next.id);
                  document.getElementById(`tab-${next.id}`)?.focus();
                }}
              >
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    id={`tab-${t.id}`}
                    aria-selected={tab === t.id}
                    tabIndex={tab === t.id ? 0 : -1}
                    aria-controls="tool-panel"
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "flex h-9 items-center gap-1.5 rounded-control px-3 text-[13px] font-medium transition-colors",
                      tab === t.id
                        ? "bg-surface-3 text-fg"
                        : "text-fg-2 hover:text-fg"
                    )}
                  >
                    <t.icon className="size-4" /> {t.label}
                  </button>
                ))}
              </div>
              {doc && (
                <button
                  type="button"
                  onPointerDown={() => setComparing(true)}
                  onPointerUp={() => setComparing(false)}
                  onPointerLeave={() => setComparing(false)}
                  onKeyDown={(e) =>
                    (e.key === " " || e.key === "Enter") && setComparing(true)
                  }
                  onKeyUp={() => setComparing(false)}
                  onBlur={() => setComparing(false)}
                  aria-label="Hold to compare"
                  className="ml-auto flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-control px-2.5 text-[13px] text-fg-2 transition-colors select-none hover:bg-surface-2 hover:text-fg"
                >
                  <Eye className="size-4" />
                  <span className="max-sm:hidden">Hold to compare</span>
                </button>
              )}
            </div>
            <div
              id="tool-panel"
              role="tabpanel"
              aria-labelledby={`tab-${tab}`}
              className="min-h-[124px] px-3 py-3 lg:px-6"
            >
              {doc && base && turnedSize && tab === "crop" && (
                <CropPanel doc={doc} size={turnedSize} onChange={change} />
              )}
              {doc && tab === "adjust" && (
                <AdjustPanel doc={doc} onChange={change} />
              )}
              {doc && tab === "text" && (
                <TextPanel
                  doc={doc}
                  selected={selectedText}
                  swatches={swatches}
                  onSelect={setSelected}
                  onChange={change}
                />
              )}
              {doc && tab === "ai" && (
                <AiPanel
                  doc={doc}
                  state={ai}
                  onRun={runAi}
                  onUpgrade={proModal.onOpen}
                />
              )}
            </div>
          </div>
        </div>

        <aside
          aria-label="Media"
          className="hidden h-dvh w-[300px] shrink-0 border-l border-border bg-bg lg:block"
        >
          <MediaTray
            groups={groups}
            onOpen={openHere}
            hint="Choose another image to edit it instead."
          />
        </aside>
      </div>
      <Dialog
        open={leaving !== null}
        onOpenChange={(open) => {
          if (!open) setLeaving(null);
        }}
      >
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Leave without saving?</DialogTitle>
          <p className="text-[13.5px] text-fg-2">
            The changes to this picture since it was last saved will be lost.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLeaving(null)}>
              Keep editing
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const href = leaving;
                setLeaving(null);
                // the leave is chosen: nothing more to warn about
                savedDoc.current = docNow.current;
                if (href) router.push(href);
              }}
            >
              Leave without saving
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MediaHandlersProvider>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-8 place-items-center rounded-control text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40 [&_svg]:size-4"
    >
      {children}
    </button>
  );
}

const rowButton =
  "flex h-8 items-center gap-1.5 rounded-control px-2.5 text-[13px] text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40";

function CropPanel({
  doc,
  size,
  onChange,
}: {
  doc: ImageEdit;
  size: { width: number; height: number };
  onChange: (doc: ImageEdit, commit: boolean) => void;
}) {
  const shape = doc.crop?.shape ?? "free";
  const label = (s: CropShape) => (s === "free" ? "Free" : s);
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div
        role="radiogroup"
        aria-label="Shape"
        className="flex flex-wrap gap-1.5"
      >
        {CROP_SHAPES.map((s) => (
          <Pill
            key={s}
            role="radio"
            aria-checked={shape === s}
            on={shape === s}
            onClick={() =>
              onChange(
                {
                  ...doc,
                  crop:
                    s === "free"
                      ? {
                          ...(doc.crop ?? fitCrop("free", size)),
                          shape: "free",
                        }
                      : fitCrop(s, size),
                },
                true
              )
            }
            className="h-8 px-3 text-[13px]"
          >
            {label(s)}
          </Pill>
        ))}
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          className={rowButton}
          onClick={() =>
            onChange(
              {
                ...doc,
                // a mirrored picture turns the other way under the hood, so it still turns clockwise
                rotate: ((doc.rotate + (doc.flip ? 270 : 90)) %
                  360) as ImageEdit["rotate"],
                crop: doc.crop ? turnCrop(doc.crop, "cw") : null,
              },
              true
            )
          }
        >
          <RotateCw className="size-4" /> Rotate
        </button>
        <button
          type="button"
          className={rowButton}
          onClick={() =>
            onChange(
              {
                ...doc,
                flip: !doc.flip,
                crop: doc.crop ? turnCrop(doc.crop, "flip") : null,
              },
              true
            )
          }
        >
          <FlipHorizontal2 className="size-4" /> Flip
        </button>
        <button
          type="button"
          className={rowButton}
          disabled={!doc.crop && doc.rotate === 0 && !doc.flip}
          onClick={() =>
            onChange({ ...doc, crop: null, rotate: 0, flip: false }, true)
          }
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function AdjustPanel({
  doc,
  onChange,
}: {
  doc: ImageEdit;
  onChange: (doc: ImageEdit, commit: boolean) => void;
}) {
  const changed = Object.values(doc.adjust).some((v) => v !== 0);
  return (
    <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
      {ADJUSTS.map(({ key, label }) => (
        <label key={key} className="grid gap-1 text-[13px]">
          <span className="flex justify-between text-fg-2">
            {label}
            <span className="tabular text-mute">
              {doc.adjust[key] > 0 ? `+${doc.adjust[key]}` : doc.adjust[key]}
            </span>
          </span>
          <input
            type="range"
            name={key}
            min={-100}
            max={100}
            step={1}
            value={doc.adjust[key]}
            onChange={(e) =>
              onChange(
                {
                  ...doc,
                  adjust: { ...doc.adjust, [key]: Number(e.target.value) },
                },
                false
              )
            }
            onPointerUp={() => onChange(doc, true)}
            onKeyUp={() => onChange(doc, true)}
            className="w-full accent-primary"
          />
        </label>
      ))}
      <button
        type="button"
        className={cn(rowButton, "justify-self-start")}
        disabled={!changed}
        onClick={() => onChange({ ...doc, adjust: { ...NO_ADJUST } }, true)}
      >
        Reset
      </button>
    </div>
  );
}

function TextPanel({
  doc,
  selected,
  swatches,
  onSelect,
  onChange,
}: {
  doc: ImageEdit;
  selected: TextBox | null;
  swatches: Array<{ name: string; hex: string }>;
  onSelect: (id: string | null) => void;
  onChange: (doc: ImageEdit, commit: boolean) => void;
}) {
  const set = (patch: Partial<TextBox>, commit = true) =>
    selected &&
    onChange(
      {
        ...doc,
        texts: doc.texts.map((t) =>
          t.id === selected.id ? { ...t, ...patch } : t
        ),
      },
      commit
    );
  const add = () => {
    let n = doc.texts.length + 1;
    while (doc.texts.some((t) => t.id === `words-${n}`)) n++;
    const box: TextBox = {
      id: `words-${n}`,
      text: "Your words",
      face: "display",
      color: swatches[0]?.hex ?? "#ffffff",
      size: 0.09,
      x: 0.5,
      y: doc.texts.length ? Math.min(0.85, 0.5 + 0.12 * doc.texts.length) : 0.5,
    };
    onChange({ ...doc, texts: [...doc.texts, box] }, true);
    onSelect(box.id);
  };
  if (!selected)
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant="secondary"
          onClick={add}
          disabled={doc.texts.length >= 12}
        >
          <Plus /> Add words
        </Button>
        <p className="text-[13px] text-mute">
          {doc.texts.length
            ? "Choose words on the picture to change them, or drag them into place."
            : "Words go on top of the picture, in either of the two faces."}
        </p>
      </div>
    );
  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] xl:items-start">
      <textarea
        name="words"
        autoComplete="off"
        aria-label="The words"
        rows={2}
        value={selected.text}
        onChange={(e) => set({ text: e.target.value }, false)}
        onBlur={() => onChange(doc, true)}
        className="w-full resize-none rounded-control border border-border bg-surface px-2.5 py-1.5 text-[13px] text-fg"
      />
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(["display", "body"] as const).map((face) => (
            <Pill
              key={face}
              aria-pressed={selected.face === face}
              on={selected.face === face}
              onClick={() => set({ face })}
              className={cn(
                "h-8 px-3 text-[13px]",
                face === "display" && "font-display text-[15px]"
              )}
            >
              {face === "display" ? "Display" : "Plain"}
            </Pill>
          ))}
          <span className="mx-1 h-5 w-px bg-border" />
          <fieldset className="flex gap-1.5">
            <legend className="sr-only">Colour</legend>
            {swatches.map((s) => (
              <button
                key={s.name}
                type="button"
                aria-pressed={
                  selected.color.toLowerCase() === s.hex.toLowerCase()
                }
                aria-label={s.name}
                title={s.name}
                onClick={() => set({ color: s.hex })}
                className={cn(
                  "size-7 rounded-full border border-border-strong outline-offset-2",
                  selected.color.toLowerCase() === s.hex.toLowerCase() &&
                    "outline-2 outline-fg"
                )}
                style={{ background: s.hex }}
              />
            ))}
          </fieldset>
        </div>
        <label className="grid gap-1 text-[13px]">
          <span className="flex justify-between text-fg-2">
            Size
            <span className="tabular text-mute">
              {Math.round(selected.size * 100)}
            </span>
          </span>
          <input
            type="range"
            name="size"
            min={2}
            max={30}
            step={1}
            value={Math.round(selected.size * 100)}
            onChange={(e) => set({ size: Number(e.target.value) / 100 }, false)}
            onPointerUp={() => onChange(doc, true)}
            onKeyUp={() => onChange(doc, true)}
            className="w-full accent-primary"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-1 xl:flex-col">
        <button
          type="button"
          className={rowButton}
          onClick={add}
          disabled={doc.texts.length >= 12}
        >
          <Plus className="size-4" /> More words
        </button>
        <button
          type="button"
          className={rowButton}
          onClick={() => {
            onChange(
              { ...doc, texts: doc.texts.filter((t) => t.id !== selected.id) },
              true
            );
            onSelect(null);
          }}
        >
          Remove these words
        </button>
        <button
          type="button"
          className={rowButton}
          onClick={() => onSelect(null)}
        >
          Done
        </button>
      </div>
    </div>
  );
}

/** The words on the stage: choose them, drag them, or nudge them with the arrow keys. */
function TextHandles({
  doc,
  boxes,
  selected,
  onSelect,
  onChange,
}: {
  doc: ImageEdit;
  boxes: Box[];
  selected: string | null;
  onSelect: (id: string) => void;
  onChange: (doc: ImageEdit, commit: boolean) => void;
}) {
  const drag = useRef<{
    id: string;
    x0: number;
    y0: number;
    bx: number;
    by: number;
    last: ImageEdit;
  } | null>(null);
  // the whole box stays inside the picture, not only its middle (TICKET-075)
  const moveTo = (id: string, x: number, y: number) => {
    const b = boxes.find((one) => one.id === id);
    const hw = Math.min(0.5, (b?.width ?? 0) / 2);
    const hh = Math.min(0.5, (b?.height ?? 0) / 2);
    return {
      ...doc,
      texts: doc.texts.map((t) =>
        t.id === id
          ? {
              ...t,
              x: Math.min(1 - hw, Math.max(hw, x)),
              y: Math.min(1 - hh, Math.max(hh, y)),
            }
          : t
      ),
    };
  };
  return (
    <div className="absolute inset-0">
      {boxes.map((b) => {
        const box = doc.texts.find((t) => t.id === b.id);
        if (!box) return null;
        return (
          <button
            key={b.id}
            type="button"
            aria-label={`Words: ${box.text.replace(/[.!?…]+$/, "") || "empty"}. Arrow keys move them.`}
            aria-pressed={selected === b.id}
            className={cn(
              "absolute cursor-move touch-none rounded-chip border border-dashed",
              selected === b.id
                ? "border-fg"
                : "border-fg/40 hover:border-fg/80"
            )}
            style={{
              left: `${b.x * 100}%`,
              top: `${b.y * 100}%`,
              width: `${b.width * 100}%`,
              height: `${b.height * 100}%`,
            }}
            onPointerDown={(event) => {
              onSelect(b.id);
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = {
                id: b.id,
                x0: event.clientX,
                y0: event.clientY,
                bx: box.x,
                by: box.y,
                last: doc,
              };
            }}
            onPointerMove={(event) => {
              const d = drag.current;
              const area =
                event.currentTarget.parentElement?.getBoundingClientRect();
              if (!d || d.id !== b.id || !area) return;
              const next = moveTo(
                b.id,
                d.bx + (event.clientX - d.x0) / area.width,
                d.by + (event.clientY - d.y0) / area.height
              );
              d.last = next;
              onChange(next, false);
            }}
            onPointerUp={() => {
              const d = drag.current;
              drag.current = null;
              if (d && d.last !== doc) onChange(d.last, true);
              else if (d) onChange(doc, true);
            }}
            onKeyDown={(event) => {
              const step = event.shiftKey ? 0.05 : 0.01;
              const d = {
                ArrowLeft: [-step, 0],
                ArrowRight: [step, 0],
                ArrowUp: [0, -step],
                ArrowDown: [0, step],
              }[event.key];
              if (!d) return;
              event.preventDefault();
              onChange(moveTo(b.id, box.x + d[0], box.y + d[1]), true);
            }}
          />
        );
      })}
    </div>
  );
}

type AiRun =
  | { at: "idle" }
  | { at: "working" }
  | { at: "failed"; message: string }
  | { at: "limit"; who: "free" | "guest" };

function AiPanel({
  doc,
  state,
  onRun,
  onUpgrade,
}: {
  doc: ImageEdit;
  state: AiRun;
  onRun: (input: EditInput) => void;
  onUpgrade: () => void;
}) {
  const [tool, setTool] = useState<EditTool>("restore");
  const [object, setObject] = useState("");
  const [color, setColor] = useState("");
  const [aspect, setAspect] = useState<FillAspect>("16:9");
  const meta = EDIT_TOOLS.find((t) => t.id === tool) ?? EDIT_TOOLS[0];
  const input = { tool, object, color, aspect };
  const run = () => onRun(input);
  const applied = doc.ai.map(
    (s) => EDIT_TOOLS.find((t) => t.id === s.tool)?.label ?? s.tool
  );
  return (
    <div className="grid gap-3">
      <div
        className="flex flex-wrap items-center gap-1.5"
        role="radiogroup"
        aria-label="AI tool"
      >
        {EDIT_TOOLS.map((t) => (
          <Pill
            key={t.id}
            role="radio"
            aria-checked={t.id === tool}
            on={t.id === tool}
            onClick={() => setTool(t.id)}
            className="h-8 px-3 text-[13px]"
          >
            {t.label}
          </Pill>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        {(tool === "recolor" || tool === "remove") && (
          <label
            htmlFor="ai-object"
            className="grid gap-1.5 text-[13px] text-fg-2"
          >
            {tool === "recolor" ? "What to recolor" : "What to remove"}
            <Input
              id="ai-object"
              name="object"
              value={object}
              onChange={(e) => setObject(e.target.value)}
              placeholder={
                tool === "recolor" ? "the car…" : "the person on the left…"
              }
              className="h-9 w-60"
              autoComplete="off"
            />
          </label>
        )}
        {tool === "recolor" && (
          <label
            htmlFor="ai-color"
            className="grid gap-1.5 text-[13px] text-fg-2"
          >
            New colour
            <Input
              id="ai-color"
              name="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="deep green…"
              className="h-9 w-44"
              autoComplete="off"
            />
          </label>
        )}
        {tool === "fill" && (
          <div className="grid gap-1.5 text-[13px] text-fg-2">
            <span id="ai-shape">New shape</span>
            <div
              role="radiogroup"
              aria-labelledby="ai-shape"
              className="flex gap-1.5"
            >
              {FILL_ASPECTS.map((a) => (
                <Pill
                  key={a}
                  role="radio"
                  aria-checked={a === aspect}
                  on={a === aspect}
                  onClick={() => setAspect(a)}
                  className="h-9 px-3"
                >
                  {a}
                </Pill>
              ))}
            </div>
          </div>
        )}
        <Button
          onClick={run}
          disabled={
            !isReady(input) || state.at === "working" || state.at === "limit"
          }
        >
          {state.at === "working" ? "Working on it…" : meta.action}
        </Button>
        <span className="pb-2 text-[12.5px] text-mute">
          {meta.hint}. Uses 1 generation.
        </span>
      </div>
      <div aria-live="polite" className="text-[13px] text-fg-2">
        {state.at === "failed" && <p role="alert">{state.message}</p>}
        {state.at === "limit" &&
          (state.who === "free" ? (
            <p className="flex flex-wrap items-center gap-3">
              You have used your free generations.
              <Button size="sm" onClick={onUpgrade}>
                Upgrade to Pro
              </Button>
            </p>
          ) : (
            <p className="flex flex-wrap items-center gap-3">
              The guest session has reached its limit.
              <Button asChild size="sm">
                <Link href="/signup">Create an account</Link>
              </Button>
            </p>
          ))}
        {applied.length > 0 &&
          state.at !== "failed" &&
          state.at !== "limit" && (
            <p className="text-mute">
              Applied so far: {applied.join(", ")}. Undo takes the last one off.
            </p>
          )}
      </div>
    </div>
  );
}
