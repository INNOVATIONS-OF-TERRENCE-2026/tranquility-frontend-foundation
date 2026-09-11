import hero1 from "./uploaded/hero-1.b64?raw";
import hero2 from "./uploaded/hero-2.b64?raw";
import hero3 from "./uploaded/hero-3.b64?raw";
import hero4 from "./uploaded/hero-4.b64?raw";
import light from "./uploaded/light.b64?raw";
import studio from "./uploaded/studio.b64?raw";

function webp(parts: string[]) {
  return `data:image/webp;base64,${parts.map((part) => part.trim()).join("")}`;
}

export const uploadedBrandHero = webp([hero1, hero2, hero3, hero4]);
export const uploadedBrandLight = webp([light]);
export const uploadedStudioConcept = webp([studio]);
