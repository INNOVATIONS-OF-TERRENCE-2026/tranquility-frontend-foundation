import { ChevronDown, MapPin, Navigation, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { serviceCities } from "@/config/business";

const radiusOptions = [10, 15, 20, 25, 30, 40, 50, 75] as const;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceMiles(first: { latitude: number; longitude: number }, second: { latitude: number; longitude: number }) {
  const earthRadiusMiles = 3958.8;
  const latDelta = toRadians(second.latitude - first.latitude);
  const lonDelta = toRadians(second.longitude - first.longitude);
  const lat1 = toRadians(first.latitude);
  const lat2 = toRadians(second.latitude);
  const haversine = Math.sin(latDelta / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(lonDelta / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function ServiceAreaExplorer() {
  const { text } = useLanguage();
  const [selectedName, setSelectedName] = useState("Dallas");
  const [radius, setRadius] = useState<(typeof radiusOptions)[number]>(25);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selected = serviceCities.find((city) => city.name === selectedName) ?? serviceCities[0]!;

  const matchingCities = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return serviceCities;
    return serviceCities.filter((city) => city.name.toLowerCase().includes(query));
  }, [search]);

  const nearbyCities = useMemo(
    () => serviceCities
      .map((city) => ({ city, miles: distanceMiles(selected, city) }))
      .filter(({ miles }) => miles <= radius)
      .sort((a, b) => a.miles - b.miles),
    [radius, selected],
  );

  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${selected.name}, Texas`)}&z=10&output=embed`;

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lift">
      <div className="grid lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="border-b border-border bg-sand/70 p-5 lg:border-b-0 lg:border-r lg:p-6">
          <div className="flex items-center gap-2 text-moss">
            <Navigation className="size-4" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.16em]">{text({ en: "Interactive service map", es: "Mapa interactivo de servicio" })}</p>
          </div>
          <h2 className="mt-3 text-2xl">{text({ en: "Find your DFW city", es: "Encuentra tu ciudad en DFW" })}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {text({
              en: "Search the listed service cities, choose a planning radius, and see which listed communities sit near your selected city.",
              es: "Busca entre las ciudades de servicio, elige un radio de planificación y consulta qué comunidades de la lista están cerca de la ciudad seleccionada.",
            })}
          </p>

          <div className="relative mt-6">
            <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-input bg-card px-4 text-left text-sm font-semibold text-ink shadow-soft">
              <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-moss" aria-hidden="true" />{selected.name}</span>
              <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>

            {open && (
              <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-2xl border border-border bg-popover shadow-lift">
                <div className="relative border-b border-border p-3">
                  <Search className="pointer-events-none absolute left-6 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={text({ en: "Search cities", es: "Buscar ciudades" })}
                    aria-label={text({ en: "Search service cities", es: "Buscar ciudades de servicio" })}
                    className="min-h-11 w-full rounded-xl border border-input bg-background pl-10 pr-10 text-sm text-ink outline-none focus:border-ring"
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch("")} aria-label={text({ en: "Clear city search", es: "Borrar búsqueda" })} className="absolute right-5 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-ink">
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                  {matchingCities.map((city) => (
                    <button key={city.name} type="button" onClick={() => { setSelectedName(city.name); setSearch(""); setOpen(false); }} className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm transition ${city.name === selected.name ? "bg-accent font-semibold text-accent-foreground" : "text-foreground hover:bg-muted"}`}>
                      {city.name}
                      {city.name === selected.name && <span className="text-[0.65rem] font-bold uppercase tracking-wider">{text({ en: "Selected", es: "Seleccionada" })}</span>}
                    </button>
                  ))}
                  {matchingCities.length === 0 && <p className="px-3 py-5 text-sm text-muted-foreground">{text({ en: "No listed city matches that search.", es: "Ninguna ciudad de la lista coincide con esa búsqueda." })}</p>}
                </div>
              </div>
            )}
          </div>

          <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground" htmlFor="service-radius">{text({ en: "Planning radius", es: "Radio de planificación" })}</label>
          <select id="service-radius" value={radius} onChange={(event) => setRadius(Number(event.target.value) as (typeof radiusOptions)[number])} className="mt-2 min-h-12 w-full rounded-2xl border border-input bg-card px-4 text-sm font-semibold text-ink shadow-soft outline-none focus:border-ring">
            {radiusOptions.map((option) => <option key={option} value={option}>{option} {text({ en: "miles", es: "millas" })}</option>)}
          </select>

          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-moss">{text({ en: `Within ${radius} miles of ${selected.name}`, es: `Dentro de ${radius} millas de ${selected.name}` })}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {nearbyCities.map(({ city, miles }) => (
                <button key={city.name} type="button" onClick={() => setSelectedName(city.name)} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:border-ring hover:text-ink">
                  {city.name} <span className="text-muted-foreground">{miles < 1 ? text({ en: "local", es: "local" }) : `${Math.round(miles)} mi`}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {text({
              en: "Radius results are a planning view of the listed cities, not a guarantee of service at every address. Exact coverage is confirmed when a customer submits an address.",
              es: "Los resultados del radio son una herramienta de planificación para las ciudades indicadas y no garantizan servicio en cada dirección. La cobertura exacta se confirma cuando el cliente proporciona su dirección.",
            })}
          </p>
        </div>

        <div className="relative min-h-[30rem] bg-muted lg:min-h-[38rem]">
          <iframe key={selected.name} title={text({ en: `Map centered on ${selected.name}, Texas`, es: `Mapa centrado en ${selected.name}, Texas` })} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 h-full w-full border-0" />
          <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/20 bg-black/70 px-4 py-3 text-white shadow-lift backdrop-blur-md">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/65">{text({ en: "Map center", es: "Centro del mapa" })}</p>
            <p className="mt-1 font-display text-xl text-white">{selected.name}, Texas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
