"use client";

import { Music } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LOCAL_CHANGED, listLocalSessions } from "@/lib/guest-local";
import { projectTitle } from "@/lib/session-text";
import { cn } from "@/lib/utils";

/** A project as a card (D-005, TICKET-062): what it made, what it is called, how fresh it is. */
export type ProjectCardData = {
  id: string;
  title: string;
  updatedAt: string;
  pinned?: boolean;
  media: Array<{ url: string; kind: string; posterUrl?: string | null }>;
};

/** The first three pieces a browser-kept project made, read from its runs' outputs. */
function mediaOf(messages: unknown[]): ProjectCardData["media"] {
  const out: ProjectCardData["media"] = [];
  for (const m of messages as Array<{
    parts?: Array<Record<string, unknown>>;
  }>) {
    for (const part of m.parts ?? []) {
      const type = String(part.type ?? "");
      const output = part.output as
        | { url?: string; urls?: string[] }
        | undefined;
      if (!type.startsWith("tool-generate_") || !output) continue;
      const kind = type.includes("image")
        ? "image"
        : type.includes("video")
          ? "video"
          : "music";
      for (const url of output.urls ?? (output.url ? [output.url] : [])) {
        out.push({ url, kind });
        if (out.length === 3) return out;
      }
    }
  }
  return out;
}

/** "Updated 2 h ago", in the viewer's own words, worked out after mount. */
function Ago({ iso }: { iso: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    setText(
      minutes < 60
        ? rtf.format(-Math.max(0, minutes), "minute")
        : minutes < 60 * 24
          ? rtf.format(-Math.round(minutes / 60), "hour")
          : rtf.format(-Math.round(minutes / 1440), "day")
    );
  }, [iso]);
  return <span suppressHydrationWarning>{text ? `Updated ${text}` : " "}</span>;
}

function Tile({
  piece,
  className,
}: {
  piece?: ProjectCardData["media"][number];
  className?: string;
}) {
  if (!piece) return <div className={cn("bg-surface-2", className)} />;
  if (piece.kind === "image")
    return (
      // biome-ignore lint/performance/noImgElement: generated media at its own size
      <img
        src={piece.url}
        alt=""
        loading="lazy"
        className={cn("object-cover", className)}
      />
    );
  if (piece.kind === "video")
    return piece.posterUrl ? (
      // biome-ignore lint/performance/noImgElement: a clip's poster
      <img
        src={piece.posterUrl}
        alt=""
        loading="lazy"
        className={cn("object-cover", className)}
      />
    ) : (
      <video
        src={`${piece.url}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        aria-hidden
        className={cn("object-cover", className)}
      />
    );
  return (
    <div
      className={cn(
        "grid place-items-center bg-surface-2 text-mute",
        className
      )}
    >
      <Music className="size-5" />
    </div>
  );
}

function Card({ project }: { project: ProjectCardData }) {
  const [a, b, c] = project.media;
  const count = project.media.length;
  return (
    <li>
      <Link href={`/p/${project.id}`} className="group block rounded-media">
        {/* the mosaic fits what there is: one piece fills it, two share it, three make a grid */}
        <div
          className={cn(
            "grid aspect-[4/3] gap-0.5 overflow-hidden rounded-media bg-surface",
            count >= 3
              ? "grid-cols-3 grid-rows-2"
              : count === 2
                ? "grid-cols-2"
                : "grid-cols-1"
          )}
        >
          <Tile
            piece={a}
            className={cn("size-full", count >= 3 && "col-span-2 row-span-2")}
          />
          {count >= 2 && <Tile piece={b} className="size-full" />}
          {count >= 3 && <Tile piece={c} className="size-full" />}
        </div>
        <div className="mt-2.5 truncate text-[13.5px] font-medium leading-5 group-hover:text-fg">
          {projectTitle(project.title)}
        </div>
        <div className="text-[12.5px] leading-5 text-mute">
          <Ago iso={project.updatedAt} />
        </div>
      </Link>
    </li>
  );
}

/**
 * Home's projects: the account's own, or for the guest the ones kept in this browser and then
 * the examples. Nothing renders while there is nothing to show.
 */
export function ProjectGrid({
  projects,
  isGuest,
}: {
  projects: ProjectCardData[];
  isGuest: boolean;
}) {
  const [local, setLocal] = useState<ProjectCardData[]>([]);
  useEffect(() => {
    if (!isGuest) return;
    const read = () =>
      setLocal(
        listLocalSessions().map((s) => ({
          id: s.id,
          title: s.title,
          updatedAt: new Date(s.updatedAt).toISOString(),
          media: mediaOf(s.messages),
        }))
      );
    read();
    window.addEventListener(LOCAL_CHANGED, read);
    return () => window.removeEventListener(LOCAL_CHANGED, read);
  }, [isGuest]);

  const groups = isGuest
    ? [
        { title: "Your projects", items: local },
        { title: "Examples", items: projects },
      ]
    : [{ title: "Projects", items: projects }];

  return (
    <>
      {groups.map(
        (g) =>
          g.items.length > 0 && (
            <section
              key={g.title}
              aria-label={g.title}
              className="mt-16 w-full"
            >
              <h2 className="mb-4 text-[13px] font-medium text-fg-2">
                {g.title}
              </h2>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
                {g.items.map((p) => (
                  <Card key={p.id} project={p} />
                ))}
              </ul>
            </section>
          )
      )}
    </>
  );
}
