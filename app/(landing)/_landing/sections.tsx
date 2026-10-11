import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import { AmbientVideo } from "@/components/studio/ambient-video";
import { AudioRow } from "@/components/studio/audio-row";
import { buttonVariants } from "@/components/ui/button";
import { CHANGELOG, formatChangelogDate } from "@/lib/changelog";
import { CLIPS, STILLS, TRACKS } from "@/lib/landing-media";
import { cn } from "@/lib/utils";

const H2 =
  "max-w-[22ch] text-[clamp(32px,4vw,48px)] font-medium leading-[1.05] tracking-[-0.02em] [text-wrap:balance]";
const LEDE = "mt-4 max-w-[52ch] text-[16px] leading-6 text-fg-2";
const WRAP = "mx-auto max-w-[1200px] px-6 sm:px-8";

/** The four modes with real outputs (design §11.5). */
export function Modes() {
  const still = STILLS[4];
  const clip = CLIPS[1];
  return (
    <section className={WRAP}>
      <h2 className={H2}>Or make just the one thing.</h2>
      <p className={LEDE}>
        Switch the composer to Image, Video, Music or Sound and skip the plan.
        Same session, same library.
      </p>
      <div className="mt-10 grid gap-3 md:grid-cols-2">
        <Plate title="Image" caption={`${still.prompt}, ${still.seconds} s`}>
          <div className="aspect-video overflow-hidden rounded-media bg-surface">
            <Image
              src={still.src}
              alt={still.prompt}
              width={still.width}
              height={still.height}
              sizes="(max-width: 760px) 100vw, 580px"
              className="size-full object-cover"
            />
          </div>
        </Plate>
        <Plate title="Video" caption={`${clip.prompt}, ${clip.seconds} s clip`}>
          <div className="aspect-video overflow-hidden rounded-media bg-surface">
            <AmbientVideo
              src={clip.src}
              poster={clip.poster}
              className="size-full object-cover"
            />
          </div>
        </Plate>
        <Plate title="Music" caption={`${TRACKS[0].prompt}, 30 s`}>
          <AudioRow
            src={TRACKS[0].src}
            title={TRACKS[0].title}
            subtitle="Instrumental, thirty seconds"
            seconds={30}
          />
        </Plate>
        <Plate title="Sound" caption={`${TRACKS[1].prompt}, 10 s`}>
          <AudioRow
            src={TRACKS[1].src}
            title={TRACKS[1].title}
            subtitle="Ten seconds"
            seconds={10}
          />
        </Plate>
      </div>
    </section>
  );
}

function Plate({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure>
      {children}
      <figcaption className="mt-3 text-[14px] leading-5">
        <span className="font-medium">{title}</span>
        <span className="text-mute"> {caption}</span>
      </figcaption>
    </figure>
  );
}

