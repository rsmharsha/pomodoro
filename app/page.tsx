"use client";

import { useStore } from "@/lib/store";
import { Timer } from "@/components/timer/Timer";
import { TomatoMascot } from "@/components/timer/TomatoMascot";
import { QuotesPanel } from "@/components/timer/QuotesPanel";

export default function TimerPage() {
  const settings = useStore((s) => s.settings);

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Desktop: Mascot ← Timer → Quotes */}
      <div className="hidden lg:flex lg:flex-row lg:items-start lg:justify-center lg:gap-20 w-full">
        {settings.showMascot && (
          <div className="flex flex-col items-center pt-24">
            <TomatoMascot />
          </div>
        )}
        <Timer />
        {settings.showQuotes && (
          <div className="flex flex-col pt-24">
            <QuotesPanel />
          </div>
        )}
      </div>

      {/* Mobile: Timer first, then mascot + quotes side by side */}
      <div className="flex flex-col items-center gap-8 w-full lg:hidden">
        <Timer />
        {(settings.showMascot || settings.showQuotes) && (
          <div className="flex items-start gap-8 w-full justify-center">
            {settings.showMascot && <TomatoMascot />}
            {settings.showQuotes && <QuotesPanel />}
          </div>
        )}
      </div>
    </div>
  );
}
