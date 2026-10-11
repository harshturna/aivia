import { ArrowUp, Paperclip, Plus, Search } from "lucide-react";
import { notFound } from "next/navigation";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Pill } from "@/components/ui/pill";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

/**
 * The kit (TICKET-003, TICKET-022): every token and primitive in every state, on one page, for review.
 * Development only.
 */
const SWATCHES: Array<[string, string, string]> = [
  ["bg", "#0e0e0d", "warm charcoal (the landing: #0b1410 moss)"],
  ["surface", "#161615", "sidebar, panels, inputs"],
  ["surface-2", "#1d1d1b", "hover, popovers, composer"],
  ["surface-3", "#262523", "pressed, selected"],
  ["border", "rgb(241 236 220 / .08)", "hairlines"],
  ["border-strong", "rgb(241 236 220 / .16)", "focused edges"],
  ["fg", "#f1ecdc", "parchment text 16.3:1"],
  ["fg-2", "#b3afa5", "secondary 8.8:1"],
  ["mute", "#938f86", "captions 5.2:1 on surface-2"],
  ["faint", "#4b4944", "placeholders, never text"],
  ["sun", "#e2b962", "the one accent: live, playhead"],
  ["tint-bark", "#e9a77c", "picture mark"],
  ["tint-water", "#8fd0c0", "clip mark"],
  ["tint-fern", "#c5d6a0", "words mark"],
  ["good", "#5cc489", "status"],
  ["warn", "#e0b15a", "status"],
  ["poor", "#f2756b", "status"],
];

export default function KitPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto max-w-[1100px] px-8 py-16">
      <header className="flex items-baseline justify-between">
        <Logo className="text-[24px]" />
        <p className="text-[13px] text-mute">The kit, design §2</p>
      </header>

      <section className="mt-16">
        <h2 className="text-[13px] font-medium text-fg-2">Colour</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SWATCHES.map(([name, value, use]) => (
            <li key={name} className="rounded-media border border-border p-3">
              <div
                className="h-14 rounded-control border border-border"
                style={{ background: `var(--color-${name})` }}
              />
              <div className="mt-2 text-[13px] font-medium">{name}</div>
              <div className="text-[12px] text-mute">{value}</div>
              <div className="text-[12px] text-mute">{use}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="text-[13px] font-medium text-fg-2">Type</h2>
        <div className="mt-6 space-y-6">
          <p className="text-[clamp(44px,6.5vw,92px)] font-medium leading-[0.98] tracking-[-0.03em]">
            Describe it.
            <br />
            Watch it get made.
          </p>
          <p className="text-[40px] font-medium leading-[1.05] tracking-[-0.02em]">
            Every one of these started as a sentence.
          </p>
          <p className="text-[24px] font-medium leading-[1.2] tracking-[-0.01em]">
            Night market teaser
          </p>
          <p className="max-w-[68ch] text-[15px] leading-6 text-fg-2">
            Describe what you want made. Aivia plans the work, then makes the
            poster, the clip, the soundtrack and the words, in one run you can
            watch. Body text at fifteen on twenty-four.
          </p>
          <p className="text-[13px] font-medium">
            Thirteen, medium: names, buttons, navigation
          </p>
          <p className="text-[12px] text-mute">
            Twelve, mute: captions, timestamps, 0:41 elapsed,{" "}
            <span className="tabular">12,480</span> tabular
          </p>
          <pre className="w-max rounded-media bg-surface p-4 font-mono text-[13px] leading-5 text-fg-2">
            {'const run = await aivia.make("a poster for a night market")'}
          </pre>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-[13px] font-medium text-fg-2">Buttons</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button>Start making</Button>
          <Button variant="secondary">Sign in</Button>
          <Button variant="outline">Replay</Button>
          <Button variant="ghost">Rename</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="link">See a run</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Send">
            <ArrowUp />
          </Button>
          <Button size="icon-sm" variant="secondary" aria-label="Attach">
            <Paperclip />
          </Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-[13px] font-medium text-fg-2">Fields</h2>
        <div className="mt-4 grid max-w-[560px] gap-3">
          <Input placeholder="you@example.com" />
          <Input defaultValue="Night market teaser" />
          <Textarea placeholder="Describe what you want made" />
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mute" />
            <Input className="pl-9" placeholder="Search what you have made" />
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-[13px] font-medium text-fg-2">Pills and keys</h2>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Pill on>Auto</Pill>
          <Pill>Image</Pill>
          <Pill>Video</Pill>
          <Pill>Music</Pill>
          <Pill>Sound</Pill>
          <Pill>3:4</Pill>
          <Pill>2 images</Pill>
          <Pill>
            <Plus /> Attach
          </Pill>
          <span className="ml-4 inline-flex items-center gap-1.5 text-[13px] text-fg-2">
            New project <Kbd>⌘</Kbd>
            <Kbd>N</Kbd>
          </span>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-[13px] font-medium text-fg-2">
          Running, loading, status
        </h2>
        <div className="mt-4 grid max-w-[720px] grid-cols-2 gap-3">
          <Skeleton className="flex aspect-[3/4] items-end p-3 text-[13px] text-mute">
            Lanterns over a wet alley, 35mm
          </Skeleton>
          <div className="space-y-3">
            <Skeleton className="aspect-video" />
            <div className="flex items-center gap-2 text-[13px] text-fg-2">
              <Spinner /> Generating the clip{" "}
              <span className="tabular">0:41</span>
            </div>
            <div className="flex gap-4 text-[13px]">
              <span className="text-good">done</span>
              <span className="text-warn">slow</span>
              <span className="text-poor">failed</span>
            </div>
            <div className="h-1 w-48 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full w-1/3 bg-fg" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-[13px] font-medium text-fg-2">Surfaces</h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-panel bg-surface p-5 text-[13px] text-fg-2">
            surface, panel radius
          </div>
          <div className="rounded-panel bg-surface-2 p-5 text-[13px] text-fg-2 shadow-float">
            surface-2 floating
          </div>
          <div className="glass rounded-panel border border-border p-5 text-[13px] text-fg-2">
            glass, border
          </div>
        </div>
      </section>
    </main>
  );
}
