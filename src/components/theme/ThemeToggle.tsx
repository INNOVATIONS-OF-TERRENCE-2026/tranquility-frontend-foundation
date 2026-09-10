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

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-md border border-border bg-card text-sm text-foreground shadow-sm ${
        compact ? "h-10 px-2.5" : "min-h-11 px-3"
      }`}
    >
      <Icon className="size-4 text-moss" aria-hidden="true" />
      <span className={compact ? "sr-only" : "text-xs font-semibold text-muted-foreground"}>Theme</span>
      <select
        value={preference}
        onChange={(event) => setPreference(event.target.value as ThemePreference)}
        aria-label={`Theme preference. Current appearance: ${resolvedTheme}`}
        className="min-h-9 cursor-pointer bg-transparent pr-1 text-sm font-medium text-ink outline-none"
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
