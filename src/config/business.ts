export const business = {
  legalName: "Tranquility Level Cleaning",
  shortName: "Tranquility Cleaning",
  tagline: "Come home to tranquility.",
  phoneDisplay: "(945) 402-3260",
  phoneHref: "tel:+19454023260",
  email: "tlcllc26@gmail.com",
  emailHref: "mailto:tlcllc26@gmail.com",
  serviceAreaLabel: "Dallas-Fort Worth and surrounding communities",
} as const;

export interface ServiceCity {
  name: string;
  latitude: number;
  longitude: number;
}

export const serviceCities: ServiceCity[] = [
  { name: "Dallas", latitude: 32.7767, longitude: -96.797 },
  { name: "Fort Worth", latitude: 32.7555, longitude: -97.3308 },
  { name: "Arlington", latitude: 32.7357, longitude: -97.1081 },
  { name: "Plano", latitude: 33.0198, longitude: -96.6989 },
  { name: "Irving", latitude: 32.814, longitude: -96.9489 },
  { name: "Garland", latitude: 32.9126, longitude: -96.6389 },
  { name: "Frisco", latitude: 33.1507, longitude: -96.8236 },
  { name: "McKinney", latitude: 33.1972, longitude: -96.6398 },
  { name: "Grand Prairie", latitude: 32.7459, longitude: -96.9978 },
  { name: "Denton", latitude: 33.2148, longitude: -97.1331 },
  { name: "Mesquite", latitude: 32.7668, longitude: -96.5992 },
  { name: "Carrollton", latitude: 32.9537, longitude: -96.8903 },
  { name: "Lewisville", latitude: 33.0462, longitude: -96.9942 },
  { name: "Richardson", latitude: 32.9483, longitude: -96.7299 },
  { name: "Euless", latitude: 32.8371, longitude: -97.0819 },
];

export const cities = serviceCities.map((city) => city.name);

export function mailtoLink(subject: string, body: string) {
  return `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
