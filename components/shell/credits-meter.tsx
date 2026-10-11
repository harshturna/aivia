"use client";

import { userProModal } from "@/hooks/useProModal";

/**
 * The quiet meter (design §4): a 4 px bar and one line. The Upgrade link appears only
 * below 20% remaining or at the limit; nothing renders for Pro (the caller decides).
 */
export function CreditsMeter({ count, max }: { count: number; max: number }) {
  const proModal = userProModal();
  const used = Math.min(count, max);
  const left = max - used;
  const low = left <= Math.max(1, Math.floor(max * 0.2));
  return (
    <div className="px-2">
      <div className="h-1 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full bg-white transition-[width] duration-300 ease-out"
          style={{ width: `${(used / max) * 100}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[12px] text-mute">
        <span className="tabular">
          {used} of {max} generations
        </span>
        {low && (
          <button
            type="button"
            onClick={proModal.onOpen}
            className="font-medium text-fg-2 transition-colors hover:text-fg"
          >
            Upgrade
          </button>
        )}
      </div>
    </div>
  );
}
