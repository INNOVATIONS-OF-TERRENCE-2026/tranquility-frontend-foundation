import { business } from "@/config/business";
import {
  addOns,
  availableFrequencies,
  buildEstimate,
  money,
  services,
  type FrequencyId,
  type ServiceId,
} from "@/config/pricing";
import type { LucyAction, LucyLanguage, LucyReply } from "@/lib/lucy.types";
import { serviceName } from "@/lib/lucy.knowledge";

const SAFE_ROUTES = [
  "/",
  "/services",
  "/residential-cleaning",
  "/deep-cleaning",
  "/move-in-move-out-cleaning",
  "/service-area",
  "/booking",
  "/quote",
  "/contact",
  "/faq",
  "/about",
  "/careers",
];

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function detectService(value: string): ServiceId | null {
  if (includesAny(value, ["deep", "profunda", "profundo"])) return "deep";
  if (
    includesAny(value, [
      "move-in",
      "move in",
      "move-out",
      "move out",
      "mudanza",
      "entrada",
      "salida",
    ])
  ) {
    return "move";
  }
  if (includesAny(value, ["standard", "regular", "estándar", "estandar"])) return "standard";
  return null;
}

function detectFrequency(value: string): FrequencyId {
  if (
    includesAny(value, [
      "biweekly",
      "bi-weekly",
      "every two weeks",
      "cada dos semanas",
      "quincenal",
    ])
  ) {
    return "biweekly";
  }
  if (includesAny(value, ["weekly", "every week", "semanal"])) return "weekly";
  if (includesAny(value, ["monthly", "once a month", "mensual"])) return "monthly";
  return "onetime";
}

function extractCount(value: string, patterns: RegExp[], fallback: number) {
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) {
      const parsed = Number(match[1]);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return fallback;
}

function detectExtras(value: string) {
  const mapping: Array<[string, string[]]> = [
    ["oven", ["oven", "horno"]],
    ["fridge", ["fridge", "refrigerator", "refrigerador"]],
    ["dishes", ["dishes", "platos"]],
    ["hood", ["hood", "vent", "campana"]],
    ["cabinets", ["cabinet", "gabinete"]],
    ["pet-hair", ["pet hair", "pelo de mascota", "pelo mascota"]],
    ["baseboards", ["baseboard", "zócalo", "zocalo"]],
    ["garage-patio", ["garage", "patio", "garaje"]],
    ["carpet-spot", ["carpet spot", "alfombra"]],
    ["laundry-wdf", ["wash dry fold", "wash, dry", "lavar secar", "lavandería completa"]],
    ["laundry-fold", ["fold only", "solo doblar"]],
  ];

  return mapping
    .filter(([, terms]) => includesAny(value, terms))
    .map(([id]) => id)
    .filter((id) => addOns.some((item) => item.id === id));
}

function bookingHref(input: {
  service: ServiceId;
  frequency: FrequencyId;
  bedrooms: number;
  fullBaths: number;
  halfBaths: number;
  sqft: number | null;
  extras: string[];
}) {
  const params = new URLSearchParams();
  params.set("service", input.service);
  if (input.service === "standard") params.set("frequency", input.frequency);
  params.set("bedrooms", String(input.bedrooms));
  params.set("fullBaths", String(input.fullBaths));
  if (input.halfBaths > 0) params.set("halfBaths", String(input.halfBaths));
  if (input.sqft) params.set("sqft", String(input.sqft));
  if (input.extras.length > 0) params.set("extras", input.extras.join(","));
  return "/booking?" + params.toString();
}

export function sanitizeLucyActions(actions: LucyAction[]) {
  return actions
    .map((action): LucyAction | null => {
      if (action.type === "call") return { ...action, href: business.phoneHref };
      if (action.type === "contact") {
        if (action.href?.startsWith("mailto:")) return { ...action, href: business.emailHref };
        return { ...action, href: "/contact" };
      }
      if (action.type === "start_quote") return { ...action, href: "/quote" };
      if (action.type === "start_booking") {
        return action.href?.startsWith("/booking")
          ? action
          : { ...action, href: "/booking" };
      }
      if (!action.href) return action;
      if (
        action.href.startsWith("/") &&
        !action.href.startsWith("//") &&
        SAFE_ROUTES.some(
          (route) => action.href === route || action.href.startsWith(route + "?"),
        )
      ) {
        return action;
      }
      return null;
    })
    .filter((action): action is LucyAction => action !== null);
}

