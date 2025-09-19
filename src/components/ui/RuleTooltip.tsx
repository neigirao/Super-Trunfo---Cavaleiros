import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Crown, Zap, Shield, Flame, Star, Sword } from 'lucide-react';

interface RuleTooltipProps {
  children: ReactNode;
  rule: 'super_trump' | 'attribute' | 'battle_rules' | 'deck_building' | 'turn_system' | 'winning';
  customContent?: ReactNode;
}

const RuleTooltip = ({ children, rule, customContent }: RuleTooltipProps) => {
  const getRuleContent = () => {
    if (customContent) return customContent;

    switch (rule) {
      case 'super_trump':
        return (
          <div className="space-y-2 max-w-xs">
            <div className="flex items-center space-x-2 text-cosmic-gold font-semibold">
              <Crown className="w-4 h-4" />
              <span>Super Trunfo</span>
            </div>
            <p className="text-sm">
              Cartas especiais que vencem qualquer carta normal, exceto quando enfrentam sua fraqueza específica.
            </p>
            <div className="text-xs text-muted-foreground">
              Identifique pela borda dourada e símbolo de coroa.
            </div>
          </div>
        );

      case 'attribute':
        return (
          <div className="space-y-2 max-w-xs">
            <div className="flex items-center space-x-2 text-cosmic-blue font-semibold">
              <Zap className="w-4 h-4" />
              <span>Atributos</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                <Crown className="w-3 h-3" />
                <span>Nº Atômico: Posição na tabela periódica</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sword className="w-3 h-3" />
                <span>Massa Atômica: Peso do átomo</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-3 h-3" />
                <span>Densidade: Compactação da matéria</span>
              </div>
              <div className="flex items-center space-x-2">
                <Flame className="w-3 h-3" />
                <span>P. Fusão: Temperatura de derretimento</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-3 h-3" />
                <span>Reatividade: Capacidade de reação</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-3 h-3" />
                <span>Radioatividade: Emissão de radiação</span>
              </div>
            </div>
          </div>
        );

      case 'battle_rules':
        return (
          <div className="space-y-2 max-w-xs">
            <div className="text-cosmic-purple font-semibold">Regras de Batalha</div>
            <ul className="text-sm space-y-1">
              <li>• Quem vence escolhe o atributo da próxima rodada</li>
              <li>• Em caso de empate, as cartas vão para o monte</li>
              <li>• Super Trunfo sempre vence, exceto contra sua fraqueza</li>
              <li>• Maior valor do atributo vence a rodada</li>
            </ul>
          </div>
        );

      case 'deck_building':
        return (
          <div className="space-y-2 max-w-xs">
            <div className="text-cosmic-gold font-semibold">Construção de Baralho</div>
            <ul className="text-sm space-y-1">
              <li>• Mínimo: 6 cartas</li>
              <li>• Máximo: 20 cartas</li>
              <li>• Ideal: 8-12 cartas para jogos mais rápidos</li>
              <li>• Misture raridades para estratégia balanceada</li>
              <li>• Salve até 5 baralhos diferentes</li>
            </ul>
          </div>
        );

      case 'turn_system':
        return (
          <div className="space-y-2 max-w-xs">
            <div className="text-cosmic-blue font-semibold">Sistema de Turnos</div>
            <ul className="text-sm space-y-1">
              <li>• Jogador sempre começa escolhendo</li>
              <li>• Vencedor da rodada escolhe próximo atributo</li>
              <li>• 15 segundos para escolher o atributo</li>
              <li>• IA escolhe automaticamente o melhor atributo</li>
            </ul>
          </div>
        );

      case 'winning':
        return (
          <div className="space-y-2 max-w-xs">
            <div className="text-cosmic-gold font-semibold">Condições de Vitória</div>
            <ul className="text-sm space-y-1">
              <li>• Capture todas as cartas do oponente</li>
              <li>• Ou termine com mais cartas quando o jogo acabar</li>
              <li>• Cartas ganhas vão para o final do seu baralho</li>
              <li>• Em empates, cartas ficam em jogo para próxima rodada</li>
            </ul>
          </div>
        );

      default:
        return <span>Regra não encontrada</span>;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          align="center"
          className="bg-card/95 backdrop-blur-sm border-cosmic-gold/20 p-3"
        >
          {getRuleContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Componente de ícone de ajuda reutilizável
export const HelpIcon = ({ rule, className = "w-4 h-4 text-muted-foreground hover:text-cosmic-gold cursor-help" }: { rule: RuleTooltipProps['rule'], className?: string }) => (
  <RuleTooltip rule={rule}>
    <HelpCircle className={className} />
  </RuleTooltip>
);

export default RuleTooltip;