/** The library, as a frame (design §11.6). */
export function LibraryPanel() {
  const tiles = [
    STILLS[1],
    STILLS[3],
    STILLS[5],
    STILLS[0],
    STILLS[4],
    STILLS[7],
    STILLS[6],
    STILLS[2],
  ];
  return (
    <section className={WRAP}>
      <div className="grid items-end gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 className={H2}>Everything you make, kept.</h2>
          <p className={LEDE}>
            Every image, clip and track lands in your library the moment it is
            made, with the line that made it. Search it, favourite it, reopen
            the session it came from.
          </p>
        </div>
      </div>
      <div className="mt-10 overflow-hidden rounded-window border border-border bg-surface">
        <div className="flex h-13 items-center gap-4 border-b border-border px-6 text-[15px] font-medium">
          Library
          <span className="inline-flex overflow-hidden rounded-control border border-border text-[12.5px] font-medium">
            <span className="bg-surface-3 px-3 py-1 text-fg">All</span>
            <span className="px-3 py-1 text-fg-2">Images</span>
            <span className="px-3 py-1 text-fg-2">Video</span>
            <span className="px-3 py-1 text-fg-2">Audio</span>
          </span>
          <span className="ml-auto hidden text-[13px] font-normal text-mute sm:inline">
            Search what you have made
          </span>
        </div>
        <div className="p-6">
          <div className="text-[12.5px] font-medium text-mute">Today</div>
          <div className="mt-3 columns-2 gap-3 md:columns-4">
            {tiles.map((t) => (
              <div
                key={t.src}
                className="mb-3 overflow-hidden rounded-media bg-surface-2 [break-inside:avoid]"
              >
                <Image
                  src={t.src}
                  alt={t.prompt}
                  width={t.width}
                  height={t.height}
                  sizes="(max-width: 760px) 50vw, 280px"
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Pricing (design §11.7): two columns on one rule, honest. */
export function Pricing() {
  return (
    <section id="pricing" className={WRAP}>
      <h2 className={H2}>Pricing</h2>
      <div className="mt-8 grid gap-10 border-t border-border-strong pt-8 md:grid-cols-2">
        <div>
          <h3 className="text-[15px] font-medium">Free</h3>
          <div className="mt-3 text-[44px] font-medium leading-none tracking-[-0.02em]">
            $0
          </div>
          <p className="mt-4 max-w-[36ch] text-[14px] leading-6 text-fg-2">
            Five generations to start, in every mode. Your library kept.
          </p>
          <Link
            href="/get-started"
            className={cn(buttonVariants({ variant: "secondary" }), "mt-6")}
          >
            Start free
          </Link>
        </div>
        <div>
          <h3 className="text-[15px] font-medium">Pro</h3>
          <div className="mt-3 text-[44px] font-medium leading-none tracking-[-0.02em]">
            $20
            <span className="ml-2 text-[15px] font-normal tracking-normal text-mute">
              a month
            </span>
          </div>
          <p className="mt-4 max-w-[36ch] text-[14px] leading-6 text-fg-2">
            Unlimited generations. Cancel any time.
          </p>
          <Link href="/login" className={cn(buttonVariants(), "mt-6")}>
            Go Pro
          </Link>
        </div>
      </div>
    </section>
  );
}

/** What changed (design §11.8): the last five entries. */
export function Changelog() {
  return (
    <section id="changelog" className={WRAP}>
      <h2 className={H2}>What changed</h2>
      <ol className="mt-8 border-t border-border-strong">
        {CHANGELOG.slice(0, 5).map((entry) => (
          <li
            key={`${entry.date}-${entry.text}`}
            className="grid gap-1 border-b border-border py-4 text-[14px] leading-6 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-6"
          >
            <time
              dateTime={entry.date}
              className="tabular text-[13px] text-mute"
            >
              {formatChangelogDate(entry.date)}
            </time>
            <span>{entry.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * The close (design §11.9): one line over a clip, the button. The clip fades out at both
 * edges with a mask, not a painted gradient, so it melts into whatever page is behind it.
 */
export function Close({
  media = CLIPS[2],
  headingClassName,
}: {
  media?: { src: string; poster: string };
  headingClassName?: string;
}) {
  return (
    <section className="relative isolate mt-16 overflow-hidden py-56">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent_0%,rgb(0_0_0/.12)_14%,rgb(0_0_0/.45)_30%,black_50%,rgb(0_0_0/.45)_70%,rgb(0_0_0/.12)_86%,transparent_100%)]"
      >
        <AmbientVideo
          src={media.src}
          poster={media.poster}
          className="size-full object-cover opacity-45"
        />
      </div>
      <div className={cn(WRAP, "text-center")}>
        <h2
          className={cn(
            "mx-auto text-[clamp(36px,5vw,64px)] font-medium leading-[1] tracking-[-0.03em]",
            headingClassName
          )}
        >
          Make something today.
        </h2>
        <Link
          href="/get-started"
          className={cn(buttonVariants({ size: "lg" }), "mt-12")}
        >
          Start making
        </Link>
      </div>
    </section>
  );
}

/** The footer (design §11.10). */
export function LandingFooter() {
  const cols: Array<[string, Array<[string, string]>]> = [
    [
      "Product",
      [
        ["Studio", "/studio"],
        ["Library", "/library"],
        ["Edit", "/edit"],
        ["Pricing", "#pricing"],
        ["Changelog", "#changelog"],
      ],
    ],
    [
      "Account",
      [
        ["Sign in", "/login"],
        ["Create account", "/signup"],
        ["Try as a guest", "/get-started"],
      ],
    ],
    [
      "Aivia",
      [
        ["By harsh", "https://harshturna.com"],
        ["Source", "https://github.com/harshturna/aivia"],
      ],
    ],
  ];
  return (
    <footer className={cn(WRAP, "pb-10 pt-16")}>
      <div className="grid gap-8 border-t border-border pt-8 text-[13px] sm:grid-cols-[1fr_1fr_1fr_auto]">
        {cols.map(([title, links]) => (
          <div key={title}>
            <div className="mb-2 font-medium text-fg">{title}</div>
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="block py-1 text-fg-2 transition-colors hover:text-fg"
                {...(href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {label}
              </a>
            ))}
          </div>
        ))}
        <div className="flex flex-col items-start gap-2 text-mute sm:items-end">
          <Logo className="text-[16px]" />
          <span>2026</span>
        </div>
      </div>
    </footer>
  );
}