export function deterministicLucyReply(
  question: string,
  language: LucyLanguage,
  activeCities: string[],
): LucyReply | null {
  const value = question.toLowerCase();
  const service = detectService(value);

  const asksEstimate =
    service !== null &&
    includesAny(value, [
      "how much",
      "price",
      "cost",
      "estimate",
      "quote",
      "cuánto",
      "cuanto",
      "precio",
      "costo",
      "calcula",
      "estimado",
    ]);

  if (service && asksEstimate) {
    const bedrooms = extractCount(
      value,
      [/(\d{1,2})\s*(?:bedrooms?|beds?|br)\b/i, /(\d{1,2})\s*(?:dormitorios?|habitaciones?)\b/i],
      1,
    );
    const fullBaths = extractCount(
      value,
      [
        /(\d{1,2})\s*(?:full baths?|bathrooms?|baths?)\b/i,
        /(\d{1,2})\s*(?:baños completos?|banos completos?|baños?|banos?)\b/i,
      ],
      1,
    );
    const halfBaths = extractCount(
      value,
      [/(\d{1,2})\s*(?:half baths?)\b/i, /(\d{1,2})\s*(?:medios baños?|medios banos?)\b/i],
      0,
    );
    const sqft = extractCount(
      value,
      [
        /(\d{3,5})\s*(?:sq\.?\s*ft|sqft|square feet)\b/i,
        /(\d{3,5})\s*(?:pies cuadrados)\b/i,
      ],
      0,
    );
    const frequency = service === "standard" ? detectFrequency(value) : "onetime";
    const extrasList = detectExtras(value);
    const extras = Object.fromEntries(extrasList.map((id) => [id, 1]));
    const estimate = buildEstimate({
      service,
      frequency,
      scope: {
        bedrooms: Math.max(1, bedrooms),
        fullBaths: Math.max(1, fullBaths),
        halfBaths: Math.max(0, halfBaths),
        livingRooms: 0,
        diningRooms: 0,
        offices: 0,
        laundryRooms: 0,
      },
      extras,
      sqft: sqft || null,
    });

    const answer =
      language === "es"
        ? "Para " +
          bedrooms +
          " dormitorio(s) y " +
          fullBaths +
          " baño(s) completo(s), el estimado actual de " +
          serviceName(service, language) +
          " es " +
          money(estimate.total) +
          ". Este cálculo usa directamente el motor de precios de Tranquility. Los detalles finales se confirman antes de la limpieza."
        : "For " +
          bedrooms +
          " bedroom(s) and " +
          fullBaths +
          " full bathroom(s), the current " +
          serviceName(service, language) +
          " estimate is " +
          money(estimate.total) +
          ". This uses Tranquility's actual pricing engine. Final service details are confirmed before cleaning.";

    return {
      answer,
      intent: "price_estimate",
      confidence: "high",
      actions: sanitizeLucyActions([
        {
          type: "start_booking",
          label: language === "es" ? "Configurar esta limpieza" : "Configure this cleaning",
          href: bookingHref({
            service,
            frequency,
            bedrooms,
            fullBaths,
            halfBaths,
            sqft: sqft || null,
            extras: extrasList,
          }),
        },
        {
          type: "start_quote",
          label: language === "es" ? "Pedir cotización personalizada" : "Request a custom quote",
          href: "/quote",
        },
      ]),
      followUps:
        language === "es"
          ? ["¿Qué incluye este servicio?", "¿Qué adicionales están disponibles?"]
          : ["What is included in this service?", "What add-ons are available?"],
      factSources: ["Tranquility pricing engine", "Approved service configuration"],
      estimate: {
        service: serviceName(service, language),
        frequency:
          availableFrequencies(service).find((item) => item.id === frequency)?.name ?? "One-time",
        total: estimate.total,
        totalLabel: money(estimate.total),
        lines: [
          {
            label: language === "es" ? "Servicio" : "Service",
            quantity: 1,
            amount: estimate.serviceSubtotal,
            amountLabel: money(estimate.serviceSubtotal),
          },
          ...estimate.addOnLines.map((line) => ({
            label: line.label,
            quantity: line.qty,
            amount: line.total,
            amountLabel: money(line.total),
          })),
        ],
        reviewFlags: estimate.reviewFlags,
      },
    };
  }

  if (
    includesAny(value, ["compare", "difference", "different", "versus", " vs ", "diferencia", "compara"]) &&
    includesAny(value, ["standard", "deep", "move", "estándar", "estandar", "profunda", "mudanza"])
  ) {
    const standard = services.find((item) => item.id === "standard")!;
    const deep = services.find((item) => item.id === "deep")!;
    const move = services.find((item) => item.id === "move")!;
    return {
      answer:
        language === "es"
          ? "Standard Clean comienza en " +
            money(standard.basePrice) +
            " y está pensado para mantenimiento regular. Deep Clean comienza en " +
            money(deep.basePrice) +
            " y añade un nivel más detallado para acumulación, bordes y zonas que la rutina suele pasar por alto. Move-In / Move-Out comienza en " +
            money(move.basePrice) +
            " y está diseñado para viviendas vacías o casi vacías durante una transición."
          : "Standard Clean starts at " +
            money(standard.basePrice) +
            " and is designed for regular upkeep. Deep Clean starts at " +
            money(deep.basePrice) +
            " and adds a more detailed reset for buildup, edges, and areas routine cleaning can miss. Move-In / Move-Out starts at " +
            money(move.basePrice) +
            " and is designed for empty or nearly empty homes in transition.",
      intent: "service_comparison",
      confidence: "high",
      actions: sanitizeLucyActions([
        {
          type: "navigate",
          label: language === "es" ? "Ver todos los servicios" : "View all services",
          href: "/services",
        },
        {
          type: "start_booking",
          label: language === "es" ? "Configurar una limpieza" : "Configure a cleaning",
          href: "/booking",
        },
      ]),
      followUps:
        language === "es"
          ? ["¿Cuál es mejor para mi hogar?", "Calcula una limpieza profunda"]
          : ["Which one fits my home?", "Estimate a Deep Clean"],
      factSources: ["Approved Tranquility services", "Tranquility pricing engine"],
    };
  }

  if (
    includesAny(value, [
      "service",
      "serve",
      "coverage",
      "covered",
      "area",
      "city",
      "atienden",
      "cubren",
      "cobertura",
      "ciudad",
    ])
  ) {
    const matched = activeCities.find((city) => value.includes(city.toLowerCase()));
    if (matched) {
      return {
        answer:
          language === "es"
            ? "Sí. " + matched + " aparece actualmente como una ciudad activa en el área de servicio de Tranquility."
            : "Yes. " + matched + " is currently listed as an active Tranquility service city.",
        intent: "service_area",
        confidence: "high",
        actions: sanitizeLucyActions([
          {
            type: "navigate",
            label: language === "es" ? "Ver área de servicio" : "View service area",
            href: "/service-area",
          },
          {
            type: "start_booking",
            label: language === "es" ? "Comenzar reserva" : "Start booking",
            href: "/booking",
          },
        ]),
        followUps:
          language === "es"
            ? ["¿Qué servicio me recomiendas?", "Calcula mi limpieza"]
            : ["Which service do you recommend?", "Estimate my cleaning"],
        factSources: ["Live Tranquility service-area data"],
      };
    }

    if (
      includesAny(value, ["where", "which cities", "list", "dónde", "donde", "qué ciudades", "que ciudades"])
    ) {
      return {
        answer:
          language === "es"
            ? "Las ciudades activas actuales incluyen: " +
              activeCities.join(", ") +
              ". Si tu ciudad no aparece, Lucy no asumirá cobertura. Tranquility puede revisar tu ubicación mediante una cotización o contacto directo."
            : "Current active service cities include: " +
              activeCities.join(", ") +
              ". If your city is not listed, Lucy will not assume coverage. Tranquility can review your location through a quote or direct contact.",
        intent: "service_area",
        confidence: "high",
        actions: sanitizeLucyActions([
          {
            type: "navigate",
            label: language === "es" ? "Explorar área de servicio" : "Explore service area",
            href: "/service-area",
          },
          {
            type: "contact",
            label: language === "es" ? "Preguntar a Tranquility" : "Ask Tranquility",
            href: "/contact",
          },
        ]),
        followUps: [],
        factSources: ["Live Tranquility service-area data"],
      };
    }
  }

  if (includesAny(value, ["book", "schedule", "reserve", "reservar", "agenda", "agendar"])) {
    return {
      answer:
        language === "es"
          ? "Puedo llevarte al flujo real de reserva para elegir servicio, alcance, fecha y ventana de llegada."
          : "I can take you into the real booking flow to choose service, scope, date, and arrival window.",
      intent: "booking",
      confidence: "high",
      actions: sanitizeLucyActions([
        {
          type: "start_booking",
          label: language === "es" ? "Comenzar reserva" : "Start booking",
          href: "/booking",
        },
      ]),
      followUps: [],
      factSources: ["Tranquility booking workflow"],
    };
  }

  if (includesAny(value, ["custom quote", "cotización", "cotizacion", "custom scope"])) {
    return {
      answer:
        language === "es"
          ? "Para un alcance personalizado, Tranquility usa el flujo de cotización para revisar los detalles antes de confirmar el servicio."
          : "For custom scope, Tranquility uses the quote flow to review the details before service is confirmed.",
      intent: "custom_quote",
      confidence: "high",
      actions: sanitizeLucyActions([
        {
          type: "start_quote",
          label: language === "es" ? "Solicitar cotización" : "Request a quote",
          href: "/quote",
        },
      ]),
      followUps: [],
      factSources: ["Tranquility quote workflow"],
    };
  }

  return null;
}

export function lucyPublicFallback(language: LucyLanguage): LucyReply {
  return {
    answer:
      language === "es"
        ? "Puedo ayudarte con servicios, precios verificados, áreas de servicio, reservas y cotizaciones. Para una recomendación precisa, dime qué tipo de hogar tienes y qué quieres limpiar."
        : "I can help with services, verified pricing, service areas, booking, and custom quotes. For a precise recommendation, tell me what kind of home you have and what you want cleaned.",
    intent: "concierge_help",
    confidence: "high",
    actions: sanitizeLucyActions([
      {
        type: "navigate",
        label: language === "es" ? "Ver servicios" : "View services",
        href: "/services",
      },
      {
        type: "start_booking",
        label: language === "es" ? "Comenzar reserva" : "Start booking",
        href: "/booking",
      },
    ]),
    followUps:
      language === "es"
        ? ["Compara Standard y Deep Clean", "Calcula una limpieza de 3 dormitorios"]
        : ["Compare Standard and Deep Clean", "Estimate a 3 bedroom Deep Clean"],
    factSources: ["Tranquility first-party service information"],
  };
}
