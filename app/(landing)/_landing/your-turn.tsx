"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Composer, type ComposerMode } from "@/components/studio/composer";
import { cn } from "@/lib/utils";
import { BRIEF_TEXT } from "./hero";
import { LEDE, WRAP } from "./type";

const EXAMPLES = [
  BRIEF_TEXT.replace(/\.$/, ""),
  "Album art for a quiet piano record, and a name for it",
  "The sound of rain on a tin roof, twenty seconds",
];

/** Straight after the sequence: the real composer, handing the line to the Studio. */
export function YourTurn() {
  const router = useRouter();
  const [mode, setMode] = useState<ComposerMode>("auto");
  const [text, setText] = useState("");
  const start = (prompt: string, m: ComposerMode) => {
    window.lynq?.track("Hero prompt");
    const params = new URLSearchParams({ prompt, mode: m });
    router.push(`/get-started?${params.toString()}`);
  };
  return (
    <section className={cn(WRAP, "text-center")}>
      <h2 className="font-display text-[clamp(40px,5.4vw,80px)] font-medium leading-[0.95] tracking-[-0.015em]">
        Now write yours.
      </h2>
      <p className={cn(LEDE, "mx-auto")}>
        One line. Aivia plans the work and makes every piece while you watch.
      </p>
      <div className="mx-auto mt-10 max-w-[720px] text-left">
        <Composer
          mode={mode}
          onModeChange={setMode}
          value={text}
          onChange={setText}
          onSubmit={start}
        />
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((example) => (
            <li key={example}>
              <button
                type="button"
                onClick={() => setText(example)}
                className="rounded-full border border-border px-3 py-1.5 text-[12.5px] leading-[18px] text-fg-2 transition-colors hover:border-border-strong hover:text-fg"
              >
                {example}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
