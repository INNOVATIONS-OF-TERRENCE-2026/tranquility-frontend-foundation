import { Laptop, Moon, Sun } from "lucide-react";

import { useTheme, type ThemePreference } from "./ThemeProvider";

const options: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const Icon = preference === "light" ? Sun : preference === "dark" ? Moon : Laptop;

  if (compact) {
    const order: ThemePreference[] = ["light", "dark", "system"];
    const currentIndex = order.indexOf(preference);
    const nextPreference = order[(currentIndex + 1) % order.length] ?? "system";

    return (
      <button
        type="button"
        onClick={() => setPreference(nextPreference)}
        aria-label={`Appearance ${preference}. Switch to ${nextPreference}. Current resolved appearance ${resolvedTheme}.`}
        className="inline-flex h-9 w-[3.9rem] items-center justify-between rounded-full border border-gold/35 bg-night/75 px-2 text-gold-soft shadow-soft backdrop-blur-md transition hover:border-gold/65 hover:bg-night"
      >
        <Icon className="size-4" aria-hidden="true" />
        <span className="size-3 rounded-full border border-gold/40 bg-[radial-gradient(circle_at_30%_25%,white_0%,var(--gold-soft)_30%,var(--gold)_100%)] shadow-[0_0_10px_color-mix(in_srgb,var(--gold)_55%,transparent)]" aria-hidden="true" />
      </button>
    );
  }

  return (
    <label className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/25 bg-card/85 px-3.5 text-sm text-foreground shadow-soft backdrop-blur-sm">
      <Icon className="size-4 text-moss" aria-hidden="true" />
      <span className="text-xs font-semibold text-muted-foreground">Theme</span>
      <select
        value={preference}
        onChange={(event) => setPreference(event.target.value as ThemePreference)}
        aria-label={`Theme preference. Current appearance: ${resolvedTheme}`}
        className="min-h-9 cursor-pointer bg-transparent pr-1 text-sm font-semibold text-ink outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
