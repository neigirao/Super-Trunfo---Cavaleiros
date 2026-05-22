
export enum Difficulty {
  Easy = 'Fácil',
  Normal = 'Normal',
  Hard = 'Difícil',
}

export enum ElementType {
  NobleGas = 'Gás Nobre',
  Halogen = 'Halogênio',
  AlkaliMetal = 'Metal Alcalino',
  TransitionMetal = 'Metal de Transição',
  Actinide = 'Actinídeo',
  // Categorias adicionais para elementos que não se encaixam nos principais grupos de vantagens
  AlkalineEarthMetal = 'Metal Alcalinoterroso',
  Lanthanide = 'Lantanídeo',
  PostTransitionMetal = 'Metal Pós-Transição',
  Metalloid = 'Metaloide',
  ReactiveNonmetal = 'Não Metal Reativo',
}

export enum Attribute {
  Reatividade = 'Reatividade',
  MassaAtomica = 'Massa Atômica',
  Radioatividade = 'Radioatividade',
  Condutividade = 'Condutividade',
  Dureza = 'Dureza',
}

export interface CardData {
  id: string;
  name: string;
  imageUrl: string;
  element: ElementType;
  attributes: {
    [Attribute.Reatividade]: number;
    [Attribute.MassaAtomica]: number;
    [Attribute.Radioatividade]: number;
    [Attribute.Condutividade]: number;
    [Attribute.Dureza]: number;
  };
  isSuperTrunfo?: boolean;
}

export enum GameState {
  Menu,
  Playing,
  RoundResult,
  GameOver,
  Ranking,
  Admin,
  Collection,
  Rules,
}

export type RoundResult = {
  winner: 'player' | 'ai' | 'tie';
  attribute: Attribute;
  playerCard: CardData;
  aiCard: CardData;
  playerValue: number;
  aiValue: number;
  playerBonus: number;
  aiBonus: number;
};

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

export interface RankingEntry {
  rank: number;
  user: {
    name: string;
    picture: string;
  };
  wins: number;
  score: number;
}