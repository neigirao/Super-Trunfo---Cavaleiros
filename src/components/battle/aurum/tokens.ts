/**
 * Aurum Sanctum design tokens & helpers.
 * Keeps colors centralized so components stay in sync with index.css.
 */

export const aurum = {
  gold: "hsl(43, 88%, 62%)",
  goldDeep: "hsl(36, 53%, 35%)",
  goldDark: "hsl(36, 56%, 21%)",
  marble: "hsl(41, 50%, 90%)",
  marbleMid: "hsl(38, 39%, 81%)",
  marbleDeep: "hsl(38, 35%, 72%)",
  ink: "hsl(24, 70%, 6%)",
  inkSoft: "hsl(26, 55%, 11%)",
  cream: "hsl(43, 80%, 94%)",
  blood: "hsl(0, 64%, 57%)",
  bloodSoft: "hsl(0, 100%, 73%)",
};

export const rarityColor = (rarity?: string): string => {
  switch ((rarity || "common").toLowerCase()) {
    case "legendary":
      return aurum.gold;
    case "epic":
      return "hsl(270, 90%, 78%)";
    case "rare":
      return "hsl(204, 100%, 80%)";
    default:
      return "hsl(225, 25%, 69%)";
  }
};

export const fmt = (n: number | undefined | null): string => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  if (Math.abs(n) >= 1000) return n.toFixed(0);
  if (Math.abs(n) >= 10) return n.toFixed(1);
  return n.toFixed(2);
};

export const ATTR_META: Record<
  string,
  { label: string; icon: string; unit: string }
> = {
  atomic_number: { label: "Nº Atômico", icon: "Z", unit: "" },
  atomic_mass: { label: "Massa", icon: "⚖", unit: "u" },
  density: { label: "Densidade", icon: "◈", unit: "g/cm³" },
  melting_point: { label: "P. Fusão", icon: "♨", unit: "K" },
  reactivity: { label: "Reatividade", icon: "⚡", unit: "" },
  radioactivity: { label: "Radioat.", icon: "☢", unit: "" },
};

export const ATTR_KEYS = [
  "atomic_number",
  "atomic_mass",
  "density",
  "melting_point",
  "reactivity",
  "radioactivity",
] as const;

/** Curated subset of the periodic table used for the decorative frieze/watermark. */
export const PERIODIC: Array<[number, number, string]> = [
  [1, 1, "H"], [1, 18, "He"],
  [2, 1, "Li"], [2, 2, "Be"], [2, 13, "B"], [2, 14, "C"], [2, 15, "N"], [2, 16, "O"], [2, 17, "F"], [2, 18, "Ne"],
  [3, 1, "Na"], [3, 2, "Mg"], [3, 13, "Al"], [3, 14, "Si"], [3, 15, "P"], [3, 16, "S"], [3, 17, "Cl"], [3, 18, "Ar"],
  [4, 1, "K"], [4, 2, "Ca"], [4, 3, "Sc"], [4, 4, "Ti"], [4, 5, "V"], [4, 6, "Cr"], [4, 7, "Mn"], [4, 8, "Fe"], [4, 9, "Co"], [4, 10, "Ni"], [4, 11, "Cu"], [4, 12, "Zn"],
  [5, 11, "Ag"], [5, 13, "In"], [5, 14, "Sn"],
  [6, 11, "Au"], [6, 12, "Hg"], [6, 13, "Tl"], [6, 14, "Pb"], [6, 15, "Bi"],
  [7, 1, "Fr"], [7, 2, "Ra"],
];

export const FORMULAS = [
  "H₂O", "CO₂", "NaCl", "CH₄", "NH₃", "H₂SO₄", "C₆H₁₂O₆", "Fe₂O₃", "HCl", "O₂",
];
