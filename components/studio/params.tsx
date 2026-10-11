"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pill } from "@/components/ui/pill";
import type { ComposerMode } from "./composer";

/**
 * Each direct mode's parameters (design §5.2), as pills in the composer's toolbar. Auto has
 * none: the agent chooses.
 */
export interface ModeParams {
  aspect: "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
  count: 1 | 2 | 3 | 4;
  videoAspect: "16:9" | "9:16" | "1:1";
  musicSeconds: 15 | 30 | 60;
  soundSeconds: 0 | 2 | 5 | 10;
}

export const DEFAULT_PARAMS: ModeParams = {
  aspect: "1:1",
  count: 1,
  videoAspect: "16:9",
  musicSeconds: 30,
  soundSeconds: 0,
};

/** What a send costs in generations, for the label beside the send button. */
export function costOf(mode: ComposerMode, params: ModeParams) {
  const n = mode === "image" ? params.count : 1;
  return `${n} generation${n === 1 ? "" : "s"}`;
}

export function ModeParamPills({
  mode,
  params,
  onChange,
}: {
  mode: ComposerMode;
  params: ModeParams;
  onChange: (next: ModeParams) => void;
}) {
  const set = <K extends keyof ModeParams>(key: K, value: ModeParams[K]) =>
    onChange({ ...params, [key]: value });

  if (mode === "image") {
    return (
      <>
        <Choice
          label="Aspect"
          value={params.aspect}
          options={["1:1", "3:4", "4:3", "16:9", "9:16"]}
          onChange={(v) => set("aspect", v as ModeParams["aspect"])}
        />
        <Choice
          label="Images"
          value={String(params.count)}
          display={`${params.count} image${params.count === 1 ? "" : "s"}`}
          options={["1", "2", "3", "4"]}
          format={(v) => `${v} image${v === "1" ? "" : "s"}`}
          onChange={(v) => set("count", Number(v) as ModeParams["count"])}
        />
      </>
    );
  }
  if (mode === "video") {
    return (
      // every clip is five seconds (TICKET-019): its shape is the choice
      <Choice
        label="Aspect"
        value={params.videoAspect}
        options={["16:9", "9:16", "1:1"]}
        onChange={(v) => set("videoAspect", v as ModeParams["videoAspect"])}
      />
    );
  }
  if (mode === "music") {
    return (
      <Choice
        label="Length"
        value={String(params.musicSeconds)}
        display={`${params.musicSeconds} seconds`}
        options={["15", "30", "60"]}
        format={(v) => `${v} seconds`}
        onChange={(v) =>
          set("musicSeconds", Number(v) as ModeParams["musicSeconds"])
        }
      />
    );
  }
  if (mode === "sound") {
    return (
      <Choice
        label="Length"
        value={String(params.soundSeconds)}
        display={
          params.soundSeconds ? `${params.soundSeconds} seconds` : "Any length"
        }
        options={["0", "2", "5", "10"]}
        format={(v) => (v === "0" ? "Any length" : `${v} seconds`)}
        onChange={(v) =>
          set("soundSeconds", Number(v) as ModeParams["soundSeconds"])
        }
      />
    );
  }
  return null;
}

function Choice({
  label,
  value,
  display,
  options,
  format = (v) => v,
  onChange,
}: {
  label: string;
  value: string;
  display?: string;
  options: string[];
  format?: (v: string) => string;
  onChange: (v: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pill aria-label={`${label}: ${display ?? value}`}>
          {display ?? value}
          <ChevronDown className="opacity-60" />
        </Pill>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="min-w-36">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((o) => (
            <DropdownMenuRadioItem
              key={o}
              value={o}
              className="text-[13px] text-fg-2 focus:bg-surface-3 focus:text-fg"
            >
              {format(o)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
