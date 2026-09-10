import { Check } from "lucide-react";

import { studioSteps } from "@/config/studio";
import type { StudioStepId } from "@/types/studio";

export function StudioProgress({
  current,
  completed,
  onSelect,
}: {
  current: StudioStepId;
  completed: StudioStepId[];
  onSelect: (step: StudioStepId) => void;
}) {
  return (
    <nav aria-label="Tranquility Studio steps">
      <ol className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {studioSteps.map((step, index) => {
          const active = step.id === current;
          const done = completed.includes(step.id);
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onSelect(step.id)}
                aria-current={active ? "step" : undefined}
                className={`surface-interactive flex min-h-12 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left ${
                  active
                    ? "border-moss bg-accent/60 text-ink shadow-soft"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-card"
                }`}
              >
                <span
                  className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    done ? "border-moss bg-moss text-primary-foreground" : "border-border bg-background"
                  }`}
                >
                  {done ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{step.short}</span>
                  <span className="hidden text-xs text-muted-foreground lg:block">{step.label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
