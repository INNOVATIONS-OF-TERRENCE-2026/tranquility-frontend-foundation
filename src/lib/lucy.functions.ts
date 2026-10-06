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
  type LucyState,
} from "@/lib/lucy.types";

const OWNER_EMAIL = "tlcllc26@gmail.com";
const SAFE_PUBLIC_ROUTES = [
  "/",
  "/services",
  "/residential-cleaning",
  "/deep-cleaning",
  "/move-in-move-out-cleaning",
  "/commercial-cleaning",
  "/house-cleaning-euless",
  "/house-cleaning-bedford",
  "/house-cleaning-hurst",
  "/house-cleaning-colleyville",
  "/house-cleaning-grapevine",
  "/service-area",
  "/booking",
  "/quote",
  "/contact",
  "/faq",
  "/about",
  "/careers",
  "/studio",
  "/privacy",
  "/terms",
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

const WORD_NUMBERS: Record<string, string> = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  uno: "1",
  una: "1",
  dos: "2",
  tres: "3",
  cuatro: "4",
  cinco: "5",
  seis: "6",
};

function normalize(question: string) {
  let text = " " + question.toLowerCase().replace(/[,]/g, " ").replace(/\s+/g, " ") + " ";
  for (const [word, digit] of Object.entries(WORD_NUMBERS)) {
    text = text.replace(new RegExp("\\b" + word + "\\b", "g"), digit);
  }
  return text.replace(/(\d)\s*k\s*(?:sq|square)/g, "$1000 sq");
}

function detectExplicitService(text: string): ServiceId | null {
  if (hasAny(text, ["deep", "profunda", "profundo"])) return "deep";
  if (
    hasAny(text, [
      "move-in",
      "move in",
      "move-out",
      "move out",
      "moving",
      "mudanza",
      "entrada",
      "salida",
      "vacant",
      "empty home",
      "empty house",
      "vacía",
      "vacia",
    ])
  ) {
    return "move";
  }
  if (hasAny(text, ["standard", "estándar", "estandar"])) return "standard";
  return null;
}

const DEEP_CUES = [
  "months",
  "hasn't been cleaned",
  "hasnt been cleaned",
  "haven't cleaned",
  "not been cleaned",
  "buildup",
  "build-up",
  "build up",
  "grime",
  "overdue",
  "really dirty",
  "very dirty",
  "neglected",
  "first clean",
  "meses",
  "acumulación",
  "acumulacion",
  "muy sucia",
];
const STANDARD_CUES = [
  "routine",
  "maintenance",
  "upkeep",
  "regular",
  "recurring",
  "every week",
  "every other week",
  "mantenimiento",
  "rutina",
];

function recommendService(text: string): { service: ServiceId; reason: string } | null {
  if (hasAny(text, DEEP_CUES)) return { service: "deep", reason: "deep" };
  if (hasAny(text, STANDARD_CUES)) return { service: "standard", reason: "standard" };
  return null;
}

function recommendationText(reason: string, language: LucyLanguage) {
  const copy: Record<string, { en: string; es: string }> = {
    deep: {
      en: "Since the home is overdue for a thorough clean, I recommend a Deep Clean to reset buildup, edges, and detail areas.",
      es: "Como el hogar necesita una limpieza a fondo, recomiendo Deep Clean para eliminar acumulación y detallar bordes y zonas olvidadas.",
    },
    standard: {
      en: "For routine upkeep, a Standard Clean is the right fit.",
      es: "Para mantenimiento regular, Standard Clean es la opción adecuada.",
    },
    move: {
      en: "For an empty home in transition, Move-In / Move-Out is the right fit.",
      es: "Para una vivienda vacía en transición, Move-In / Move-Out es la opción adecuada.",
    },
  };
  return copy[reason]?.[language] ?? "";
}

function detectFrequency(text: string): FrequencyId | null {
  if (
    hasAny(text, [
      "biweekly",
      "bi-weekly",
      "every two weeks",
      "every other week",
      "cada dos semanas",
      "quincenal",
    ])
  ) {
    return "biweekly";
  }
  if (hasAny(text, ["weekly", "every week", "semanal"])) return "weekly";
  if (hasAny(text, ["monthly", "once a month", "mensual"])) return "monthly";
  if (hasAny(text, ["one time", "one-time", "onetime", "just once", "una vez"])) return "onetime";
  return null;
}

function numberBefore(text: string, terms: string[]) {
  for (const term of terms) {
    const match = text.match(new RegExp("(\\d{1,5})\\s*(?:-\\s*)?" + term, "i"));
    if (match) return Number(match[1]);
  }
  return null;
}

