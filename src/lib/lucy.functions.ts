import { createServerFn } from "@tanstack/react-start";

import { business, cities as configuredCities } from "@/config/business";
import {
  addOns,
  availableFrequencies,
  buildEstimate,
  money,
  services,
  type FrequencyId,
  type ServiceId,
} from "@/config/pricing";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { publicKnowledgeSnapshot, serviceName } from "@/lib/lucy.knowledge";
import {
  lucyOwnerRequestSchema,
  lucyPublicRequestSchema,
  type LucyAction,
  type LucyLanguage,
  type LucyReply,
} from "@/lib/lucy.types";

const OWNER_EMAIL = "tlcllc26@gmail.com";
const SAFE_PUBLIC_ROUTES = [
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

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

function consumeRateLimit(sessionId: string) {
  const now = Date.now();
  const current = rateBuckets.get(sessionId);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(sessionId, { count: 1, resetAt: now + 10 * 60_000 });
    return true;
  }
  if (current.count >= 24) return false;
  current.count += 1;
  if (rateBuckets.size > 1200) {
    for (const [key, bucket] of rateBuckets) {
      if (bucket.resetAt <= now) rateBuckets.delete(key);
    }
  }
  return true;
}

function hasAny(text: string, values: string[]) {
  return values.some((value) => text.includes(value));
}

