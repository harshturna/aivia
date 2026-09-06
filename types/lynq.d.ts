// Lynq tracker (docs-lynq.byharsh.com/tracking/typescript). `lynq` is optional on
// purpose: the script is deferred and a blocker may stop it, so calls go through `?.`.
type LynqProps = Record<string, string | number | boolean | null | undefined>;

interface Lynq {
  /** Record a custom event; properties are flat and stored as text. */
  track(name: string, properties?: LynqProps): void;
  /** Attach the session to one of your users; ignored under Global Privacy Control. */
  identify(userId: string): void;
  /** Stop measuring this browser (sets one localStorage flag). */
  optOut(): void;
  /** Measure this browser again. */
  optIn(): void;
}

declare global {
  interface Window {
    /** Present once the script has loaded. */
    lynq?: Lynq;
    /** Calls queued before the script loads are replayed on start. */
    lynqQueue?: { name: string; properties?: LynqProps }[];
  }
}

export {};
