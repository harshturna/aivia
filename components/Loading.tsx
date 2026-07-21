import { TypingDots } from "./TypingDots";

/**
 * Route-level loading fallback, used by the loading.tsx in each segment.
 *
 * Three things changed from the original:
 *  - `w-screen` overflowed horizontally on every page inside the app shell,
 *    which is already inset by the 18rem sidebar. Sized to the container.
 *  - The dots were `text-pink-400` on `text-slate-600`, off-theme now.
 *  - `delay-100`/`delay-200` on `animate-bounce` set transition-delay, not
 *    animation-delay, so all three dots bounced in unison. TypingDots does
 *    the stagger properly and respects prefers-reduced-motion.
 */
const Loading = () => (
  <div className="flex min-h-[50vh] h-full w-full items-center justify-center">
    <TypingDots className="scale-150 text-primary" />
  </div>
);

export default Loading;