function detectService(text: string): ServiceId | null {
  if (hasAny(text, ["deep", "profunda", "profundo"])) return "deep";
  if (
    hasAny(text, [
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
  if (hasAny(text, ["standard", "regular", "estándar", "estandar"])) return "standard";
  return null;
}

function detectFrequency(text: string): FrequencyId {
  if (hasAny(text, ["biweekly", "bi-weekly", "every two weeks", "cada dos semanas"])) {
    return "biweekly";
  }
  if (hasAny(text, ["weekly", "every week", "semanal"])) return "weekly";
  if (hasAny(text, ["monthly", "once a month", "mensual"])) return "monthly";
  return "onetime";
}

function numberBefore(text: string, terms: string[]) {
  for (const term of terms) {
    const match = text.match(new RegExp("(\\d{1,5})\\s*" + term, "i"));
    if (match) return Number(match[1]);
  }
  return null;
}

function detectExtras(text: string) {
  const mapping: Array<[string, string[]]> = [
    ["oven", ["oven", "horno"]],
    ["fridge", ["fridge", "refrigerator", "refrigerador"]],
    ["dishes", ["dishes", "platos"]],
    ["hood", ["hood", "vent", "campana"]],
    ["cabinets", ["cabinet", "gabinete"]],
    ["pet-hair", ["pet hair", "pelo de mascota"]],
    ["baseboards", ["baseboard", "zócalo", "zocalo"]],
    ["garage-patio", ["garage", "patio", "garaje"]],
    ["carpet-spot", ["carpet spot", "alfombra"]],
    ["laundry-wdf", ["wash dry fold", "wash, dry", "lavar secar"]],
    ["laundry-fold", ["fold only", "solo doblar"]],
  ];
  return mapping
    .filter(([, terms]) => hasAny(text, terms))
    .map(([id]) => id)
    .filter((id) => addOns.some((item) => item.id === id));
}

function buildBookingHref(input: {
  service: ServiceId;
  frequency: FrequencyId;
  bedrooms: number;
  fullBaths: number;
  halfBaths: number;
  sqft?: number | null;
  extras: string[];
}) {
  const params = new URLSearchParams();
  params.set("service", input.service);
  if (input.service === "standard") params.set("frequency", input.frequency);
  params.set("bedrooms", String(input.bedrooms));
  params.set("fullBaths", String(input.fullBaths));
  if (input.halfBaths > 0) params.set("halfBaths", String(input.halfBaths));
  if (input.sqft) params.set("sqft", String(input.sqft));
  if (input.extras.length) params.set("extras", input.extras.join(","));
  return "/booking?" + params.toString();
}

function estimateReply(question: string, language: LucyLanguage): LucyReply | null {
  const text = question.toLowerCase();
  const service = detectService(text);
  const asksEstimate = hasAny(text, [
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
  const describesHome =
    /\d{1,2}\s*(?:bed|bedroom|bath|bathroom|dormitorio|habitaci[oó]n|ba[ñn]o)/i.test(text) ||
    hasAny(text, ["i need", "i want", "necesito", "quiero"]);

  if (!service || (!asksEstimate && !describesHome)) return null;

  const bedrooms =
    numberBefore(text, ["bedrooms?", "beds?", "br", "dormitorios?", "habitaciones?"]) ?? 1;
  const fullBaths =
    numberBefore(text, [
      "full baths?",
      "bathrooms?",
      "baths?",
      "baños completos?",
      "baños?",
    ]) ?? 1;
  const halfBaths =
    numberBefore(text, ["half baths?", "medios baños?", "medio baño"]) ?? 0;
  const sqft = numberBefore(text, [
    "sq\\s*ft",
    "sqft",
    "square\\s*feet",
    "pies\\s*cuadrados",
  ]);
  const frequency = service === "standard" ? detectFrequency(text) : "onetime";
  const extrasList = detectExtras(text);
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
    sqft,
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
    actions:
      estimate.reviewFlags.length > 0
        ? [
            {
              type: "start_quote",
              label:
                language === "es"
                  ? "Revisar alcance personalizado"
                  : "Review custom scope",
              href: "/quote",
            },
            {
              type: "start_booking",
              label:
                language === "es" ? "Ver configuración de reserva" : "View booking setup",
              href: buildBookingHref({
                service,
                frequency,
                bedrooms,
                fullBaths,
                halfBaths,
                sqft,
                extras: extrasList,
              }),
            },
          ]
        : [
            {
              type: "start_booking",
              label:
                language === "es" ? "Configurar esta limpieza" : "Configure this cleaning",
              href: buildBookingHref({
                service,
                frequency,
                bedrooms,
                fullBaths,
                halfBaths,
                sqft,
                extras: extrasList,
              }),
            },
            {
              type: "start_quote",
              label:
                language === "es"
                  ? "Pedir cotización personalizada"
                  : "Request a custom quote",
              href: "/quote",
            },
          ],
    followUps:
      language === "es"
        ? ["¿Qué incluye este servicio?", "¿Qué adicionales están disponibles?"]
        : ["What is included in this service?", "What add-ons are available?"],
    factSources: ["Tranquility pricing engine", "Approved service configuration"],
    estimate: {
      service: serviceName(service, language),
      frequency:
        availableFrequencies(service).find((item) => item.id === frequency)?.name ??
        "One-time",
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

function comparisonReply(question: string, language: LucyLanguage): LucyReply | null {
  const text = question.toLowerCase();
  if (
    !hasAny(text, [
      "compare",
      "difference",
      "different",
      "versus",
      " vs ",
      "diferencia",
      "compara",
    ]) ||
    !hasAny(text, ["standard", "deep", "move", "estándar", "profunda", "mudanza"])
  ) {
    return null;
  }

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
    actions: [
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
    ],
    followUps:
      language === "es"
        ? ["¿Cuál es mejor para mi hogar?", "Calcula una limpieza profunda"]
        : ["Which one fits my home?", "Estimate a Deep Clean"],
    factSources: ["Approved Tranquility services", "Tranquility pricing engine"],
  };
}

function serviceAreaReply(
  question: string,
  language: LucyLanguage,
  activeCities: string[],
): LucyReply | null {
  const text = question.toLowerCase();
  if (
    !hasAny(text, [
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
    return null;
  }

  const matched = activeCities.find((city) => text.includes(city.toLowerCase()));
  if (matched) {
    return {
      answer:
        language === "es"
          ? "Sí. " +
            matched +
            " aparece actualmente como una ciudad activa en el área de servicio de Tranquility."
          : "Yes. " +
            matched +
            " is currently listed as an active Tranquility service city.",
      intent: "service_area",
      confidence: "high",
      actions: [
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
      ],
      followUps: [],
      factSources: ["Live Tranquility service-area data"],
    };
  }

  if (
    hasAny(text, [
      "where",
      "which cities",
      "list",
      "dónde",
      "que ciudades",
      "qué ciudades",
    ])
  ) {
    return {
      answer:
        language === "es"
          ? "Las ciudades activas actuales incluyen: " +
            activeCities.join(", ") +
            ". Si tu ciudad no aparece, Lucy no asumirá cobertura. Podemos revisar tu ubicación mediante una cotización o contacto directo."
          : "Current active service cities include: " +
            activeCities.join(", ") +
            ". If your city is not listed, Lucy will not assume coverage. Tranquility can review your location through a quote or direct contact.",
      intent: "service_area",
      confidence: "high",
      actions: [
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
      ],
      followUps: [],
      factSources: ["Live Tranquility service-area data"],
    };
  }

  return null;
}

function directReply(question: string, language: LucyLanguage): LucyReply | null {
  const text = question.toLowerCase();
  if (hasAny(text, ["book", "schedule", "reserve", "reservar", "agenda", "agendar"])) {
    return {
      answer:
        language === "es"
          ? "Puedo llevarte al flujo real de reserva para elegir servicio, alcance, fecha y ventana de llegada."
          : "I can take you into the real booking flow to choose service, scope, date, and arrival window.",
      intent: "booking",
      confidence: "high",
      actions: [
        {
          type: "start_booking",
          label: language === "es" ? "Comenzar reserva" : "Start booking",
          href: "/booking",
        },
      ],
      followUps: [],
      factSources: ["Tranquility booking workflow"],
    };
  }

  if (hasAny(text, ["custom quote", "cotización", "cotizacion", "custom scope"])) {
    return {
      answer:
        language === "es"
          ? "Para un alcance personalizado, Tranquility usa el flujo de cotización para revisar los detalles antes de confirmar el servicio."
          : "For custom scope, Tranquility uses the quote flow to review the details before service is confirmed.",
      intent: "custom_quote",
      confidence: "high",
      actions: [
        {
          type: "start_quote",
          label: language === "es" ? "Solicitar cotización" : "Request a quote",
          href: "/quote",
        },
      ],
      followUps: [],
      factSources: ["Tranquility quote workflow"],
    };
  }

  return null;
}

function sanitizeAction(action: LucyAction): LucyAction | null {
  if (action.type === "call") return { ...action, href: business.phoneHref };
  if (action.type === "contact") return { ...action, href: "/contact" };
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
    !action.href.includes("://") &&
    SAFE_PUBLIC_ROUTES.some(
      (route) =>
        action.href === route ||
        action.href.startsWith(route + "?") ||
        (route === "/service-area" && action.href.startsWith("/service-area/")),
    )
  ) {
    return action;
  }
  return null;
}

function sanitizeReply(reply: LucyReply): LucyReply {
  return {
    ...reply,
    actions: reply.actions
      .map(sanitizeAction)
      .filter((action): action is LucyAction => Boolean(action)),
  };
}

function publicFallback(language: LucyLanguage): LucyReply {
  return {
    answer:
      language === "es"
        ? "Puedo ayudarte con servicios, precios verificados, áreas de servicio, reservas y cotizaciones. Para una recomendación precisa, dime qué tipo de hogar tienes y qué quieres limpiar."
        : "I can help with services, verified pricing, service areas, booking, and custom quotes. For a precise recommendation, tell me what kind of home you have and what you want cleaned.",
    intent: "concierge_help",
    confidence: "high",
    actions: [
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
    ],
    followUps:
      language === "es"
        ? ["Compara Standard y Deep Clean", "Calcula una limpieza profunda de 3 dormitorios"]
        : ["Compare Standard and Deep Clean", "Estimate a 3 bedroom Deep Clean"],
    factSources: ["Tranquility first-party service information"],
  };
}

async function loadActiveCities() {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("service_cities")
      .select("name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (!error && data?.length) {
      return { cities: data.map((item) => item.name), live: true };
    }
  } catch {
    // Fall through to verified project configuration so Lucy remains useful.
  }

  return { cities: configuredCities, live: false };
}

export const askLucyPublic = createServerFn({ method: "POST" })
  .validator((input) => lucyPublicRequestSchema.parse(input))
  .handler(async ({ data }) => {
    if (!consumeRateLimit(data.sessionId)) {
      return {
        answer:
          data.language === "es"
            ? "Has enviado varias solicitudes en poco tiempo. Espera unos minutos y vuelve a intentarlo."
            : "You have sent several requests in a short period. Please wait a few minutes and try again.",
        intent: "rate_limited",
        confidence: "high",
        actions: [],
        followUps: [],
        factSources: [],
      } satisfies LucyReply;
    }

    const serviceArea = await loadActiveCities();
    const deterministic =
      estimateReply(data.question, data.language) ??
      comparisonReply(data.question, data.language) ??
      serviceAreaReply(data.question, data.language, serviceArea.cities) ??
      directReply(data.question, data.language);

    if (deterministic) return sanitizeReply(deterministic);

    const { askLucyModel } = await import("@/lib/lucy.ai.server");
    const modelReply = await askLucyModel({
      language: data.language,
      pathname: data.pathname,
      question: data.question,
      history: data.history,
      knowledge: {
        ...publicKnowledgeSnapshot(serviceArea.cities),
        serviceAreaSource: serviceArea.live ? "live database" : "verified project configuration",
      },
    });

    return sanitizeReply(modelReply ?? publicFallback(data.language));
  });

function countBy<T>(rows: T[], key: (row: T) => string | null | undefined) {
  const output: Record<string, number> = {};
  for (const row of rows) {
    const value = key(row) || "unknown";
    output[value] = (output[value] ?? 0) + 1;
  }
  return output;
}

export const askLucyOwner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => lucyOwnerRequestSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: ownerData, error: ownerError } = await context.supabase.auth.getUser();
    const owner = ownerData.user;
    if (
      ownerError ||
      !owner ||
      !owner.email_confirmed_at ||
      owner.email?.toLowerCase() !== OWNER_EMAIL
    ) {
      throw new Error("Forbidden");
    }

    const [bookings, quotes, inquiries, careers, cities, blocks] = await Promise.all([
      context.supabase
        .from("booking_holds")
        .select("service_date,status,service_type,city,created_at"),
      context.supabase.from("quote_requests").select("status,city,created_at"),
      context.supabase.from("contact_inquiries").select("status,created_at"),
      context.supabase.from("career_applications").select("status,city,created_at"),
      context.supabase.from("service_cities").select("is_active"),
      context.supabase.from("availability_blocks").select("start_date,end_date"),
    ]);

    if ([bookings, quotes, inquiries, careers, cities, blocks].some((result) => result.error)) {
      throw new Error("Unable to load owner intelligence.");
    }

    const bookingRows = bookings.data ?? [];
    const quoteRows = quotes.data ?? [];
    const inquiryRows = inquiries.data ?? [];
    const careerRows = careers.data ?? [];
    const today = new Date().toISOString().slice(0, 10);
    const next7 = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
    const activeBookings = bookingRows.filter(
      (item) => !["cancelled", "completed"].includes(item.status),
    );

    const demand = new Map<string, number>();
    for (const item of bookingRows) {
      if (item.city) demand.set(item.city, (demand.get(item.city) ?? 0) + 1);
    }
    for (const item of quoteRows) {
      if (item.city) demand.set(item.city, (demand.get(item.city) ?? 0) + 1);
    }

    const summary = {
      generatedAt: new Date().toISOString(),
      bookings: {
        total: bookingRows.length,
        today: activeBookings.filter((item) => item.service_date === today).length,
        next7Days: activeBookings.filter(
          (item) => item.service_date >= today && item.service_date <= next7,
        ).length,
        byStatus: countBy(bookingRows, (item) => item.status),
        byService: countBy(bookingRows, (item) => item.service_type),
      },
      quotes: {
        total: quoteRows.length,
        byStatus: countBy(quoteRows, (item) => item.status),
      },
      inquiries: {
        total: inquiryRows.length,
        byStatus: countBy(inquiryRows, (item) => item.status),
      },
      careers: {
        total: careerRows.length,
        byStatus: countBy(careerRows, (item) => item.status),
      },
      serviceArea: {
        activeCities: (cities.data ?? []).filter((item) => item.is_active).length,
      },
      availability: {
        activeBlocks: (blocks.data ?? []).length,
      },
      demandByCity: [...demand.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([city, requests]) => ({ city, requests })),
    };

    const { askLucyModel } = await import("@/lib/lucy.ai.server");
    const modelReply = await askLucyModel({
      language: data.language,
      pathname: data.pathname,
      question: data.question,
      history: data.history,
      knowledge: summary,
      ownerMode: true,
    });

    if (modelReply) return sanitizeReply(modelReply);

    const question = data.question.toLowerCase();
    const topCity = summary.demandByCity[0];
    let answer: string;

    if (
      hasAny(question, [
        "next 7",
        "next week",
        "próximos 7",
        "proximos 7",
        "semana",
      ])
    ) {
      answer =
        data.language === "es"
          ? "Tienes " +
            summary.bookings.next7Days +
            " reserva(s) activa(s) programada(s) entre hoy y los próximos 7 días. Hoy tienes " +
            summary.bookings.today +
            "."
          : "You have " +
            summary.bookings.next7Days +
            " active booking(s) scheduled between today and the next 7 days. " +
            summary.bookings.today +
            " are scheduled for today.";
    } else if (hasAny(question, ["quote", "cotización", "cotizacion"])) {
      answer =
        data.language === "es"
          ? "Hay " +
            summary.quotes.total +
            " cotización(es) en total. Los estados actuales son " +
            JSON.stringify(summary.quotes.byStatus) +
            "."
          : "There are " +
            summary.quotes.total +
            " quote request(s) in total. Current statuses are " +
            JSON.stringify(summary.quotes.byStatus) +
            ".";
    } else if (
      hasAny(question, ["demand", "city", "demanda", "ciudad"]) &&
      topCity
    ) {
      answer =
        data.language === "es"
          ? topCity.city +
            " lidera la demanda actual con " +
            topCity.requests +
            " solicitud(es) combinadas entre reservas y cotizaciones."
          : topCity.city +
            " currently leads demand with " +
            topCity.requests +
            " combined booking and quote request(s).";
    } else {
      answer =
        data.language === "es"
          ? "Resumen operativo: " +
            summary.bookings.total +
            " reservas, " +
            summary.quotes.total +
            " cotizaciones, " +
            summary.inquiries.total +
            " consultas y " +
            summary.serviceArea.activeCities +
            " ciudades activas de servicio."
          : "Operations summary: " +
            summary.bookings.total +
            " bookings, " +
            summary.quotes.total +
            " quotes, " +
            summary.inquiries.total +
            " inquiries, and " +
            summary.serviceArea.activeCities +
            " active service cities.";
    }

    return {
      answer,
      intent: "owner_operations",
      confidence: "high",
      actions: [],
      followUps:
        data.language === "es"
          ? [
              "¿Cómo se ven mis próximos 7 días?",
              "¿Dónde es más fuerte la demanda?",
            ]
          : ["How does my next 7 days look?", "Where is demand strongest?"],
      factSources: ["Authenticated aggregate owner data"],
    } satisfies LucyReply;
  });
