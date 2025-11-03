/**
 * @fileoverview Tipos relacionados a usuários, perfis e progressão
 * 
 * Define interfaces para gerenciamento de usuários, perfis, rankings,
 * conquistas e sistema de progressão.
 * 
 * @module types/user
 */

/**
 * Perfil de usuário do sistema
 */
export interface UserProfile {
  /** ID único do usuário (UUID da autenticação) */
  id: string;
  
  /** Email do usuário */
  email: string;
  
  /** Nome completo do usuário */
  full_name?: string;
  
  /** URL do avatar */
  avatar_url?: string;
  
  /** Nível atual do jogador */
  level: number;
  
  /** Pontos de experiência atuais */
  experience: number;
  
  /** Pontos totais do jogador */
  points: number;
  
  /** Role do usuário (user, admin, etc) */
  role: 'user' | 'admin';
  
  /** Data de criação da conta */
  created_at: Date;
}

/**
 * Estatísticas de ranking do jogo de cartas
 */
export interface CardGameRanking {
  /** ID do ranking */
  id: string;
  
  /** ID do usuário */
  user_id: string;
  
  /** Nome do jogador */
  player_name: string;
  
  /** Pontuação total acumulada */
  total_score: number;
  
  /** Total de jogos disputados */
  total_games: number;
  
  /** Jogos vencidos */
  games_won: number;
  
  /** Jogos perdidos */
  games_lost: number;
  
  /** Taxa de vitória (0-100) */
  win_rate: number;
  
  /** Maior pontuação em uma única partida */
  highest_score: number;
  
  /** Sequência atual de vitórias */
  current_streak: number;
  
  /** Maior sequência de vitórias já alcançada */
  longest_streak: number;
  
  /** Total de cartas jogadas em todas as partidas */
  total_cards_played: number;
  
  /** Duração média das partidas (segundos) */
  average_game_duration: number;
  
  /** Nível de dificuldade preferido */
  difficulty_level: 'easy' | 'medium' | 'hard';
  
  /** Tipo de elemento favorito (baseado em uso) */
  favorite_element_type?: string;
  
  /** Data da última partida */
  last_played_at?: Date;
  
  /** Data de criação do ranking */
  created_at: Date;
  
  /** Data da última atualização */
  updated_at: Date;
}

/**
 * Sistema de conquistas
 */
export interface Achievement {
  /** ID único da conquista */
  achievement_id: string;
  
  /** Título da conquista */
  title: string;
  
  /** Descrição de como desbloquear */
  description: string;
  
  /** Ícone representativo */
  icon: string;
  
  /** Raridade da conquista */
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  
  /** Pontos de experiência concedidos */
  xp_reward: number;
  
  /** Progresso máximo necessário */
  max_progress: number;
  
  /** Se é uma conquista secreta */
  is_hidden: boolean;
}

/**
 * Progresso de conquista do usuário
 */
export interface UserAchievement {
  /** ID do progresso */
  id: string;
  
  /** ID do usuário */
  user_id: string;
  
  /** ID da conquista */
  achievement_id: string;
  
  /** Progresso atual */
  progress: number;
  
  /** Progresso máximo necessário */
  max_progress: number;
  
  /** Se a conquista foi desbloqueada */
  is_unlocked: boolean;
  
  /** Data de desbloqueio */
  unlocked_at?: Date;
  
  /** Data de criação */
  created_at: Date;
}

/**
 * Nível e progressão do jogador
 */
export interface PlayerLevel {
  /** Nível atual */
  level: number;
  
  /** Experiência atual no nível */
  experience: number;
  
  /** Experiência necessária para próximo nível */
  experienceToNextLevel: number;
  
  /** Experiência total acumulada */
  totalExperience: number;
}

/**
 * Customização do usuário
 */
export interface UserCustomization {
  /** ID do usuário */
  user_id: string;
  
  /** Estilo do avatar */
  avatar_style: 'default' | 'minimal' | 'detailed';
  
  /** Preferência de tema */
  theme_preference: 'light' | 'dark' | 'system';
  
  /** Preferências de notificações */
  notification_preferences: {
    achievements: boolean;
    pack_reminder: boolean;
    daily_challenge: boolean;
  };
  
  /** Data de criação */
  created_at: Date;
  
  /** Data de última atualização */
  updated_at: Date;
}

/**
 * Histórico de partidas do usuário
 */
export interface UserGameHistory {
  /** ID do histórico */
  id: string;
  
  /** ID do usuário */
  user_id: string;
  
  /** Pontuação da partida */
  score: number;
  
  /** Acertos */
  correct_guesses: number;
  
  /** Total de tentativas */
  total_attempts: number;
  
  /** Duração da partida (segundos) */
  game_duration?: number;
  
  /** Sequência atual na partida */
  current_streak: number;
  
  /** Maior sequência na partida */
  max_streak: number;
  
  /** Tempo total gasto */
  time_taken?: number;
  
  /** Multiplicador de dificuldade aplicado */
  difficulty_multiplier: number;
  
  /** Modo de jogo */
  game_mode: 'classic' | 'timed' | 'challenge';
  
  /** Nível de dificuldade */
  difficulty_level?: string;
  
  /** Data da partida */
  created_at: Date;
}

/**
 * Baralho salvo do usuário
 */
export interface UserDeck {
  /** ID do baralho */
  id: string;
  
  /** ID do usuário */
  user_id: string;
  
  /** Nome do baralho */
  name: string;
  
  /** IDs das cartas no baralho */
  card_ids: string[];
  
  /** Se é o baralho favorito */
  is_favorite: boolean;
  
  /** Data de criação */
  created_at: Date;
  
  /** Data de última atualização */
  updated_at: Date;
}

/**
 * Alias para CardGameRanking
 * Usado nos repositórios
 */
export type RankingEntry = CardGameRanking;
