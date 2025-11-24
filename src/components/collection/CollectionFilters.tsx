import { Search, Filter, SortAsc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CollectionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedRarity: string;
  onRarityChange: (value: string) => void;
  selectedElement: string;
  onElementChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const CollectionFilters = ({
  searchTerm,
  onSearchChange,
  selectedRarity,
  onRarityChange,
  selectedElement,
  onElementChange,
  sortBy,
  onSortChange,
  onClearFilters,
  hasActiveFilters
}: CollectionFiltersProps) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cavaleiro ou elemento..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3">
        {/* Rarity Filter */}
        <Select value={selectedRarity} onValueChange={onRarityChange}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Raridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="common">Comum</SelectItem>
            <SelectItem value="rare">Raro</SelectItem>
            <SelectItem value="epic">Épico</SelectItem>
            <SelectItem value="legendary">Lendário</SelectItem>
          </SelectContent>
        </Select>

        {/* Element Type Filter */}
        <Select value={selectedElement} onValueChange={onElementChange}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="metal">Metal</SelectItem>
            <SelectItem value="non-metal">Não-Metal</SelectItem>
            <SelectItem value="noble_gas">Gás Nobre</SelectItem>
            <SelectItem value="metalloid">Metaloide</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SortAsc className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
            <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
            <SelectItem value="rarity_desc">Raridade (Maior)</SelectItem>
            <SelectItem value="rarity_asc">Raridade (Menor)</SelectItem>
            <SelectItem value="atomic_asc">Número Atômico ↑</SelectItem>
            <SelectItem value="atomic_desc">Número Atômico ↓</SelectItem>
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

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary">
              Busca: {searchTerm}
            </Badge>
          )}
          {selectedRarity !== 'all' && (
            <Badge variant="secondary">
              Raridade: {selectedRarity}
            </Badge>
          )}
          {selectedElement !== 'all' && (
            <Badge variant="secondary">
              Tipo: {selectedElement.replace('_', ' ')}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default CollectionFilters;
