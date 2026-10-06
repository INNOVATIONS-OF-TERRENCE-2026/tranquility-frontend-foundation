import { business } from "@/config/business";
import {
  PRICING_DISCLOSURE,
  addOns,
  frequencies,
  services,
  type ServiceId,
} from "@/config/pricing";
import type { LucyLanguage } from "@/lib/lucy.types";

type PromptSet = {
  en: string[];
  es: string[];
};

const routePrompts: Array<{ match: (pathname: string) => boolean; prompts: PromptSet }> = [
  {
    match: (pathname) => pathname === "/",
    prompts: {
      en: [
        "What cleaning service fits my home?",
        "Estimate my cleaning",
        "Check my service area",
        "Help me book",
      ],
      es: [
        "¿Qué servicio de limpieza se adapta a mi hogar?",
        "Calcula mi limpieza",
        "Verifica mi área de servicio",
        "Ayúdame a reservar",
      ],
    },
  },
  {
    match: (pathname) => pathname.includes("service-area") || pathname.startsWith("/areas/"),
    prompts: {
      en: [
        "Do you service my city?",
        "Show covered areas",
        "What if my city is not listed?",
        "Help me request a quote",
      ],
      es: [
        "¿Atienden mi ciudad?",
        "Muéstrame las áreas cubiertas",
        "¿Qué pasa si mi ciudad no aparece?",
        "Ayúdame a pedir una cotización",
      ],
    },
  },
  {
    match: (pathname) => pathname === "/booking",
    prompts: {
      en: [
        "Help me choose my service",
        "Explain arrival windows",
        "Estimate my home",
        "Why does this need custom review?",
      ],
      es: [
        "Ayúdame a elegir mi servicio",
        "Explícame las ventanas de llegada",
        "Calcula mi hogar",
        "¿Por qué requiere revisión personalizada?",
      ],
    },
  },
  {
    match: (pathname) => pathname === "/quote",
    prompts: {
      en: [
        "Do I need a custom quote?",
        "Help me describe my home",
        "What counts as custom scope?",
        "Compare Standard and Deep Clean",
      ],
      es: [
        "¿Necesito una cotización personalizada?",
        "Ayúdame a describir mi hogar",
        "¿Qué se considera un alcance personalizado?",
        "Compara limpieza estándar y profunda",
      ],
    },
  },
  {
    match: (pathname) =>
      pathname === "/services" ||
      pathname.includes("cleaning") ||
      pathname === "/residential-cleaning",
    prompts: {
      en: [
        "Compare Standard and Deep Clean",
        "What is included?",
        "Which service should I choose?",
        "Estimate this service for my home",
      ],
      es: [
        "Compara limpieza estándar y profunda",
        "¿Qué incluye?",
        "¿Qué servicio debo elegir?",
        "Calcula este servicio para mi hogar",
      ],
    },
  },
];

const defaultPrompts: PromptSet = {
  en: [
    "What can Lucy help me with?",
    "Compare cleaning services",
    "Estimate my cleaning",
    "Help me book",
  ],
  es: [
    "¿En qué puede ayudarme Lucy?",
    "Compara los servicios de limpieza",
    "Calcula mi limpieza",
    "Ayúdame a reservar",
  ],
};

const ownerPrompts: PromptSet = {
  en: [
    "How does my next 7 days look?",
    "Summarize booking demand",
    "How many open quotes do I have?",
    "Where is demand strongest?",
  ],
  es: [
    "¿Cómo se ven mis próximos 7 días?",
    "Resume la demanda de reservas",
    "¿Cuántas cotizaciones abiertas tengo?",
    "¿Dónde es más fuerte la demanda?",
  ],
};

export function lucyPromptSet(
  pathname: string,
  language: LucyLanguage,
  ownerMode = false,
): string[] {
  if (ownerMode) return ownerPrompts[language];
  const set = routePrompts.find((item) => item.match(pathname))?.prompts ?? defaultPrompts;
  return set[language];
}

