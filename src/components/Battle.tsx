/**
 * Battle Component - REFATORADO COM ARQUITETURA MODULAR
 * 
 * Usa o padrão de orquestração com hooks focados:
 * - useBattleOrchestrator: Coordena toda a lógica
 * - BattlePhaseRenderer: Renderiza as fases apropriadas
 * 
 * Benefícios:
 * - Componente principal muito mais simples (< 100 linhas)
 * - Lógica isolada em hooks reutilizáveis
 * - Fácil de testar e manter
 * - IA consegue entender e modificar facilmente
 */
import { useAuth } from '@/contexts/AuthContext';
import ErrorBoundary from './ui/ErrorBoundary';
import BattlePhaseRenderer from './battle/BattlePhaseRenderer';
import { useBattleOrchestrator } from '@/hooks/battle/useBattleOrchestrator';

interface BattleProps {
  onBattleStateChange?: (isActive: boolean) => void;
}

/**
 * Componente principal da batalha
 * Agora apenas coordena os sub-componentes
 */
const Battle = ({ onBattleStateChange }: BattleProps = {}) => {
  const { user } = useAuth();
  
  // Hook orquestrador que gerencia tudo
  const battle = useBattleOrchestrator(
    user?.id,
    user?.email,
    onBattleStateChange
  );

  // Loading state
  if (battle.cards.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando cartas...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-background to-cosmic-dark p-4 md:p-8">
        <BattlePhaseRenderer 
          phase={battle.state.gamePhase} 
          battle={battle}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Battle;
