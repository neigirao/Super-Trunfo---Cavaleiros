import { Filter, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface RankingFiltersProps {
  selectedDifficulty: string;
  onDifficultyChange: (value: string) => void;
  selectedMode: string;
  onModeChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const RankingFilters = ({
  selectedDifficulty,
  onDifficultyChange,
  selectedMode,
  onModeChange,
  onClearFilters,
  hasActiveFilters
}: RankingFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {/* Difficulty Filter */}
      <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
        <SelectTrigger className="w-[180px]">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Dificuldade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="muito_facil">Muito Fácil</SelectItem>
          <SelectItem value="facil">Fácil</SelectItem>
          <SelectItem value="medio">Médio</SelectItem>
          <SelectItem value="dificil">Difícil</SelectItem>
          <SelectItem value="muito_dificil">Muito Difícil</SelectItem>
        </SelectContent>
      </Select>

      {/* Mode Filter */}
      <Select value={selectedMode} onValueChange={onModeChange}>
        <SelectTrigger className="w-[160px]">
          <TrendingUp className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Modo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="classic">Clássico</SelectItem>
          <SelectItem value="battle">Batalha</SelectItem>
          <SelectItem value="tournament">Torneio</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="ml-auto"
        >
          Limpar Filtros
        </Button>
      )}
    </div>
  );
};

export default RankingFilters;