export function lucyRouteContext(pathname: string, language: LucyLanguage): string {
  const labels: Array<[RegExp, { en: string; es: string }]> = [
    [/^\/$/, { en: "Home", es: "Inicio" }],
    [/^\/services/, { en: "Services", es: "Servicios" }],
    [/^\/residential-cleaning/, { en: "Standard Clean", es: "Limpieza estándar" }],
    [/^\/deep-cleaning/, { en: "Deep Clean", es: "Limpieza profunda" }],
    [
      /^\/move-in-move-out-cleaning/,
      { en: "Move-In / Move-Out Clean", es: "Limpieza de entrada / salida" },
    ],
    [/^\/commercial-cleaning/, { en: "Commercial Cleaning", es: "Limpieza comercial" }],
    [/^\/house-cleaning-euless/, { en: "Euless Cleaning", es: "Limpieza en Euless" }],
    [/^\/house-cleaning-bedford/, { en: "Bedford Cleaning", es: "Limpieza en Bedford" }],
    [/^\/house-cleaning-hurst/, { en: "Hurst Cleaning", es: "Limpieza en Hurst" }],
    [
      /^\/house-cleaning-colleyville/,
      { en: "Colleyville Cleaning", es: "Limpieza en Colleyville" },
    ],
    [
      /^\/house-cleaning-grapevine/,
      { en: "Grapevine Cleaning", es: "Limpieza en Grapevine" },
    ],
    [/^\/service-area/, { en: "Service Area", es: "Área de servicio" }],
    [/^\/booking/, { en: "Booking", es: "Reserva" }],
    [/^\/quote/, { en: "Custom Quote", es: "Cotización personalizada" }],
    [/^\/faq/, { en: "FAQ", es: "Preguntas frecuentes" }],
    [/^\/about/, { en: "About", es: "Acerca de" }],
    [/^\/contact/, { en: "Contact", es: "Contacto" }],
    [/^\/careers/, { en: "Careers", es: "Empleo" }],
    [/^\/studio/, { en: "Tranquility Studio", es: "Tranquility Studio" }],
    [/^\/privacy/, { en: "Privacy", es: "Privacidad" }],
    [/^\/terms/, { en: "Terms", es: "Términos" }],
    [/^\/admin/, { en: "Owner Workspace", es: "Espacio de propietaria" }],
  ];
  const label = labels.find(([pattern]) => pattern.test(pathname))?.[1];
  return label?.[language] ?? (language === "es" ? "Página de Tranquility" : "Tranquility page");
}

export function publicKnowledgeSnapshot(activeCities: string[]) {
  return {
    business: {
      name: business.legalName,
      tagline: business.tagline,
      phone: business.phoneDisplay,
      email: business.email,
      serviceAreaLabel: business.serviceAreaLabel,
    },
    services: services.map((service) => ({
      id: service.id,
      name: service.name,
      basePrice: service.basePrice,
      description: service.description,
      includes: service.includes,
      route: service.route,
      recurringAllowed: service.id === "standard",
    })),
    frequencies: frequencies.map((frequency) => ({
      id: frequency.id,
      name: frequency.name,
      discountPercent: Math.round(frequency.discount * 100),
      note: frequency.note,
    })),
    addOns: addOns.map((addOn) => ({
      id: addOn.id,
      name: addOn.name,
      quantity: Boolean(addOn.quantity),
      startingAt: Boolean(addOn.startingAt),
      note: addOn.note ?? null,
    })),
    activeServiceCities: activeCities,
    pricingDisclosure: PRICING_DISCLOSURE,
    routes: {
      services: "/services",
      serviceArea: "/service-area",
      booking: "/booking",
      quote: "/quote",
      contact: "/contact",
      faq: "/faq",
      about: "/about",
      careers: "/careers",
      studio: "/studio",
      privacy: "/privacy",
      terms: "/terms",
    },
  };
}

export function serviceName(id: ServiceId, language: LucyLanguage) {
  const names: Record<ServiceId, { en: string; es: string }> = {
    standard: { en: "Standard Clean", es: "Limpieza estándar" },
    deep: { en: "Deep Clean", es: "Limpieza profunda" },
    move: { en: "Move-In / Move-Out Clean", es: "Limpieza de entrada / salida" },
  };
  return names[id][language];
}
