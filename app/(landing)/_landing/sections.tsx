import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import { AmbientVideo } from "@/components/studio/ambient-video";
import { AudioRow } from "@/components/studio/audio-row";
import { buttonVariants } from "@/components/ui/button";
import { CLIPS, STILLS, TRACKS } from "@/lib/landing-media";
import { cn } from "@/lib/utils";
import { H2, LEDE, WRAP } from "./type";

/** The four direct modes with real outputs (design §11.5). */
export function Modes() {
  const still = STILLS[2];
  const clip = CLIPS[1];
  return (
    <section className={WRAP}>
      <h2 className={H2}>Need just one thing? Ask for just that.</h2>
      <p className={LEDE}>
        Switch to Image, Video, Music or Sound and Aivia makes exactly that,
        with no plan in between. Give Video a still and it comes to life.
      </p>
      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-x-4 gap-y-8 md:grid-cols-2">
        <Plate title="Image" caption={still.prompt}>
          <div className="aspect-video overflow-hidden rounded-media bg-surface">
            <Image
              src={still.src}
              alt={still.prompt}
              width={still.width}
              height={still.height}
              sizes="(max-width: 768px) 100vw, 580px"
              className="size-full object-cover object-[50%_45%]"
            />
          </div>
        </Plate>
        <Plate title="Video" caption={clip.prompt}>
          <div className="aspect-video overflow-hidden rounded-media bg-surface">
            <AmbientVideo
              src={clip.src}
              poster={clip.poster}
              className="size-full object-cover"
            />
          </div>
        </Plate>
        {TRACKS.map((track) => (
          <Plate
            key={track.src}
            title={track.kind === "music" ? "Music" : "Sound"}
            caption={track.prompt}
          >
            <AudioRow
              downloadable={false}
              src={track.src}
              title={track.title}
              subtitle={
                track.kind === "music"
                  ? "Instrumental, thirty seconds"
                  : "Twelve seconds"
              }
              seconds={track.seconds}
            />
          </Plate>
        ))}
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

/**
 * The close (design §11.9): one line over a clip, the button. The clip fades out at both
 * edges with a mask, not a painted gradient, so it melts into whatever page is behind it.
 */
export function Close({
  media = CLIPS[2],
}: {
  media?: { src: string; poster: string };
}) {
  return (
    // pricing lives here, above the button, rather than as a lone block before a second
    // closing line (TICKET-055); the nav's Pricing link lands on it
    <section
      id="pricing"
      className="relative isolate scroll-mt-20 overflow-hidden py-56"
    >
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
        <h2 className="mx-auto font-display text-[clamp(40px,5.4vw,80px)] font-medium leading-[1] tracking-[-0.015em]">
          Begin with one sentence.
        </h2>
        <p className={cn(LEDE, "mx-auto")}>
          Five free generations to start. Pro is $20 a month, for when one
          sentence turns into a habit.
        </p>
        <Link
          href="/get-started"
          className={cn(buttonVariants({ size: "lg" }), "mt-10")}
        >
          Start making
        </Link>
      </div>
    </section>
  );
}

/** The footer (design §11.9): the wordmark and the links a visitor uses, in one row. */
// the app's pages ask a signed-out visitor to sign in; the Studio goes through the guest
// start instead (TICKET-055)
const FOOTER_LINKS: Array<[string, string]> = [
  ["Studio", "/get-started"],
  ["Pricing", "#pricing"],
  ["Sign in", "/login"],
  ["Create account", "/signup"],
];

export function LandingFooter() {
  return (
    <footer className={cn(WRAP, "pb-12 pt-16")}>
      <div className="flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="rounded-control">
          <Logo className="text-[18px]" />
        </Link>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13.5px]">
            {FOOTER_LINKS.map(([label, href]) => (
              <li key={label}>
                <a
                  href={href}
                  className="text-fg-2 transition-colors hover:text-fg"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
