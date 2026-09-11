import { Languages } from "lucide-react";

import { useLanguage, type Language } from "./LanguageProvider";

const options: { id: Language; short: string; label: string }[] = [
  { id: "en", short: "EN", label: "English" },
  { id: "es", short: "ES", label: "Español" },
];

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-gold/30 bg-card/90 text-ink shadow-soft backdrop-blur-xl ${compact ? "h-10 p-1" : "min-h-11 gap-1 p-1"}`}
      role="group"
      aria-label="Language / Idioma"
    >
      {!compact && <Languages className="ml-2 size-4 text-moss" aria-hidden="true" />}
      {options.map((option) => {
        const active = language === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setLanguage(option.id)}
            aria-pressed={active}
            aria-label={`Switch to ${option.label}`}
            className={`inline-flex min-h-8 min-w-9 items-center justify-center rounded-full px-2 text-[0.66rem] font-bold tracking-[0.1em] transition ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-ink"}`}
          >
            {option.short}
          </button>
        );
      })}
    </div>
  );
}
