import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { CTABand } from "@/components/site/CTABand";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { ServiceAreaExplorer } from "@/components/site/ServiceAreaExplorer";
import { Button } from "@/components/ui/button";
import { business, cities } from "@/config/business";
import { seo } from "@/lib/seo";
import { listServiceCities } from "@/lib/service-area.functions";

export const Route = createFileRoute("/service-area")({
  head: () =>
    seo({
      title: "Service Area | Dallas-Fort Worth Cleaning | Tranquility Level Cleaning",
      description:
        "Explore Tranquility Level Cleaning service cities across Dallas-Fort Worth, including Euless, with an interactive map, searchable city selector, and radius planning tool.",
      path: "/service-area",
    }),
  component: ServiceAreaPage,
});

const cityGuides = [
  { to: "/house-cleaning-euless", name: "Euless" },
  { to: "/house-cleaning-bedford", name: "Bedford" },
  { to: "/house-cleaning-hurst", name: "Hurst" },
  { to: "/house-cleaning-colleyville", name: "Colleyville" },
  { to: "/house-cleaning-grapevine", name: "Grapevine" },
] as const;

function ServiceAreaPage() {
  const { text } = useLanguage();
  const loadCities = useServerFn(listServiceCities);
  const [cityNames, setCityNames] = useState<string[]>(cities);

  useEffect(() => {
    let active = true;
    void loadCities()
      .then((rows) => {
        if (active && rows.length > 0) setCityNames(rows.map((row) => row.name));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [loadCities]);
  return (
    <>
      <PageHero
        eyebrow={text({ en: "Service area", es: "Área de servicio" })}
        title={text({
          en: "DFW coverage you can actually explore",
          es: "Explora nuestra cobertura en DFW",
        })}
        intro={text({
          en: `Tranquility Level Cleaning works across ${business.serviceAreaLabel}. Search the current city list, inspect the map, and use the radius tool to understand nearby listed communities.`,
          es: "Tranquility Level Cleaning brinda servicio en Dallas-Fort Worth y comunidades cercanas. Busca en la lista actual de ciudades, consulta el mapa y usa la herramienta de radio para ver las comunidades cercanas incluidas.",
        })}
      />

      <section className="section">
        <div className="container-page">
          <ServiceAreaExplorer />
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page">
          <SectionHeading
            eyebrow={text({ en: "Core communities", es: "Comunidades principales" })}
            title={text({
              en: `${cityNames.length} listed DFW cities`,
              es: `${cityNames.length} ciudades de DFW incluidas`,
            })}
            intro={text({
              en: "The list includes Euless. Surrounding communities may also be considered after address review.",
              es: "La lista incluye Euless. También se pueden considerar comunidades cercanas después de revisar la dirección.",
            })}
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {cityNames.map((city) => (
              <li
                key={city}
                className="rounded-2xl border border-border bg-card px-5 py-4 text-base font-semibold text-ink shadow-soft"
              >
                {city}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow={text({ en: "City guides", es: "Guías por ciudad" })}
            title={text({
              en: "Local cleaning guides for the Mid-Cities",
              es: "Guías locales de limpieza para los Mid-Cities",
            })}
            intro={text({
              en: "Detailed pages for our home city of Euless and the neighboring communities we visit most.",
              es: "Páginas detalladas para nuestra ciudad de Euless y las comunidades vecinas que más visitamos.",
            })}
          />
          <ul className="mt-6 flex flex-wrap gap-3">
            {cityGuides.map((item) => (
              <li key={item.to}>
                <Button asChild variant="outline">
                  <Link to={item.to}>
                    <MapPin /> {item.name}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTABand
        title="Nearby but not listed?"
        titleEs="¿Estás cerca pero tu ciudad no aparece?"
        intro="Send your address and Tranquility can confirm whether the location falls within the current service reach."
        introEs="Envíanos tu dirección y Tranquility podrá confirmar si tu ubicación se encuentra dentro del área de servicio actual."
      />
    </>
  );
}
