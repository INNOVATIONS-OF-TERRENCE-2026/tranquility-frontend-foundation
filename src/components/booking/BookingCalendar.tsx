import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import { es as esLocale } from "date-fns/locale";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { Calendar } from "@/components/ui/calendar";
import { getBookingAvailability } from "@/lib/booking.functions";
import type { FrequencyId, ServiceId } from "@/config/pricing";

const windows = [
  { id: "morning", en: "8–11 AM", es: "8–11 AM" },
  { id: "midday", en: "11 AM–2 PM", es: "11 AM–2 PM" },
  { id: "afternoon", en: "2–5 PM", es: "2–5 PM" },
] as const;

function iso(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function BookingCalendar({
  service,
  date,
  window,
  onChange,
}: {
  service: ServiceId;
  frequency: FrequencyId;
  date: string;
  window: string;
  onChange: (date: string, window: string) => void;
}) {
  const { language, text } = useLanguage();
  const fetchAvailability = useServerFn(getBookingAvailability);
  const [month, setMonth] = useState(() => (date ? new Date(`${date}T12:00:00`) : new Date()));
  const [availability, setAvailability] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const startDate = iso(startOfMonth(month));
    const endDate = iso(endOfMonth(addMonths(month, 1)));
    void fetchAvailability({ data: { startDate, endDate, service } })
      .then((result) => {
        if (active) setAvailability(result);
      })
      .catch(() => {
        if (active)
          setError(
            text({
              en: "Availability could not be loaded.",
              es: "No se pudo cargar la disponibilidad.",
            }),
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchAvailability, month, service, text]);

  const selected = date ? new Date(`${date}T12:00:00`) : undefined;
  const fullDates = useMemo(
    () =>
      Object.entries(availability)
        .filter(([, slots]) => Object.values(slots).every((count) => count === 0))
        .map(([value]) => new Date(`${value}T12:00:00`)),
    [availability],
  );
  const limitedDates = useMemo(
    () =>
      Object.entries(availability)
        .filter(
          ([, slots]) =>
            !Object.values(slots).every((count) => count === 0) &&
            Object.values(slots).some((count) => count <= 2),
        )
        .map(([value]) => new Date(`${value}T12:00:00`)),
    [availability],
  );
  const selectedSlots = date ? availability[date] : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(18rem,22rem)_1fr]">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Calendar
          mode="single"
          selected={selected}
          month={month}
          onMonthChange={setMonth}
          onSelect={(value) => onChange(value ? iso(value) : "", "")}
          locale={language === "es" ? esLocale : undefined}
          disabled={[{ before: new Date() }, { dayOfWeek: [0, 6] }, ...fullDates]}
          modifiers={{ limited: limitedDates }}
          modifiersClassNames={{
            limited: "after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-gold",
          }}
          className="pointer-events-auto w-full p-4 [--cell-size:2.6rem]"
        />
      </div>
      <div aria-live="polite">
        <p className="text-sm font-semibold text-ink">
          {selected
            ? format(
                selected,
                language === "es" ? "PPP" : "EEEE, MMMM d, yyyy",
                language === "es" ? { locale: esLocale } : undefined,
              )
            : text({
                en: "Choose an available weekday",
                es: "Elige un día disponible entre semana",
              })}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {text({
            en: "Gold dots indicate limited availability. Capacity is shown for your selected service.",
            es: "Los puntos dorados indican disponibilidad limitada. La capacidad se muestra para el servicio seleccionado.",
          })}
        </p>
        {loading && (
          <p className="mt-5 text-sm text-muted-foreground">
            {text({ en: "Checking availability…", es: "Verificando disponibilidad…" })}
          </p>
        )}
        {error && (
          <p className="mt-5 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {selected && selectedSlots && !loading && (
          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {windows.map((item) => {
              const remaining = selectedSlots[item.id] ?? 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={remaining === 0}
                  aria-pressed={window === item.id}
                  onClick={() => onChange(date, item.id)}
                  className={`min-h-20 rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${window === item.id ? "border-moss bg-accent text-ink" : "border-border bg-card hover:border-moss/60"}`}
                >
                  <span className="block text-sm font-semibold">
                    {language === "es" ? item.es : item.en}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {remaining === 0
                      ? text({ en: "Full", es: "Lleno" })
                      : `${remaining} ${text({ en: "available", es: "disponibles" })}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
