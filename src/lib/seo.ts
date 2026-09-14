import { absoluteBrandAsset, brandAssets, productionSiteUrl } from "@/config/brand";

interface SeoInput {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}

export function seo({ title, description, path, type = "website" }: SeoInput) {
  const normalizedPath = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  const url = new URL(normalizedPath, productionSiteUrl).toString();
  const socialImage = absoluteBrandAsset(brandAssets.logoMaster);

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:site_name", content: "Tranquility Level Cleaning" },
      { property: "og:image", content: socialImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: socialImage },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
