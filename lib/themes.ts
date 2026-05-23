export interface ThemeMeta {
  id: string;
  label: string;
  description: string;
}

export const THEMES: ThemeMeta[] = [
  { id: "slate", label: "Slate", description: "Neutral grays" },
  { id: "rose", label: "Rose", description: "Warm pinks" },
  { id: "amber", label: "Amber", description: "Honey & golden" },
  { id: "forest", label: "Forest", description: "Deep greens" },
  { id: "ocean", label: "Ocean", description: "Cool blues" },
  { id: "lavender", label: "Lavender", description: "Soft purples" },
  { id: "crimson", label: "Crimson", description: "Deep reds" },
  { id: "mocha", label: "Mocha", description: "Coffee browns" },
  { id: "mono", label: "Mono", description: "Pure grayscale" },
  { id: "sand", label: "Sand", description: "Warm beige & paper" },
];
