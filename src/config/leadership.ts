export interface Bilingual {
  en: string;
  es: string;
}

/**
 * Approved, verified leadership and technology attribution copy.
 * Do not add credentials, licenses, dates, or affiliations that were not explicitly supplied.
 */
export const businessLeader = {
  name: "Treva Williams",
  role: { en: "Founder & Owner", es: "Fundadora y Propietaria" } satisfies Bilingual,
  credential: {
    en: "OSHA Compliance Certified",
    es: "Certificada en Cumplimiento de OSHA",
  } satisfies Bilingual,
  company: "Tranquility Level Cleaning",
  bio: {
    en: "Treva Williams is the Founder & Owner of Tranquility Level Cleaning and is OSHA Compliance Certified. She leads the company with a focus on thoughtful service, workplace safety awareness, clear expectations, personalized care, and creating cleaner spaces that feel calmer to return home to.",
    es: "Treva Williams es la Fundadora y Propietaria de Tranquility Level Cleaning y cuenta con certificación en cumplimiento de OSHA. Dirige la empresa con un enfoque en el servicio cuidadoso, la conciencia sobre seguridad en el trabajo, expectativas claras, atención personalizada y espacios más limpios que transmiten calma al volver a casa.",
  } satisfies Bilingual,
} as const;

export const technologyLeader = {
  name: "Terrence Milliner Sr.",
  role: { en: "Founder & CEO", es: "Fundador y Director Ejecutivo" } satisfies Bilingual,
  company: "Express Development Inc.",
  designation: {
    en: "Senior Software Developer & AI Architect Engineer",
    es: "Desarrollador Senior de Software e Ingeniero Arquitecto de Inteligencia Artificial",
  } satisfies Bilingual,
  bio: {
    en: "Terrence Milliner Sr. leads the software engineering, digital architecture, frontend development, UI/UX engineering, AI architecture, and technical infrastructure behind the Tranquility Level Cleaning digital experience.",
    es: "Terrence Milliner Sr. dirige la ingeniería de software, arquitectura digital, desarrollo frontend, ingeniería UI/UX, arquitectura de inteligencia artificial e infraestructura tecnológica detrás de la experiencia digital de Tranquility Level Cleaning.",
  } satisfies Bilingual,
  disciplines: [
    { en: "Digital Strategy", es: "Estrategia Digital" },
    { en: "Software Architecture", es: "Arquitectura de Software" },
    { en: "Software Development", es: "Desarrollo de Software" },
    { en: "Frontend Engineering", es: "Ingeniería Frontend" },
    { en: "UI/UX Engineering", es: "Ingeniería UI/UX" },
    { en: "AI Architecture", es: "Arquitectura de Inteligencia Artificial" },
    { en: "AI Systems Engineering", es: "Ingeniería de Sistemas de Inteligencia Artificial" },
    { en: "Website Development", es: "Desarrollo Web" },
    { en: "Technical Infrastructure", es: "Infraestructura Tecnológica" },
    { en: "Product Engineering", es: "Ingeniería de Producto" },
    { en: "Digital Experience Architecture", es: "Arquitectura de Experiencia Digital" },
  ] satisfies Bilingual[],
} as const;

export const attribution = {
  ownership: {
    en: "Tranquility Level Cleaning · Founded by Treva Williams",
    es: "Tranquility Level Cleaning · Fundada por Treva Williams",
  } satisfies Bilingual,
  engineering: {
    en: "Digital experience engineered by Express Development Inc.",
    es: "Experiencia digital desarrollada por Express Development Inc.",
  } satisfies Bilingual,
  leadershipHeading: { en: "Leadership", es: "Liderazgo" } satisfies Bilingual,
  technologyHeading: { en: "Technology Leadership", es: "Liderazgo Tecnológico" } satisfies Bilingual,
} as const;
