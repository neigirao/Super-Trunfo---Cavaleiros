import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, X, Save, Trash2, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BattleCard from './BattleCard';
import ValidationMessage, { useValidation } from './ui/ValidationMessage';
import ConfirmationDialog from './ui/ConfirmationDialog';
import { HelpIcon } from './ui/RuleTooltip';

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

interface UserDeck {
  id: string;
  name: string;
  card_ids: string[];
  is_favorite: boolean;
  created_at: string;
}

interface DeckBuilderProps {
  userCards: ElementCard[];
  onStartBattle: (selectedCards: ElementCard[], deckName?: string) => void;
  onCancel: () => void;
}

const DeckBuilder = ({ userCards, onStartBattle, onCancel }: DeckBuilderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCards, setSelectedCards] = useState<ElementCard[]>([]);
  const [userDecks, setUserDecks] = useState<UserDeck[]>([]);
  const [deckName, setDeckName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [currentView, setCurrentView] = useState<'saved' | 'builder'>('saved');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; deckId: string; deckName: string }>({
    isOpen: false,
    deckId: '',
    deckName: ''
  });
  
  const { validateDeckSize, validateDeckName } = useValidation();

  useEffect(() => {
    if (user) {
      loadUserDecks();
    }
  }, [user]);

  const loadUserDecks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_decks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar seus baralhos",
        variant: "destructive"
      });
      return;
    }

    setUserDecks(data || []);
  };

  const saveDeck = async () => {
    if (!user || !deckName.trim() || selectedCards.length < 6) return;

    if (userDecks.length >= 5) {
      toast({
        title: "Limite atingido",
        description: "Você pode ter no máximo 5 baralhos salvos",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('user_decks')
      .insert({
        user_id: user.id,
        name: deckName.trim(),
        card_ids: selectedCards.map(card => card.id)
      });

    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar baralho",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: `Baralho "${deckName}" salvo com sucesso!`
    });

    setDeckName('');
    setShowSaveDialog(false);
    setSelectedCards([]);
    loadUserDecks();
  };

  const deleteDeck = async (deckId: string) => {
    const { error } = await supabase
      .from('user_decks')
      .delete()
      .eq('id', deckId);

    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir baralho",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Baralho excluído com sucesso!"
    });

    loadUserDecks();
  };

  const handleDeleteDeck = (deckId: string, deckName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      deckId,
      deckName
    });
  };

  const confirmDeleteDeck = () => {
    deleteDeck(deleteConfirmation.deckId);
    setDeleteConfirmation({ isOpen: false, deckId: '', deckName: '' });
  };

  const loadDeck = async (deck: UserDeck) => {
    const deckCards = userCards.filter(card => deck.card_ids.includes(card.id));
    setSelectedCards(deckCards);
    setCurrentView('builder');
  };

  const startBattleWithDeck = async (deck: UserDeck) => {
    const deckCards = userCards.filter(card => deck.card_ids.includes(card.id));
    if (deckCards.length < 6) {
      toast({
        title: "Baralho inválido",
        description: "Este baralho não tem cartas suficientes",
        variant: "destructive"
      });
      return;
    }
    onStartBattle(deckCards, deck.name);
  };

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
  
  // Validation states
  const deckSizeValidation = validateDeckSize(selectedCards.length);
  const deckNameValidation = validateDeckName(deckName);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent mb-2">
          {currentView === 'saved' ? 'Seus Baralhos' : 'Monte seu Baralho'}
        </h2>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <p className="text-muted-foreground">
            {currentView === 'saved' 
              ? 'Escolha um baralho salvo ou crie um novo' 
              : 'Selecione entre 6 e 20 cartas para formar seu baralho de batalha'
            }
          </p>
          <HelpIcon rule="deck_building" />
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center space-x-2 mb-6">
          <Button
            variant={currentView === 'saved' ? 'default' : 'outline'}
            onClick={() => setCurrentView('saved')}
            className={currentView === 'saved' ? 'bg-cosmic-gold text-cosmic-dark' : ''}
          >
            Baralhos Salvos ({userDecks.length}/5)
          </Button>
          <Button
            variant={currentView === 'builder' ? 'default' : 'outline'}
            onClick={() => setCurrentView('builder')}
            className={currentView === 'builder' ? 'bg-cosmic-gold text-cosmic-dark' : ''}
          >
            Criar Novo
          </Button>
        </div>
      </div>

      {/* Saved Decks View */}
      {currentView === 'saved' && (
        <div className="space-y-4">
          {userDecks.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">Você ainda não tem baralhos salvos</p>
              <Button 
                onClick={() => setCurrentView('builder')}
                className="bg-cosmic-gold text-cosmic-dark hover:bg-cosmic-gold-light"
              >
                Criar Primeiro Baralho
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userDecks.map(deck => (
                <Card key={deck.id} className="bg-card/50 border-cosmic-gold/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-cosmic-gold">{deck.name}</CardTitle>
                    <CardDescription>
                      {deck.card_ids.length} cartas • Criado em{' '}
                      {new Date(deck.created_at).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => startBattleWithDeck(deck)}
                        className="flex-1 bg-cosmic-gold text-cosmic-dark hover:bg-cosmic-gold-light"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Batalhar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadDeck(deck)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDeck(deck.id, deck.name)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deck Builder View */}
      {currentView === 'builder' && (
        <>
          {/* Card Selection Status */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-center items-center space-x-4">
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

            {/* Real-time Validation */}
            <ValidationMessage
              type={deckSizeValidation.type}
              message={deckSizeValidation.message}
              isVisible={selectedCards.length > 0}
              className="max-w-md mx-auto"
            />
          </div>

          {/* Card Selection Grid */}
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
                  showAttributes={true}
                />
                
                {isSelected(card) && (
                  <div className="absolute top-2 right-2 bg-cosmic-gold rounded-full p-1">
                    <Check className="w-4 h-4 text-cosmic-dark" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setCurrentView('saved')}
            >
              Voltar
            </Button>

            {canStartBattle && (
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={userDecks.length >= 5}
                    className="border-cosmic-gold text-cosmic-gold hover:bg-cosmic-gold hover:text-cosmic-dark"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Baralho
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Salvar Baralho</DialogTitle>
                    <DialogDescription>
                      Dê um nome para seu baralho de {selectedCards.length} cartas
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Nome do baralho..."
                        value={deckName}
                        onChange={(e) => setDeckName(e.target.value)}
                        maxLength={30}
                        className="focus-cosmic"
                      />
                      <ValidationMessage
                        type={deckNameValidation.type}
                        message={deckNameValidation.message}
                        isVisible={deckName.length > 0}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowSaveDialog(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={saveDeck}
                        disabled={!deckNameValidation.isValid}
                        className="flex-1 bg-cosmic-gold text-cosmic-dark hover:bg-cosmic-gold-light"
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            <Button
              onClick={() => onStartBattle(selectedCards)}
              disabled={!canStartBattle}
              className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark font-semibold"
            >
              Iniciar Batalha ({selectedCards.length} cartas)
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default DeckBuilder;