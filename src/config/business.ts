export const business = {
  legalName: "Tranquility Level Cleaning",
  shortName: "Tranquility Cleaning",
  tagline: "Come home to tranquility.",
  phoneDisplay: "(945) 402-3260",
  phoneHref: "tel:+19454023260",
  email: "tlcllc26@gmail.com",
  emailHref: "mailto:tlcllc26@gmail.com",
  serviceAreaLabel: "Dallas–Fort Worth and surrounding communities",
} as const;

export const cities = [
  "Dallas",
  "Fort Worth",
  "Arlington",
  "Plano",
  "Irving",
  "Garland",
  "Frisco",
  "McKinney",
  "Grand Prairie",
  "Denton",
  "Mesquite",
  "Carrollton",
  "Lewisville",
  "Richardson",
] as const;

/** Builds a mailto: link with an encoded subject and plain-text body. */
export function mailtoLink(subject: string, body: string) {
  return `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
