interface SeoInput {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}

/** Builds route head() meta + canonical link. Paths stay relative until a domain exists. */
export function seo({ title, description, path, type = "website" }: SeoInput) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: path },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: path }],
  };
}
