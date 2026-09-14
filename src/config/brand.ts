export const brandAssets = {
  logo: "/brand/tranquility-logo.webp",
  logoMaster: "/brand/tranquility-logo-master.png",
  logo512: "/brand/tranquility-logo-512.png",
  logo256: "/brand/tranquility-logo-256.png",
  icon192: "/brand/tranquility-logo-192.png",
  appleTouchIcon: "/brand/tranquility-logo-180.png",
  favicon32: "/brand/tranquility-logo-32.png",
  favicon16: "/brand/tranquility-logo-16.png",
  faviconIco: "/favicon.ico",
} as const;

export const productionSiteUrl = "https://heytlcleaning.com";

export function absoluteBrandAsset(path: string) {
  return new URL(path, productionSiteUrl).toString();
}
