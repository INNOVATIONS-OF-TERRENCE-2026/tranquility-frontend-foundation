import { Check, Palette, RotateCcw, Sparkles, X } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { colorPalettes, defaultColorPaletteId, getColorPalette } from "@/config/colorPalettes";
import { useTheme } from "./ThemeProvider";

const STORAGE_KEY = "tlc-color-palette-v2";

type VariableSet = Record<string, string>;

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function toHex(value: number) {
  return Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
}

function mixHex(a: string, b: string, weight: number) {
  const first = hexToRgb(a);
  const second = hexToRgb(b);
  const mix = (left: number, right: number) => left * (1 - weight) + right * weight;
  return `#${toHex(mix(first.r, second.r))}${toHex(mix(first.g, second.g))}${toHex(mix(first.b, second.b))}`;
}

function readableText(background: string) {
  const { r, g, b } = hexToRgb(background);
  const srgb = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * srgb[0]! + 0.7152 * srgb[1]! + 0.0722 * srgb[2]!;
  return luminance > 0.48 ? "#07151B" : "#FFFFFF";
}

function buildVariables(primary: string, secondary: string, dark: boolean): VariableSet {
  const oceanNight = "#071B27";
  const oceanDeep = "#0B2733";
  const mistLight = "#F4FAF9";
  const mistCard = "#FBFEFD";
  const champagne = "#D0AE69";
  const champagneSoft = "#EAD9B4";
  const visiblePrimary = dark ? mixHex(primary, "#FFFFFF", 0.22) : mixHex(primary, "#0B2733", 0.08);
  const visibleSecondary = dark ? mixHex(secondary, "#FFFFFF", 0.08) : secondary;
  const background = dark ? mixHex(oceanNight, primary, 0.035) : mixHex(mistLight, primary, 0.018);
  const card = dark ? mixHex("#0C2634", primary, 0.045) : mixHex(mistCard, secondary, 0.014);
  const foreground = dark ? "#F1F8F7" : "#17303D";
  const mutedForeground = dark ? "#B9CDCF" : "#647983";
  const border = dark ? mixHex("#35505A", primary, 0.08) : mixHex("#D1DFDF", primary, 0.045);
  const accent = dark ? mixHex("#102F3D", primary, 0.18) : mixHex("#E5F2F1", primary, 0.09);
  const primarySoft = mixHex(visiblePrimary, "#FFFFFF", dark ? 0.12 : 0.48);
  const secondarySoft = mixHex(visibleSecondary, "#FFFFFF", dark ? 0.16 : 0.4);

  return {
    "--background": background,
    "--foreground": foreground,
    "--card": card,
    "--card-foreground": foreground,
    "--popover": card,
    "--popover-foreground": foreground,
    "--primary": visiblePrimary,
    "--primary-foreground": readableText(visiblePrimary),
    "--secondary": visibleSecondary,
    "--secondary-foreground": readableText(visibleSecondary),
    "--muted": dark ? "#102B38" : "#EAF3F2",
    "--muted-foreground": mutedForeground,
    "--accent": accent,
    "--accent-foreground": dark ? "#F7FBFA" : "#16323D",
    "--border": border,
    "--input": dark ? "#47636D" : "#BCCFD0",
    "--ring": primarySoft,
    "--sand": dark ? "#0C2430" : "#EEF6F4",
    "--stone-soft": dark ? "#15313C" : "#E2ECEB",
    "--moss": visiblePrimary,
    "--moss-soft": primarySoft,
    "--oak": champagne,
    "--ink": dark ? "#F7FBFA" : "#102933",
    "--night": oceanNight,
    "--night-foreground": "#F7FBFA",
    "--navy": oceanDeep,
    "--navy-soft": "#123A47",
    "--gold": champagne,
    "--gold-soft": champagneSoft,
    "--silver": dark ? "#D2DFE1" : "#9FAFB4",
    "--ivory": "#FBF8F1",
    "--sidebar": dark ? "#0A222E" : "#F0F7F6",
    "--sidebar-foreground": foreground,
    "--sidebar-primary": visiblePrimary,
    "--sidebar-primary-foreground": readableText(visiblePrimary),
    "--sidebar-accent": accent,
    "--sidebar-accent-foreground": dark ? "#F7FBFA" : "#16323D",
    "--sidebar-border": border,
    "--sidebar-ring": primarySoft,
    "--palette-from": primary,
    "--palette-to": secondary,
    "--palette-gradient": `linear-gradient(135deg, ${primary} 0%, ${mixHex(primary, secondary, 0.48)} 50%, ${secondary} 100%)`,
    "--palette-shine": `radial-gradient(circle at 24% 14%, rgba(255,255,255,0.58), transparent 24%), linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
    "--shadow-gold-token": `0 12px 38px -24px ${mixHex(champagne, primary, 0.2)}`,
    "--palette-secondary-soft": secondarySoft,
  };
}

function applyVariables(target: HTMLElement, variables: VariableSet) {
  Object.entries(variables).forEach(([property, value]) => target.style.setProperty(property, value));
}

function applyPalette(primary: string, secondary: string, resolvedTheme: "light" | "dark") {
  const root = document.documentElement;
  applyVariables(root, buildVariables(primary, secondary, resolvedTheme === "dark"));

  document.querySelectorAll<HTMLElement>(".brand-dark").forEach((element) => {
    applyVariables(element, buildVariables(primary, secondary, true));
  });

  const themeColor = document.querySelector('meta[name="theme-color"]');
  themeColor?.setAttribute("content", resolvedTheme === "dark" ? "#071B27" : "#F4FAF9");
}

export function ColorStudio({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme } = useTheme();
  const { text } = useLanguage();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(defaultColorPaletteId);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    setSelectedId(getColorPalette(saved).id);
  }, []);

  const selected = useMemo(() => getColorPalette(selectedId), [selectedId]);

  useEffect(() => {
    applyPalette(selected.primary, selected.secondary, resolvedTheme);
    document.documentElement.dataset['colorPalette'] = selected.id;
    window.localStorage.setItem(STORAGE_KEY, selected.id);
  }, [pathname, resolvedTheme, selected]);

  function choose(id: string) {
    setSelectedId(id);
  }

  function reset() {
    setSelectedId(defaultColorPaletteId);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`group inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:border-ring ${compact ? "size-9" : "min-h-11 px-3"}`}
      >
        <span
          aria-hidden="true"
          className="size-5 rounded-full border border-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_0_14px_rgba(255,255,255,0.12)]"
          style={{ background: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.9), transparent 22%), linear-gradient(135deg, ${selected.primary}, ${selected.secondary})` }}
        />
        {!compact && <span className="text-xs">{text({ en: "Colors", es: "Colores" })}</span>}
        <span className="sr-only">{text({ en: "Open color settings", es: "Abrir ajustes de color" })}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={text({ en: "Color settings", es: "Ajustes de color" })}
          className="fixed inset-x-3 top-[5.25rem] z-[90] max-h-[78vh] overflow-y-auto rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-lift md:left-auto md:right-5 md:top-24 md:w-[36rem]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-moss">
                <Palette className="size-4" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-[0.16em]">{text({ en: "Color palettes", es: "Paletas de color" })}</p>
              </div>
              <h2 className="mt-2 text-2xl">{text({ en: "32 polished color choices", es: "32 opciones de color refinadas" })}</h2>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
                {text({
                  en: "Each palette changes the accent system, gradients, buttons, highlights, and interactive states while the core ocean-mist surfaces keep text readable in Light, Dark, and System mode.",
                  es: "Cada paleta cambia los acentos, degradados, botones, reflejos y estados interactivos, mientras que las superficies base inspiradas en brisa marina mantienen el texto legible en los modos Claro, Oscuro y Sistema.",
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={text({ en: "Close color settings", es: "Cerrar ajustes de color" })}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-ink"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div
            className="mt-5 overflow-hidden rounded-2xl border border-white/25 p-5 text-white shadow-lift"
            style={{ background: `radial-gradient(circle at 20% 10%, rgba(255,255,255,0.42), transparent 25%), linear-gradient(135deg, ${selected.primary}, ${selected.secondary})` }}
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/85">{text({ en: "Current palette", es: "Paleta actual" })}</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <p className="font-display text-3xl text-white drop-shadow">{selected.name}</p>
              <Sparkles className="size-6 text-white/90" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-8">
            {colorPalettes.map((palette) => {
              const active = selected.id === palette.id;
              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => choose(palette.id)}
                  title={palette.name}
                  aria-label={text({ en: `Use ${palette.name} palette`, es: `Usar la paleta ${palette.name}` })}
                  aria-pressed={active}
                  className={`group relative aspect-square overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 ${active ? "border-ink ring-2 ring-ring ring-offset-2 ring-offset-background" : "border-border"}`}
                  style={{ background: `radial-gradient(circle at 25% 15%, rgba(255,255,255,0.72), transparent 22%), linear-gradient(135deg, ${palette.primary}, ${palette.secondary})` }}
                >
                  <span className="absolute inset-x-1 bottom-1 rounded-lg bg-black/45 px-1 py-1 text-[0.5rem] font-bold uppercase tracking-wide text-white">
                    {palette.name}
                  </span>
                  {active && (
                    <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-white text-black shadow">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">{text({ en: "Saved on this device only.", es: "Se guarda solo en este dispositivo." })}</p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border px-4 text-xs font-semibold text-ink hover:bg-accent"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" /> {text({ en: "Reset to Ocean Mist", es: "Restablecer a Brisa Marina" })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
