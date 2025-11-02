/**
 * @fileoverview Tipos relacionados a cartas do jogo Super Trunfo
 * 
 * Este arquivo centraliza todos os tipos relacionados às cartas dos elementos,
 * incluindo atributos, raridades, tipos de elementos e estruturas de dados.
 * 
 * @module types/card
 */

/**
 * Raridade das cartas no jogo
 * - common: Cartas comuns (mais frequentes)
 * - rare: Cartas raras (média frequência)
 * - epic: Cartas épicas (baixa frequência)
 * - legendary: Cartas lendárias (muito raras)
 */
export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * Tipos de elementos químicos
 * Baseado na classificação da tabela periódica
 */
export type ElementType = 
  | 'metal' 
  | 'non-metal' 
  | 'metalloid' 
  | 'noble_gas' 
  | 'alkali_metal' 
  | 'alkaline_earth' 
  | 'transition_metal' 
  | 'post_transition_metal' 
  | 'halogen' 
  | 'lanthanide' 
  | 'actinide';

/**
 * Atributos numéricos que podem ser usados em batalhas
 * Cada atributo representa uma propriedade física/química do elemento
 */
export type BattleAttribute = 
  | 'atomic_number'    // Número atômico (Z)
  | 'atomic_mass'      // Massa atômica (u)
  | 'density'          // Densidade (g/cm³)
  | 'melting_point'    // Ponto de fusão (K)
  | 'reactivity'       // Reatividade (0-100)
  | 'radioactivity';   // Radioatividade (0-100)

/**
 * Representação completa de uma carta de elemento
 * 
 * @interface ElementCard
 * 
 * @example
 * ```typescript
 * const hydrogenCard: ElementCard = {
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   name: 'Hidrogênio',
 *   symbol: 'H',
 *   atomic_number: 1,
 *   atomic_mass: 1.008,
 *   density: 0.0899,
 *   melting_point: 14.01,
 *   reactivity: 85,
 *   radioactivity: 0,
 *   knight_name: 'Cavaleiro do Primeiro Elemento',
 *   special_ability: 'Combustão Estelar',
 *   rarity: 'legendary',
 *   element_type: 'non-metal',
 *   is_super_trump: false,
 *   image_url: 'https://...'
 * };
 * ```
 */
export interface ElementCard {
  /** Identificador único da carta (UUID) */
  id: string;
  
  /** Nome do elemento químico */
  name: string;
  
  /** Símbolo químico (1-3 caracteres) */
  symbol: string;
  
  /** Número atômico (Z) - número de prótons */
  atomic_number: number;
  
  /** Massa atômica em unidades de massa atômica (u) */
  atomic_mass: number;
  
  /** Densidade em g/cm³ */
  density: number;
  
  /** Ponto de fusão em Kelvin */
  melting_point: number;
  
  /** Nível de reatividade (0-100) */
  reactivity: number;
  
  /** Nível de radioatividade (0-100) */
  radioactivity: number;
  
  /** Nome temático do cavaleiro associado ao elemento */
  knight_name: string;
  
  /** Habilidade especial temática da carta */
  special_ability: string;
  
  /** Raridade da carta (afeta drop rate) */
  rarity: CardRarity;
  
  /** Classificação do tipo de elemento */
  element_type: ElementType;
  
  /** Se true, esta carta é um Super Trunfo (vence quase todas as outras) */
  is_super_trump: boolean;
  
  /** 
   * Símbolo do elemento que é fraqueza deste Super Trunfo
   * Apenas relevante se is_super_trump === true
   */
  trump_weakness?: string;
  
  /** URL da imagem da carta (opcional) */
  image_url?: string;
}

/**
 * Carta do usuário com informações de quantidade
 * Estende ElementCard com metadados de posse
 */
export interface UserCard extends ElementCard {
  /** Quantidade desta carta que o usuário possui */
  quantity: number;
  
  /** Data em que a carta foi obtida */
  obtained_at: Date;
}

/**
 * Informações sobre um pacote de cartas aberto
 */
export interface PackOpening {
  /** Identificador único da abertura */
  id: string;
  
  /** ID do usuário que abriu o pacote */
  user_id: string;
  
  /** Tipo do pacote (starter, weekly, premium, etc) */
  pack_type: string;
  
  /** Array de cartas obtidas no pacote */
  cards_obtained: ElementCard[];
  
  /** Data e hora da abertura */
  opened_at: Date;
}

/**
 * Metadados de raridade para configuração do sistema
 */
export interface RarityMetadata {
  rarity: CardRarity;
  /** Cor temática da raridade (para UI) */
  color: string;
  /** Chance de drop em porcentagem (0-100) */
  dropRate: number;
  /** Multiplicador de pontos em batalha */
  scoreMultiplier: number;
}