const EXTRA_TERMS: Array<[string, string[]]> = [
  ["oven", ["oven", "horno"]],
  ["fridge", ["fridge", "refrigerator", "refrigerador", "refri"]],
  ["dishes", ["dishes", "platos", "trastes"]],
  ["hood", ["hood", "vent", "campana"]],
  ["cabinets", ["cabinet", "gabinete"]],
  ["pet-hair", ["pet hair", "pelo de mascota"]],
  ["baseboards", ["baseboard", "zócalo", "zocalo"]],
  ["garage-patio", ["garage", "patio", "garaje"]],
  ["carpet-spot", ["carpet spot", "carpet stain", "alfombra"]],
  ["laundry-wdf", ["wash dry fold", "wash and fold", "wash dry", "lavar secar"]],
  ["laundry-fold", ["fold only", "solo doblar"]],
];

function detectExtras(text: string) {
  return EXTRA_TERMS.filter(([, terms]) => hasAny(text, terms))
    .map(([id]) => id)
    .filter((id) => addOns.some((item) => item.id === id));
}

function clampInt(value: number | null, min: number, max: number) {
  if (value === null || !Number.isFinite(value)) return undefined;
  return Math.min(max, Math.max(min, Math.round(value)));
}

type Extraction = {
  state: LucyState;
  changedScope: boolean;
  recommendation: string | null;
  cityMentioned: string | null;
};

/** Incrementally merges non-sensitive service context from one message into prior state. */
function mergeState(prev: LucyState | undefined, question: string, cities: string[]): Extraction {
  const text = normalize(question);
  const state: LucyState = { ...prev, extras: [...(prev?.extras ?? [])] };
  let changedScope = false;
  let recommendation: string | null = null;

  const explicit = detectExplicitService(text);
  if (explicit) {
    if (explicit !== state.service) changedScope = true;
    state.service = explicit;
    if (explicit === "move")
      recommendation = hasAny(text, ["empty", "vacant", "vac"]) ? "move" : null;
  } else {
    const rec = recommendService(text);
    if (rec && !state.service) {
      state.service = rec.service;
      recommendation = rec.reason;
      changedScope = true;
    }
  }

  const frequency = detectFrequency(text);
  if (frequency) {
    state.frequency = frequency;
    changedScope = true;
  }

  const slash = text.match(/(\d{1,2})\s*(?:br|bd|bed)?\s*\/\s*(\d{1,2})\s*(?:ba|bath)?\b/);
  const bedrooms =
    numberBefore(text, [
      "bedrooms?",
      "beds?",
      "br\\b",
      "bd\\b",
      "dormitorios?",
      "habitaciones?",
      "recámaras?",
      "recamaras?",
      "cuartos?",
    ]) ?? (slash ? Number(slash[1]) : null);
  const halfBaths = numberBefore(text, [
    "half[\\s-]*baths?",
    "half[\\s-]*bathrooms?",
    "medios? baños?",
  ]);
  const noHalf = text.replace(/\d{1,2}\s*(?:half[\s-]*bath\w*|medios? baños?)/g, " ");
  const fullBaths =
    numberBefore(noHalf, [
      "full[\\s-]*baths?",
      "full[\\s-]*bathrooms?",
      "bathrooms?",
      "baths?",
      "ba\\b",
      "baños completos?",
      "baños?",
      "banos?",
    ]) ?? (slash ? Number(slash[2]) : null);
  const sqft = numberBefore(text, [
    "sq\\.?\\s*ft",
    "sqft",
    "square\\s*f(?:ee|oo)t",
    "sf\\b",
    "pies\\s*cuadrados",
    "pies",
  ]);

  const next = {
    bedrooms: clampInt(bedrooms, 1, 20),
    fullBaths: clampInt(fullBaths, 1, 20),
    halfBaths: clampInt(halfBaths, 0, 10),
    sqft: clampInt(sqft, 100, 25000),
  };
  for (const [key, value] of Object.entries(next) as Array<
    [keyof typeof next, number | undefined]
  >) {
    if (value !== undefined && value !== state[key]) {
      state[key] = value;
      changedScope = true;
    }
  }

  const extras = detectExtras(text);
  if (extras.length) {
    const removing = hasAny(text, [
      "remove",
      "without",
      "drop",
      "take off",
      "no ",
      "quita",
      "sin ",
    ]);
    const set = new Set(state.extras);
    for (const id of extras) {
      if (removing) set.delete(id);
      else set.add(id);
    }
    state.extras = [...set];
    changedScope = true;
  }

  const cityMentioned = cities.find((city) => text.includes(" " + city.toLowerCase())) ?? null;
  if (cityMentioned) state.city = cityMentioned;

  if (state.service && state.service !== "standard") state.frequency = "onetime";
  return { state, changedScope, recommendation, cityMentioned };
}

