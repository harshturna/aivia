"use client";

import { Download, ImagePlus, LayoutGrid, RotateCcw } from "lucide-react";
import Link from "next/link";
import { CldUploadWidget, getCldImageUrl } from "next-cloudinary";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScreenHeader } from "@/components/shell/screen";
import { RevealImage } from "@/components/studio/reveal-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { Skeleton } from "@/components/ui/skeleton";
import { didLimitReach, incrementLimit } from "@/lib/actions";
import {
  cloudinaryOptions,
  EDIT_TOOLS,
  type EditInput,
  type EditTool,
  FILL_ASPECTS,
  type FillAspect,
  isReady,
  targetSize,
} from "@/lib/edit";
import { cn } from "@/lib/utils";

const PRESET = "aivia_transformation";

interface Source {
  publicId: string;
  width: number;
  height: number;
  url: string;
}

type Status = "idle" | "working" | "done" | "error" | "limit";

/**
 * Edit (design §7): a photo on the left, its edit on the right, the tools as tabs over both.
 * The source is uploaded to Cloudinary (or copied there from the library); each edit is a
 * transformation URL, so nothing is stored but the source.
 */
export function EditWorkspace({
  initialTool,
  libraryImage,
}: {
  initialTool: EditTool;
  libraryImage?: { url: string; prompt: string } | null;
}) {
  const [tool, setTool] = useState<EditTool>(initialTool);
  const [source, setSource] = useState<Source | null>(null);
  const [importing, setImporting] = useState(Boolean(libraryImage));
  const [object, setObject] = useState("");
  const [color, setColor] = useState("");
  const [aspect, setAspect] = useState<FillAspect>("16:9");
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const attempts = useRef(0);

  const input: EditInput = { tool, object, color, aspect };
  const meta = EDIT_TOOLS.find((t) => t.id === tool) ?? EDIT_TOOLS[0];

  // An image from the library is copied into Cloudinary once, by URL.
  useEffect(() => {
    if (!libraryImage) return;
    let cancelled = false;
    (async () => {
      try {
        const form = new FormData();
        form.append("file", libraryImage.url);
        form.append("upload_preset", PRESET);
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: form }
        );
        if (!response.ok) throw new Error(await response.text());
        const info = (await response.json()) as {
          public_id: string;
          width: number;
          height: number;
          secure_url: string;
        };
        if (!cancelled)
          setSource({
            publicId: info.public_id,
            width: info.width,
            height: info.height,
            url: info.secure_url,
          });
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            "Could not bring that image over from the library. Upload it instead."
          );
        }
      } finally {
        if (!cancelled) setImporting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [libraryImage]);

  // A new tool or a new source starts from a clean result.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on these only
  useEffect(() => {
    setResult(null);
    setStatus("idle");
    setMessage("");
  }, [tool, source?.publicId]);

  const apply = async () => {
    if (!source || !isReady(input)) return;
    setStatus("working");
    setMessage("");
    if (await didLimitReach()) {
      setStatus("limit");
      return;
    }
    await incrementLimit();
    attempts.current = 0;
    const size = targetSize(input, source);
    setResult(
      getCldImageUrl({
        src: source.publicId,
        width: size.width,
        height: size.height,
        ...cloudinaryOptions(input),
      })
    );
  };

  // Generative edits can answer "still working" before the image exists; try a few times.
  const onResultError = () => {
    if (!result) return;
    if (attempts.current < 6) {
      attempts.current += 1;
      const base = result.split("?")[0];
      setTimeout(
        () => setResult(`${base}?attempt=${attempts.current}`),
        3000 * attempts.current
      );
      return;
    }
    setStatus("error");
    setMessage("The edit did not come back. Try again, or try another photo.");
  };

  const download = useCallback(async () => {
    if (!result) return;
    try {
      const blob = await (await fetch(result)).blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `aivia-${tool}.${blob.type.includes("png") ? "png" : "jpg"}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(result, "_blank", "noopener");
    }
  }, [result, tool]);

  return (
    <div className="min-h-dvh">
      <ScreenHeader title="Edit">
        {source && (
          <Button variant="ghost" size="sm" onClick={() => setSource(null)}>
            <RotateCcw /> Start over
          </Button>
        )}
      </ScreenHeader>

      <div className="px-3 pb-16 pt-4 lg:px-6">
        <div
          role="tablist"
          aria-label="Tool"
          className="flex flex-wrap gap-1.5"
        >
          {EDIT_TOOLS.map((t) => (
            <Pill
              key={t.id}
              role="tab"
              aria-selected={t.id === tool}
              on={t.id === tool}
              onClick={() => setTool(t.id)}
              className="h-8 px-3 text-[13px]"
            >
              {t.label}
            </Pill>
          ))}
        </div>
        <p className="mt-2 text-[13px] text-mute">{meta.hint}.</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section aria-label="Your photo">
            <h2 className="mb-2 text-[13px] font-medium text-fg-2">
              Your photo
            </h2>
            {source ? (
              <div className="overflow-hidden rounded-media bg-surface">
                <RevealImage
                  src={source.url}
                  alt="Your photo"
                  className="block w-full"
                />
              </div>
            ) : importing ? (
              <Skeleton className="flex aspect-[4/3] items-end p-4 text-[13px] text-mute">
                Bringing the image over from your library…
              </Skeleton>
            ) : (
              <CldUploadWidget
                uploadPreset={PRESET}
                options={{
                  multiple: false,
                  resourceType: "image",
                  sources: ["local", "url", "camera"],
                }}
                onSuccess={(res) => {
                  const info = res.info as {
                    public_id: string;
                    width: number;
                    height: number;
                    secure_url: string;
                  };
                  setSource({
                    publicId: info.public_id,
                    width: info.width,
                    height: info.height,
                    url: info.secure_url,
                  });
                }}
                onError={() => {
                  setStatus("error");
                  setMessage("The upload did not go through. Try again.");
                }}
              >
                {({ open }) => (
                  <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-media border border-dashed border-border-strong bg-surface p-6 text-center">
                    <ImagePlus className="size-6 text-mute" />
                    <div>
                      <p className="text-[15px]">Add a photo to edit</p>
                      <p className="mt-1 text-[13px] text-mute">
                        JPG, PNG or WebP
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button onClick={() => open()}>Upload a photo</Button>
                      <Button asChild variant="secondary">
                        <Link href="/library?kind=image">
                          <LayoutGrid /> Choose from the library
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CldUploadWidget>
            )}
          </section>

          <section aria-label="The edit" aria-live="polite">
            <h2 className="mb-2 text-[13px] font-medium text-fg-2">The edit</h2>
            {result && source && status !== "error" ? (
              <Result
                key={result}
                url={result}
                original={tool === "fill" ? null : source.url}
                onLoad={() => setStatus("done")}
                onError={onResultError}
                working={status === "working"}
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-media border border-border bg-surface p-6 text-center text-[13px] text-mute">
                {status === "error"
                  ? message
                  : status === "limit"
                    ? "You have used your edits for now. Create an account or upgrade to keep going."
                    : source
                      ? "Choose the edit, then apply it."
                      : "The edited photo shows here."}
              </div>
            )}
          </section>
        </div>

        {source && (
          <div className="mt-6 flex flex-wrap items-end gap-3">
            {(tool === "recolor" || tool === "remove") && (
              <label
                htmlFor="edit-object"
                className="grid gap-1.5 text-[13px] text-fg-2"
              >
                {tool === "recolor" ? "What to recolor" : "What to remove"}
                <Input
                  id="edit-object"
                  value={object}
                  onChange={(e) => setObject(e.target.value)}
                  placeholder={
                    tool === "recolor" ? "the car…" : "the person on the left…"
                  }
                  className="w-64"
                  autoComplete="off"
                />
              </label>
            )}
            {tool === "recolor" && (
              <label
                htmlFor="edit-color"
                className="grid gap-1.5 text-[13px] text-fg-2"
              >
                New colour
                <Input
                  id="edit-color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="deep green…"
                  className="w-48"
                  autoComplete="off"
                />
              </label>
            )}
            {tool === "fill" && (
              <div className="grid gap-1.5 text-[13px] text-fg-2">
                <span id="fill-shape">New shape</span>
                <div
                  role="radiogroup"
                  aria-labelledby="fill-shape"
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
              onClick={apply}
              disabled={!isReady(input) || status === "working"}
            >
              {status === "working" ? "Working…" : meta.action}
            </Button>
            {status === "done" && (
              <Button variant="secondary" onClick={download}>
                <Download /> Download
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** The result, with a before-and-after slider when the shapes match. */
function Result({
  url,
  original,
  onLoad,
  onError,
  working,
}: {
  url: string;
  original: string | null;
  onLoad: () => void;
  onError: () => void;
  working: boolean;
}) {
  const [split, setSplit] = useState(50);
  const [loaded, setLoaded] = useState(false);
  const clip = useMemo(() => `inset(0 ${100 - split}% 0 0)`, [split]);
  return (
    <div className="relative overflow-hidden rounded-media bg-surface">
      {!loaded && working && (
        <Skeleton className="absolute inset-0 z-10 flex items-end rounded-none p-4 text-[13px] text-mute">
          Working on it…
        </Skeleton>
      )}
      <RevealImage
        src={url}
        alt="The edited photo"
        onLoad={() => {
          setLoaded(true);
          onLoad();
        }}
        onError={onError}
        className="block w-full"
      />
      {original && loaded && (
        <>
          {/* biome-ignore lint/performance/noImgElement: the original, clipped over the result */}
          <img
            src={original}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 size-full object-cover"
            style={{ clipPath: clip }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-px bg-white/80"
            style={{ left: `${split}%` }}
          />
          <span className="pointer-events-none absolute left-2 top-2 rounded-[5px] bg-bg/60 px-1.5 py-0.5 text-[11.5px] text-fg backdrop-blur">
            Before
          </span>
          <span className="pointer-events-none absolute right-2 top-2 rounded-[5px] bg-bg/60 px-1.5 py-0.5 text-[11.5px] text-fg backdrop-blur">
            After
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={split}
            onChange={(e) => setSplit(Number(e.target.value))}
            aria-label="Compare before and after"
            className={cn(
              "absolute inset-0 size-full cursor-ew-resize opacity-0"
            )}
          />
        </>
      )}
    </div>
  );
}
