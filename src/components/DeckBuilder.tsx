import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import BattleCard from './BattleCard';

interface ElementCard {
  id: string;
  name: string;
  symbol: string;
  atomic_number: number;
  atomic_mass: number;
  density: number;
  melting_point: number;
  reactivity: number;
  radioactivity: number;
  knight_name: string;
  special_ability: string;
  rarity: string;
  element_type: string;
  is_super_trump: boolean;
  trump_weakness?: string;
  image_url?: string;
}

interface DeckBuilderProps {
  userCards: ElementCard[];
  onStartBattle: (selectedCards: ElementCard[]) => void;
  onCancel: () => void;
}

const DeckBuilder = ({ userCards, onStartBattle, onCancel }: DeckBuilderProps) => {
  const [selectedCards, setSelectedCards] = useState<ElementCard[]>([]);

  const toggleCardSelection = (card: ElementCard) => {
    setSelectedCards(prev => {
      if (prev.find(c => c.id === card.id)) {
        return prev.filter(c => c.id !== card.id);
      } else {
        return [...prev, card];
      }
    });
  };

  const isSelected = (card: ElementCard) => {
    return selectedCards.find(c => c.id === card.id) !== undefined;
  };

  const canStartBattle = selectedCards.length >= 6 && selectedCards.length <= 20;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent mb-2">
          Monte seu Baralho
        </h2>
        <p className="text-muted-foreground mb-4">
          Selecione entre 6 e 20 cartas para formar seu baralho de batalha
        </p>
        
        <div className="flex justify-center items-center space-x-4 mb-6">
          <Badge variant={selectedCards.length >= 6 ? "default" : "secondary"} className="text-sm">
            {selectedCards.length}/20 cartas selecionadas
          </Badge>
          
          {selectedCards.length >= 6 ? (
            <Badge variant="outline" className="text-cosmic-gold border-cosmic-gold">
              <Check className="w-3 h-3 mr-1" />
              Mínimo atingido
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              <X className="w-3 h-3 mr-1" />
              Mínimo: 6 cartas
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {userCards.map(card => (
          <div 
            key={card.id} 
            className={`relative cursor-pointer transition-all duration-200 ${
              isSelected(card) ? 'ring-2 ring-cosmic-gold ring-offset-2' : ''
            }`}
            onClick={() => toggleCardSelection(card)}
          >
            <BattleCard
              card={card}
              showAttributes={false}
            />
            
            {isSelected(card) && (
              <div className="absolute top-2 right-2 bg-cosmic-gold rounded-full p-1">
                <Check className="w-4 h-4 text-cosmic-dark" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        
        <Button
          onClick={() => onStartBattle(selectedCards)}
          disabled={!canStartBattle}
          className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark font-semibold"
        >
          Iniciar Batalha ({selectedCards.length} cartas)
        </Button>
      </div>
    </div>
  );
};

export default DeckBuilder;