function buildBookingHref(state: LucyState) {
  const params = new URLSearchParams();
  if (!state.service) return "/booking";
  params.set("service", state.service);
  if (state.service === "standard" && state.frequency) params.set("frequency", state.frequency);
  params.set("bedrooms", String(state.bedrooms ?? 1));
  params.set("fullBaths", String(state.fullBaths ?? 1));
  if (state.halfBaths) params.set("halfBaths", String(state.halfBaths));
  if (state.sqft) params.set("sqft", String(state.sqft));
  const extras = state.extras.filter((id) =>
    addOns.some((item) => item.id === id && !item.derived),
  );
  if (extras.length) params.set("extras", extras.join(","));
  return "/booking?" + params.toString();
}

const ESTIMATE_WORDS = [
  "how much",
  "price",
  "pricing",
  "cost",
  "estimate",
  "quote",
  "what would it",
  "what if",
  "instead",
  "make that",
  "make it",
  "cuánto",
  "cuanto",
  "precio",
  "costo",
  "calcula",
  "estimado",
  "y si",
];

const BOOK_WORDS = ["book", "schedule", "reserve", "reservar", "agenda", "agendar"];

function estimateFollowUps(state: LucyState, language: LucyLanguage) {
  const es = language === "es";
  const items = [es ? "Reservar esta limpieza" : "Book this cleaning"];
  if (state.service === "standard" && state.frequency !== "biweekly") {
    items.push(es ? "¿Y si fuera cada dos semanas?" : "What if I do biweekly instead?");
  }
  if (!state.extras.includes("oven")) items.push(es ? "Añade el horno" : "Add the oven too");
  if (state.service !== "deep") items.push(es ? "Cámbialo a Deep Clean" : "Switch to Deep Clean");
  return items.slice(0, 4);
}

