// Shared data layer for the Aurum Sanctum visual system (landing page + showcase)

export interface ElementData {
  atomic: number;
  symbol: string;
  name: string;
  greek: string;
  mass: number;
  density: number;
  fusion: number;
  boil: number;
  hue: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface AttrDef {
  icon: string;
  label: string;
  unit: string;
}

export const ELEMENTS: Record<string, ElementData> = {
  H:  { atomic: 1,  symbol: 'H',  name: 'Hidrogênio', greek: 'Ὑδρογόνος',  mass: 1.008,   density: 0.0000899, fusion: 13.99,  boil: 20.27,  hue: 210, rarity: 'Common'    },
  Li: { atomic: 3,  symbol: 'Li', name: 'Lítio',       greek: 'Λίθιον',     mass: 6.941,   density: 0.534,     fusion: 453.7,  boil: 1615,   hue: 200, rarity: 'Rare'       },
  Na: { atomic: 11, symbol: 'Na', name: 'Sódio',        greek: 'Νάτριον',    mass: 22.990,  density: 0.971,     fusion: 370.9,  boil: 1156,   hue: 30,  rarity: 'Common'    },
  Fe: { atomic: 26, symbol: 'Fe', name: 'Ferro',        greek: 'Φερρούμ',    mass: 55.845,  density: 7.87,      fusion: 1811,   boil: 3134,   hue: 25,  rarity: 'Common'    },
  Au: { atomic: 79, symbol: 'Au', name: 'Ouro',         greek: 'Αὐρούμ',     mass: 196.967, density: 19.32,     fusion: 1337.3, boil: 3243,   hue: 45,  rarity: 'Legendary' },
  Hg: { atomic: 80, symbol: 'Hg', name: 'Mercúrio',     greek: 'Ὑδράργυρος', mass: 200.592, density: 13.534,    fusion: 234.3,  boil: 630,    hue: 180, rarity: 'Epic'       },
  O:  { atomic: 8,  symbol: 'O',  name: 'Oxigênio',     greek: 'Ὀξύγονος',   mass: 15.999,  density: 0.001429,  fusion: 54.36,  boil: 90.20,  hue: 200, rarity: 'Common'    },
  C:  { atomic: 6,  symbol: 'C',  name: 'Carbono',      greek: 'Κάρβων',     mass: 12.011,  density: 2.267,     fusion: 3915,   boil: 4300,   hue: 120, rarity: 'Common'    },
  Cu: { atomic: 29, symbol: 'Cu', name: 'Cobre',        greek: 'Κύπριος',    mass: 63.546,  density: 8.96,      fusion: 1357.8, boil: 2835,   hue: 20,  rarity: 'Rare'      },
};

export const ATTR: Record<string, AttrDef> = {
  mass:    { icon: '⚖',  label: 'Massa',      unit: 'u'     },
  density: { icon: '≋',  label: 'Densidade',  unit: 'g/cm³' },
  fusion:  { icon: '🔥', label: 'Fusão',      unit: 'K'     },
  boil:    { icon: '💧', label: 'Ebulição',   unit: 'K'     },
  atomic:  { icon: '⚛',  label: 'Número At.', unit: ''      },
};

// Periodic table main grid positions: [row, col, symbol]
export const PERIODIC: [number, number, string][] = [
  [1,1,'H'],[1,18,'He'],
  [2,1,'Li'],[2,2,'Be'],[2,13,'B'],[2,14,'C'],[2,15,'N'],[2,16,'O'],[2,17,'F'],[2,18,'Ne'],
  [3,1,'Na'],[3,2,'Mg'],[3,13,'Al'],[3,14,'Si'],[3,15,'P'],[3,16,'S'],[3,17,'Cl'],[3,18,'Ar'],
  [4,1,'K'],[4,2,'Ca'],[4,3,'Sc'],[4,4,'Ti'],[4,5,'V'],[4,6,'Cr'],[4,7,'Mn'],[4,8,'Fe'],
  [4,9,'Co'],[4,10,'Ni'],[4,11,'Cu'],[4,12,'Zn'],[4,13,'Ga'],[4,14,'Ge'],[4,15,'As'],[4,16,'Se'],[4,17,'Br'],[4,18,'Kr'],
  [5,1,'Rb'],[5,2,'Sr'],[5,3,'Y'],[5,4,'Zr'],[5,5,'Nb'],[5,6,'Mo'],[5,7,'Tc'],[5,8,'Ru'],
  [5,9,'Rh'],[5,10,'Pd'],[5,11,'Ag'],[5,12,'Cd'],[5,13,'In'],[5,14,'Sn'],[5,15,'Sb'],[5,16,'Te'],[5,17,'I'],[5,18,'Xe'],
  [6,1,'Cs'],[6,2,'Ba'],[6,4,'Hf'],[6,5,'Ta'],[6,6,'W'],[6,7,'Re'],[6,8,'Os'],
  [6,9,'Ir'],[6,10,'Pt'],[6,11,'Au'],[6,12,'Hg'],[6,13,'Tl'],[6,14,'Pb'],[6,15,'Bi'],[6,16,'Po'],[6,17,'At'],[6,18,'Rn'],
  [7,1,'Fr'],[7,2,'Ra'],[7,4,'Rf'],[7,5,'Db'],[7,6,'Sg'],[7,7,'Bh'],[7,8,'Hs'],
  [7,9,'Mt'],[7,10,'Ds'],[7,11,'Rg'],[7,12,'Cn'],[7,13,'Nh'],[7,14,'Fl'],[7,15,'Mc'],[7,16,'Lv'],[7,17,'Ts'],[7,18,'Og'],
];

export const FORMULAS: string[] = [
  'H₂O', 'NaCl', 'CO₂', 'CH₄', 'C₆H₁₂O₆', 'H₂SO₄', 'NH₃', 'C₂H₅OH', 'Fe₂O₃', 'CaCO₃', 'HCl', 'KMnO₄',
];

export const fmt = (n: number | undefined | null): string => {
  if (n === undefined || n === null) return '—';
  if (n !== 0 && Math.abs(n) < 0.001) return n.toExponential(2);
  if (Math.abs(n) >= 10000) return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 3 });
};
