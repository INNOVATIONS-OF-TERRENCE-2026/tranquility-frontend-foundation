import { Laptop, Moon, Sun } from "lucide-react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { useTheme, type ThemePreference } from "./ThemeProvider";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const { text } = useLanguage();
  const Icon = preference === "light" ? Sun : preference === "dark" ? Moon : Laptop;
  const order: ThemePreference[] = ["light", "dark", "system"];
  const labels: Record<ThemePreference, { en: string; es: string }> = {
    light: { en: "Light", es: "Claro" },
    dark: { en: "Dark", es: "Oscuro" },
    system: { en: "System", es: "Sistema" },
  };

  if (compact) {
    const currentIndex = order.indexOf(preference);
    const nextPreference = order[(currentIndex + 1) % order.length] ?? "system";
    return (
      <button
        type="button"
        onClick={() => setPreference(nextPreference)}
        aria-label={text({
          en: `Appearance ${labels[preference].en}. Switch to ${labels[nextPreference].en}.`,
          es: `Apariencia ${labels[preference].es}. Cambiar a ${labels[nextPreference].es}.`,
        })}
        className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-moss shadow-soft transition hover:border-ring hover:bg-accent"
      >
        <Icon className="size-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <label className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm text-foreground shadow-soft">
      <Icon className="size-4 text-moss" aria-hidden="true" />
      <span className="text-xs font-semibold text-muted-foreground">{text({ en: "Appearance", es: "Apariencia" })}</span>
      <select
        value={preference}
        onChange={(event) => setPreference(event.target.value as ThemePreference)}
        aria-label={text({ en: `Appearance preference. Current mode: ${resolvedTheme}.`, es: `Preferencia de apariencia. Modo actual: ${resolvedTheme}.` })}
        className="min-h-9 cursor-pointer bg-transparent pr-1 text-sm font-semibold text-ink outline-none"
      >
        {order.map((value) => (
          <option key={value} value={value}>
            {text(labels[value])}
          </option>
        ))}
      </select>
    </label>
  );
}