function stateReply(
  question: string,
  language: LucyLanguage,
  extraction: Extraction,
  activeCities: string[],
): LucyReply | null {
  const text = normalize(question);
  const { state, changedScope, recommendation, cityMentioned } = extraction;
  const es = language === "es";
  const asksEstimate = hasAny(text, ESTIMATE_WORDS);
  const asksBook = hasAny(text, BOOK_WORDS);
  const hasScope = state.bedrooms !== undefined || state.fullBaths !== undefined;
  const asksRecommend = hasAny(text, [
    "recommend",
    "which",
    "should i",
    "need",
    "recomiend",
    "cuál",
    "necesito",
  ]);

  // Booking handoff: carry every known valid field into the existing validated prefill.
  if (asksBook && state.service && (state.estimated || hasScope)) {
    return {
      answer: es
        ? "Listo. Abriré la reserva con tu " +
          serviceName(state.service, language) +
          " y los detalles que ya me diste. Solo eliges fecha, ventana de llegada y tus datos de contacto."
        : "Ready. I will open booking with your " +
          serviceName(state.service, language) +
          " and the details you already gave me. You just choose a date, arrival window, and contact details.",
      intent: "booking",
      confidence: "high",
      actions: [
        {
          type: "start_booking",
          label: es ? "Continuar a la reserva" : "Continue to booking",
          href: buildBookingHref(state),
        },
      ],
      followUps: [],
      factSources: ["Tranquility booking workflow"],
      state: { ...state, goal: "book" },
    };
  }

  if (!state.service) {
    if (hasScope && (asksEstimate || asksRecommend)) {
      return {
        answer: es
          ? "Puedo calcularlo de inmediato. ¿Es mantenimiento regular (Standard), una limpieza a fondo porque ha pasado tiempo (Deep), o una vivienda vacía por mudanza (Move-In / Move-Out)?"
          : "I can price that right away. Is this routine upkeep (Standard), a thorough reset because it has been a while (Deep), or an empty home for a move (Move-In / Move-Out)?",
        intent: "service_recommendation",
        confidence: "medium",
        actions: [
          {
            type: "navigate",
            label: es ? "Comparar servicios" : "Compare services",
            href: "/services",
          },
        ],
        followUps: es
          ? ["Standard Clean", "Deep Clean", "Move-In / Move-Out"]
          : ["Standard Clean", "Deep Clean", "Move-In / Move-Out"],
        factSources: ["Approved Tranquility services"],
        state,
      };
    }
    return null;
  }

  const relevant = asksEstimate || changedScope || asksRecommend || cityMentioned !== null;
  if (!relevant) return null;

  const service = services.find((item) => item.id === state.service)!;

  // Missing-information engine: ask only for the smallest useful detail.
  if (!hasScope) {
    const lead = recommendation ? recommendationText(recommendation, language) + " " : "";
    return {
      answer:
        lead +
        (es
          ? serviceName(service.id, language) +
            " comienza en " +
            money(service.basePrice) +
            " para 1 dormitorio y 1 baño. ¿Cuántos dormitorios y baños completos tiene tu hogar? Los pies cuadrados ayudan si los sabes."
          : serviceName(service.id, language) +
            " starts at " +
            money(service.basePrice) +
            " for 1 bedroom and 1 bath. How many bedrooms and full bathrooms does your home have? Square footage helps if you know it."),
      intent: "price_estimate",
      confidence: "high",
      actions: [],
      followUps: es
        ? ["3 dormitorios, 2 baños", "2 dormitorios, 1 baño"]
        : ["3 bed, 2 bath", "2 bed, 1 bath"],
      factSources: ["Tranquility pricing engine"],
      state,
    };
  }

  const frequency = state.service === "standard" ? (state.frequency ?? "onetime") : "onetime";
  const bedrooms = state.bedrooms ?? 1;
  const fullBaths = state.fullBaths ?? 1;
  const estimate = buildEstimate({
    service: state.service,
    frequency,
    scope: {
      bedrooms,
      fullBaths,
      halfBaths: state.halfBaths ?? 0,
      livingRooms: 0,
      diningRooms: 0,
      offices: 0,
      laundryRooms: 0,
    },
    extras: Object.fromEntries(state.extras.map((id) => [id, 1])),
    sqft: state.sqft ?? null,
  });
  const freqName =
    availableFrequencies(state.service).find((item) => item.id === frequency)?.name ?? "One-time";
  const customReview = estimate.reviewFlags.some(
    (flag) => !flag.toLowerCase().includes("starting"),
  );

  const parts: string[] = [];
  if (recommendation) parts.push(recommendationText(recommendation, language));
  if (state.city) {
    const covered = activeCities.some((city) => city.toLowerCase() === state.city!.toLowerCase());
    if (covered && cityMentioned) {
      parts.push(
        es
          ? state.city + " está dentro de nuestra área de servicio."
          : state.city + " is in our service area.",
      );
    }
  }
  const scopeText = es
    ? bedrooms +
      " dormitorio(s), " +
      fullBaths +
      " baño(s)" +
      (state.halfBaths ? ", " + state.halfBaths + " medio(s) baño(s)" : "")
    : bedrooms +
      " bed, " +
      fullBaths +
      " bath" +
      (state.halfBaths ? ", " + state.halfBaths + " half bath" : "");
  parts.push(
    es
      ? "Tu " +
          serviceName(state.service, language) +
          " (" +
          scopeText +
          ", " +
          freqName.toLowerCase() +
          ") se estima en " +
          money(estimate.total) +
          "."
      : "Your " +
          serviceName(state.service, language) +
          " (" +
          scopeText +
          ", " +
          freqName.toLowerCase() +
          ") is estimated at " +
          money(estimate.total) +
          ".",
  );
  if (estimate.discountAmount > 0) {
    parts.push(
      es
        ? "Incluye " + money(estimate.discountAmount) + " de ahorro recurrente."
        : "That includes " + money(estimate.discountAmount) + " in recurring savings.",
    );
  }
  if (customReview) {
    parts.push(
      es
        ? "Por el tamaño o alcance, Tranquility revisará los detalles antes de confirmar."
        : "Because of the size or scope, Tranquility will review the details before confirming.",
    );
  } else {
    parts.push(
      es
        ? "Los detalles finales se confirman antes de la limpieza."
        : "Final details are confirmed before cleaning.",
    );
  }

  const nextState: LucyState = { ...state, frequency, estimated: true, customReview };
  const book: LucyAction = {
    type: "start_booking",
    label: es ? "Reservar esta limpieza" : "Book this cleaning",
    href: buildBookingHref(nextState),
  };
  const quote: LucyAction = {
    type: "start_quote",
    label: es ? "Revisión de alcance personalizado" : "Custom scope review",
    href: "/quote",
  };

  return {
    answer: parts.join(" "),
    intent: recommendation ? "service_recommendation+price_estimate" : "price_estimate",
    confidence: "high",
    actions: customReview ? [quote, book] : [book, quote],
    followUps: estimateFollowUps(nextState, language),
    factSources: ["Tranquility pricing engine", "Approved service configuration"],
    estimate: {
      service: serviceName(state.service, language),
      frequency: freqName,
      total: estimate.total,
      totalLabel: money(estimate.total),
      lines: [
        {
          label: es ? "Servicio" : "Service",
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
    state: nextState,
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
          : "Yes. " + matched + " is currently listed as an active Tranquility service city.",
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

  if (hasAny(text, ["where", "which cities", "list", "dónde", "que ciudades", "qué ciudades"])) {
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
  const es = language === "es";
  if (
    hasAny(text, [
      "commercial",
      "office building",
      "my business",
      "storefront",
      "comercial",
      "negocio",
    ]) &&
    !text.includes("home office")
  ) {
    return {
      answer: es
        ? "La limpieza comercial se cotiza según el espacio y la frecuencia, así que no tiene precio fijo en línea. Envía una cotización y Tranquility revisará los detalles."
        : "Commercial cleaning is quoted by space and frequency, so it has no fixed online price. Send a quote request and Tranquility will review the details.",
      intent: "commercial_inquiry",
      confidence: "high",
      actions: [
        {
          type: "start_quote",
          label: es ? "Solicitar cotización comercial" : "Request a commercial quote",
          href: "/quote",
        },
        {
          type: "navigate",
          label: es ? "Ver limpieza comercial" : "View commercial cleaning",
          href: "/commercial-cleaning",
        },
      ],
      followUps: [],
      factSources: ["Tranquility commercial workflow"],
    };
  }
  if (hasAny(text, ["reschedule", "cancel", "change my appointment", "reprogramar", "cancelar"])) {
    return {
      answer: es
        ? "Para cambiar o cancelar una cita existente, comunícate directamente con Tranquility para que confirmen el cambio. Lucy no puede modificar reservas."
        : "To change or cancel an existing appointment, contact Tranquility directly so the change can be confirmed. Lucy cannot modify bookings.",
      intent: "rescheduling",
      confidence: "high",
      actions: [
        {
          type: "call",
          label: es ? "Llamar a Tranquility" : "Call Tranquility",
          href: business.phoneHref,
        },
        { type: "contact", label: es ? "Enviar mensaje" : "Send a message", href: "/contact" },
      ],
      followUps: [],
      factSources: ["Tranquility contact information"],
    };
  }
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
    return action.href?.startsWith("/booking") ? action : { ...action, href: "/booking" };
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
    const extraction = mergeState(data.state, data.question, serviceArea.cities);
    const deterministic =
      stateReply(data.question, data.language, extraction, serviceArea.cities) ??
      comparisonReply(data.question, data.language) ??
      serviceAreaReply(data.question, data.language, serviceArea.cities) ??
      directReply(data.question, data.language);

    if (deterministic) {
      return sanitizeReply({ ...deterministic, state: deterministic.state ?? extraction.state });
    }

    const { askLucyModel } = await import("@/lib/lucy.ai.server");
    const modelReply = await askLucyModel({
      language: data.language,
      pathname: data.pathname,
      question: data.question,
      history: data.history,
      knowledge: {
        ...publicKnowledgeSnapshot(serviceArea.cities),
        serviceAreaSource: serviceArea.live ? "live database" : "verified project configuration",
        conversationState: extraction.state,
      },
    });

    return sanitizeReply({
      ...(modelReply ?? publicFallback(data.language)),
      state: extraction.state,
    });
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

    if (hasAny(question, ["next 7", "next week", "próximos 7", "proximos 7", "semana"])) {
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
    } else if (
      hasAny(question, ["most booked", "popular", "which service", "más reservado", "servicio"])
    ) {
      const top = Object.entries(summary.bookings.byService).sort((a, b) => b[1] - a[1])[0];
      answer = top
        ? data.language === "es"
          ? "El servicio más reservado es " +
            (services.find((item) => item.id === top[0])?.name ?? top[0]) +
            " con " +
            top[1] +
            " reserva(s)."
          : "The most booked service is " +
            (services.find((item) => item.id === top[0])?.name ?? top[0]) +
            " with " +
            top[1] +
            " booking(s)."
        : data.language === "es"
          ? "Aún no hay reservas para comparar."
          : "There are no bookings to compare yet.";
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
    } else if (hasAny(question, ["demand", "city", "demanda", "ciudad"]) && topCity) {
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
          ? ["¿Cómo se ven mis próximos 7 días?", "¿Dónde es más fuerte la demanda?"]
          : ["How does my next 7 days look?", "Where is demand strongest?"],
      factSources: ["Authenticated aggregate owner data"],
    } satisfies LucyReply;
  });
