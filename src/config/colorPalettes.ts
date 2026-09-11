export interface ColorPalettePreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
}

export const colorPalettes: ColorPalettePreset[] = [
  { id: "ocean-mist", name: "Ocean Mist", primary: "#2B7C87", secondary: "#8FD7D1" },
  { id: "sapphire", name: "Sapphire", primary: "#0757C9", secondary: "#6EC8FF" },
  { id: "emerald", name: "Emerald", primary: "#087A5A", secondary: "#65D6A8" },
  { id: "garnet", name: "Garnet", primary: "#9F1838", secondary: "#F07A8E" },
  { id: "amethyst", name: "Amethyst", primary: "#6B3BC4", secondary: "#C397FF" },
  { id: "rose-quartz", name: "Rose Quartz", primary: "#C85683", secondary: "#F5B6CB" },
  { id: "copper", name: "Copper", primary: "#9A4E1E", secondary: "#E8A56D" },
  { id: "lagoon", name: "Lagoon", primary: "#047A83", secondary: "#55D6D9" },
  { id: "cobalt", name: "Cobalt", primary: "#2146D7", secondary: "#879CFF" },
  { id: "orchid", name: "Orchid", primary: "#9135A7", secondary: "#E89AF4" },
  { id: "bronze", name: "Champagne Bronze", primary: "#8A6533", secondary: "#E8C889" },
  { id: "arctic", name: "Arctic Silver", primary: "#667789", secondary: "#D8E2EC" },
  { id: "pine", name: "Forest Pine", primary: "#285A3E", secondary: "#8FBE95" },
  { id: "crimson", name: "Crimson Velvet", primary: "#B11226", secondary: "#FF7A7F" },
  { id: "cyan", name: "Ocean Cyan", primary: "#007EAF", secondary: "#62D9FF" },
  { id: "aubergine", name: "Aubergine", primary: "#59304F", secondary: "#C58AB8" },
  { id: "coral", name: "Coral Sunset", primary: "#D85E47", secondary: "#FFB084" },
  { id: "mint", name: "Mint Glacier", primary: "#249B88", secondary: "#A7EAD9" },
  { id: "indigo", name: "Indigo Iris", primary: "#3E3A9A", secondary: "#A9A3FF" },
  { id: "graphite", name: "Graphite Chrome", primary: "#3B4653", secondary: "#AEB9C5" },
  { id: "amber", name: "Honey Amber", primary: "#B66B00", secondary: "#FFD06A" },
  { id: "turquoise", name: "Turquoise", primary: "#008C91", secondary: "#71E7E4" },
  { id: "cherry", name: "Cherry Noir", primary: "#76162C", secondary: "#D35B72" },
  { id: "olive", name: "Olive Luxe", primary: "#65721E", secondary: "#C8D36A" },
  { id: "lavender", name: "Lavender Pearl", primary: "#7C68AE", secondary: "#D8C9F3" },
  { id: "espresso", name: "Espresso Bronze", primary: "#5F3A2B", secondary: "#BF8B65" },
  { id: "raspberry", name: "Raspberry", primary: "#A51F64", secondary: "#EE78B3" },
  { id: "ice-blue", name: "Ice Blue", primary: "#3D7A9C", secondary: "#BDEBFF" },
  { id: "citrine", name: "Citrine", primary: "#8A7A00", secondary: "#EFE85B" },
  { id: "terracotta", name: "Terracotta", primary: "#A84F34", secondary: "#EBA17A" },
  { id: "magenta", name: "Midnight Magenta", primary: "#7A1B77", secondary: "#E36EDB" },
  { id: "white-gold", name: "White Gold", primary: "#9D8A67", secondary: "#F5E7C4" },
];

export const defaultColorPaletteId = "ocean-mist";

export function getColorPalette(id: string | null | undefined): ColorPalettePreset {
  return colorPalettes.find((palette) => palette.id === id) ?? colorPalettes[0]!;
}
