import { Check, Palette, RotateCcw, Sparkles, X } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { colorPalettes, defaultColorPaletteId, getColorPalette } from "@/config/colorPalettes";
import { useTheme } from "./ThemeProvider";

const STORAGE_KEY = "tlc-color-palette";

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
  return luminance > 0.48 ? "#07111F" : "#FFFDF8";
}

function buildVariables(primary: string, secondary: string, dark: boolean): VariableSet {
  const lightBase = "#FCFBF8";
  const darkBase = "#050810";
  const visiblePrimary = dark ? mixHex(primary, "#FFFFFF", 0.34) : primary;
  const visibleSecondary = dark ? mixHex(secondary, "#FFFFFF", 0.12) : secondary;
  const background = dark ? mixHex(darkBase, primary, 0.16) : mixHex(lightBase, primary, 0.04);
  const card = dark ? mixHex("#0A1020", primary, 0.12) : mixHex("#FFFFFF", secondary, 0.025);
  const foreground = dark ? "#F8FAFC" : "#152136";
  const mutedForeground = dark ? "#C9D1DC" : "#5D6879";
  const border = dark ? mixHex("#526174", primary, 0.18) : mixHex("#D2D7DE", primary, 0.1);
  const accent = dark ? mixHex("#111827", primary, 0.25) : mixHex("#F7F8FA", secondary, 0.15);
  const night = mixHex("#02050B", primary, 0.19);
  const primarySoft = mixHex(visiblePrimary, "#FFFFFF", dark ? 0.14 : 0.38);
  const secondarySoft = mixHex(visibleSecondary, "#FFFFFF", dark ? 0.12 : 0.34);

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
    "--muted": dark ? mixHex(background, "#FFFFFF", 0.07) : mixHex(background, "#000000", 0.035),
    "--muted-foreground": mutedForeground,
    "--accent": accent,
    "--accent-foreground": dark ? "#F8FAFC" : "#101827",
    "--border": border,
    "--input": mixHex(border, dark ? "#FFFFFF" : "#000000", dark ? 0.12 : 0.05),
    "--ring": primarySoft,
    "--sand": dark ? mixHex(background, visibleSecondary, 0.07) : mixHex("#FAF7F0", secondary, 0.065),
    "--stone-soft": dark ? mixHex(background, "#FFFFFF", 0.09) : mixHex("#EEF0F3", primary, 0.055),
    "--moss": visiblePrimary,
    "--moss-soft": primarySoft,
    "--oak": visibleSecondary,
    "--ink": dark ? "#FFFFFF" : mixHex("#0A1729", primary, 0.075),
    "--night": night,
    "--night-foreground": "#FFFDF8",
    "--navy": night,
    "--navy-soft": mixHex(night, primary, 0.23),
    "--gold": visibleSecondary,
    "--gold-soft": secondarySoft,
    "--silver": dark ? "#D7DEE8" : mixHex("#B8C2CF", primary, 0.07),
    "--ivory": dark ? "#FFFDF8" : mixHex("#FFFDF7", secondary, 0.025),
    "--sidebar": dark ? mixHex(background, primary, 0.08) : mixHex("#F7F8FA", primary, 0.045),
    "--sidebar-foreground": foreground,
    "--sidebar-primary": visiblePrimary,
    "--sidebar-primary-foreground": readableText(visiblePrimary),
    "--sidebar-accent": accent,
    "--sidebar-accent-foreground": dark ? "#F8FAFC" : "#101827",
    "--sidebar-border": border,
    "--sidebar-ring": primarySoft,
    "--palette-from": primary,
    "--palette-to": secondary,
    "--palette-gradient": `linear-gradient(135deg, ${primary} 0%, ${mixHex(primary, secondary, 0.5)} 48%, ${secondary} 100%)`,
    "--palette-shine": `radial-gradient(circle at 24% 14%, rgba(255,255,255,0.5), transparent 24%), linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
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
  themeColor?.setAttribute(
    "content",
    resolvedTheme === "dark" ? mixHex("#02050B", primary, 0.2) : mixHex("#FCFBF8", primary, 0.045),
  );
}

export function ColorStudio({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme } = useTheme();
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
    document.documentElement.dataset.colorPalette = selected.id;
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
        className={`group inline-flex items-center justify-center gap-2 rounded-full border border-gold/30 bg-card/90 font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:border-gold/55 ${compact ? "size-10" : "min-h-11 px-3"}`}
      >
        <span
          aria-hidden="true"
          className="size-5 rounded-full border border-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_0_16px_rgba(255,255,255,0.18)]"
          style={{ background: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.9), transparent 22%), linear-gradient(135deg, ${selected.primary}, ${selected.secondary})` }}
        />
        {!compact && <span className="text-xs">Colors</span>}
        <span className="sr-only">Open TLC Color Studio</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="TLC Color Studio"
          className="fixed inset-x-3 top-[5.4rem] z-[90] max-h-[78vh] overflow-y-auto rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-lift backdrop-blur-2xl md:left-auto md:right-5 md:top-28 md:w-[36rem]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-moss">
                <Palette className="size-4" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-[0.16em]">TLC Color Studio</p>
              </div>
              <h2 className="mt-2 text-2xl">32 complete frontend palettes</h2>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
                Every choice recolors the full interface and recalculates readable text colors in Light, Dark, and System mode. Each palette includes a unique gradient and reflective highlight.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close TLC Color Studio"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-ink"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div
            className="mt-5 overflow-hidden rounded-2xl border border-white/25 p-5 text-white shadow-lift"
            style={{ background: `radial-gradient(circle at 20% 10%, rgba(255,255,255,0.42), transparent 25%), linear-gradient(135deg, ${selected.primary}, ${selected.secondary})` }}
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/85">Current palette</p>
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
                  aria-label={`Use ${palette.name} palette`}
                  aria-pressed={active}
                  className={`group relative aspect-square overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 ${active ? "border-ink ring-2 ring-ring ring-offset-2 ring-offset-background" : "border-border"}`}
                  style={{ background: `radial-gradient(circle at 25% 15%, rgba(255,255,255,0.72), transparent 22%), linear-gradient(135deg, ${palette.primary}, ${palette.secondary})` }}
                >
                  <span className="absolute inset-x-1 bottom-1 rounded-lg bg-black/42 px-1 py-1 text-[0.52rem] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
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
            <p className="text-xs text-muted-foreground">Saved locally on this device. No account required.</p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border px-4 text-xs font-semibold text-ink hover:bg-accent"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" /> Reset palette
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
