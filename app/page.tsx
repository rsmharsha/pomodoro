"use client";

import { useStore } from "@/lib/store";
import { Timer } from "@/components/timer/Timer";
import { TomatoMascot } from "@/components/timer/TomatoMascot";
import { QuotesPanel } from "@/components/timer/QuotesPanel";

export default function TimerPage() {
  const settings = useStore((s) => s.settings);

  // Single Timer rendered once. Two Timer mounts on the same page each start
  // their own tick interval, decrementing the shared store and halving the
  // recorded session duration — do not split this into two layouts.
  return (
    <div className="flex w-full flex-col items-center gap-10 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-start lg:justify-items-center lg:gap-20">
      <div className="lg:col-start-2 lg:row-start-1">
        <Timer />
      </div>

      {(settings.showMascot || settings.showQuotes) && (
        <div className="flex w-full items-start justify-center gap-8 lg:contents">
          {settings.showMascot && (
            <div className="flex flex-col items-center lg:col-start-1 lg:row-start-1 lg:pt-24">
              <TomatoMascot />
            </div>
          )}
          {settings.showQuotes && (
            <div className="flex flex-col lg:col-start-3 lg:row-start-1 lg:pt-24">
              <QuotesPanel />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
