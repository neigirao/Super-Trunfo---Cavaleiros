/**
 * @fileoverview Tipos relacionados à mecânica geral do jogo
 * 
 * Define tipos e interfaces para desafios diários, eventos ao vivo,
 * tutoriais e outras funcionalidades do jogo.
 * 
 * @module types/game
 */

/**
 * Desafio diário
 */
export interface DailyChallenge {
  /** ID do desafio */
  id: string;
  
  /** Título do desafio */
  title: string;
  
  /** Descrição detalhada */
  description: string;
  
  /** Tipo de desafio */
  challenge_type: 'wins' | 'rounds' | 'streak' | 'specific_card';
  
  /** Métrica alvo */
  target_metric: string;
  
  /** Valor alvo a ser alcançado */
  target_value: number;
  
  /** Pontos de recompensa */
  reward_points: number;
  
  /** Data de início */
  start_date: Date;
  
  /** Data de término */
  end_date: Date;
  
  /** Se o desafio está ativo */
  is_active: boolean;
  
  /** Data de criação */
  created_at: Date;
}

/**
 * Progresso do usuário em um desafio
 */
export interface UserChallengeProgress {
  /** ID do progresso */
  id: string;
  
  /** ID do usuário */
  user_id: string;
  
  /** ID do desafio */
  challenge_id: string;
  
  /** Progresso atual */
  current_progress: number;
  
  /** Se o desafio foi completado */
  is_completed: boolean;
  
  /** Data de conclusão */
  completed_at?: Date;
  
  /** Data de criação */
  created_at: Date;
  
  /** Data de última atualização */
  updated_at: Date;
}

/**
 * Evento ao vivo no jogo
 */
export interface LiveEvent {
  /** ID do evento */
  id: string;
  
  /** Título do evento */
  title: string;
  
  /** Descrição */
  description: string;
  
  /** Tipo de evento */
  event_type: 'tournament' | 'special_pack' | 'double_xp' | 'challenge';
  
  /** Hora de início */
  start_time: Date;
  
  /** Hora de término */
  end_time?: Date;
  
  /** Se o evento está ativo */
  is_active: boolean;
  
  /** Metadados adicionais (JSON) */
  metadata: Record<string, any>;
  
  /** Data de criação */
  created_at: Date;
}

/**
 * Estatística ao vivo do jogo
 */
export interface LiveStats {
  /** Chave da estatística */
  stat_key: string;
  
  /** Valor atual */
  stat_value: number;
  
  /** Data de última atualização */
  updated_at: Date;
}

/**
 * Passo de tutorial
 */
export interface TutorialStep {
  /** ID do passo */
  id: string;
  
  /** Título do passo */
  title: string;
  
  /** Conteúdo/instruções */
  content: string;
  
  /** Elemento alvo (para highlight) */
  targetElement?: string;
  
  /** Posicionamento do tooltip */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  
  /** Se o usuário pode pular este passo */
  skippable: boolean;
}

/**
 * Tutorial completo
 */
export interface Tutorial {
  /** ID do tutorial */
  id: string;
  
  /** Título */
  title: string;
  
  /** Descrição */
  description?: string;
  
  /** Passos do tutorial */
  content: TutorialStep[];
  
  /** Ordem de exibição */
  order_index: number;
  
  /** Dificuldade */
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  /** Duração estimada (minutos) */
  duration_minutes: number;
  
  /** Se é obrigatório */
  is_required: boolean;
  
  /** Data de criação */
  created_at: Date;
  
  /** Data de atualização */
  updated_at: Date;
}

/**
 * Progresso do usuário em tutorial
 */
export interface UserTutorialProgress {
  /** ID do progresso */
  id: string;
  
  /** ID do usuário */
  user_id: string;
  
  /** ID do tutorial */
  tutorial_id: string;
  
  /** Passo atual */
  current_step: number;
  
  /** Se foi completado */
  is_completed: boolean;
  
  /** Data de conclusão */
  completed_at?: Date;
  
  /** Data de criação */
  created_at: Date;
  
  /** Data de atualização */
  updated_at: Date;
}

/**
 * Abertura de pacote de cartas
 */
export interface PackOpening {
  /** ID da abertura */
  id: string;
  
  /** ID do usuário */
  user_id: string;
  
  /** Tipo do pacote */
  pack_type: 'auto_starter' | 'weekly' | 'premium' | 'event';
  
  /** Cartas obtidas */
  cards_obtained: any[]; // JSON array
  
  /** Data de abertura */
  opened_at: Date;
  
  /** Data de criação */
  created_at: Date;
}

/**
 * Notificação admin
 */
export interface AdminNotification {
  /** ID da notificação */
  id: string;
  
  /** Tipo */
  type: 'info' | 'warning' | 'event' | 'maintenance';
  
  /** Título */
  title: string;
  
  /** Mensagem */
  message: string;
  
  /** Público alvo */
  target_audience: 'all' | 'new_users' | 'active_users' | 'vip';
  
  /** Prioridade */
  priority: 'low' | 'normal' | 'high';
  
  /** Se está ativa */
  is_active: boolean;
  
  /** Data de expiração */
  expires_at?: Date;
  
  /** Criado por */
  created_by?: string;
  
  /** Data de criação */
  created_at: Date;
  
  /** Data de atualização */
  updated_at: Date;
}
