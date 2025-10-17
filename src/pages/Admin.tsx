import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, BarChart3, Users, Crown, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { CardImageUpload } from '@/components/admin/CardImageUpload';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ElementCard {
  id: string;
  name: string;
  symbol: string;
  atomic_number: number;
  atomic_mass: number;
  knight_name: string;
  special_ability?: string;
  rarity: string;
  element_type: string;
  group_number?: number;
  period_number?: number;
  electronegativity?: number;
  description?: string;
  image_url?: string;
}

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const { toast } = useToast();
  const { deleteImage } = useImageUpload();
  const [cards, setCards] = useState<ElementCard[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<ElementCard | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalCards: 0,
    totalUsers: 0,
    totalGames: 0,
    activeUsers: 0
  });

  // Form state for new/edit card
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    atomic_number: 0,
    atomic_mass: 0,
    knight_name: '',
    special_ability: '',
    rarity: 'common',
    element_type: 'metal',
    group_number: 1,
    period_number: 1,
    electronegativity: 0,
    description: '',
    image_url: ''
  });

  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        loadCards();
        loadStats();
      }
    }
  }, [user, loading, isAdmin]);

  const loadCards = async () => {
    try {
      const { data, error } = await supabase
        .from('element_cards')
        .select('*')
        .order('atomic_number');

      if (error) throw error;
      setCards(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Falha ao carregar cartas",
        variant: "destructive"
      });
    } finally {
      setAdminLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load basic stats
      const [cardsRes, profilesRes, rankingsRes] = await Promise.all([
        supabase.from('element_cards').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('rankings').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalCards: cardsRes.count || 0,
        totalUsers: profilesRes.count || 0,
        totalGames: rankingsRes.count || 0,
        activeUsers: profilesRes.count || 0 // Simplified for now
      });
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCreateCard = async () => {
    try {
      const { error } = await supabase
        .from('element_cards')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Carta criada com sucesso!",
      });

      setIsCreateDialogOpen(false);
      resetForm();
      loadCards();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar carta",
        variant: "destructive"
      });
    }
  };

  const handleUpdateCard = async () => {
    if (!editingCard) return;

    try {
      const { error } = await supabase
        .from('element_cards')
        .update(formData)
        .eq('id', editingCard.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Carta atualizada com sucesso!",
      });

      setEditingCard(null);
      resetForm();
      loadCards();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar carta",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta carta?')) return;

    try {
      // Find card to get image URL
      const card = cards.find(c => c.id === cardId);
      
      // Delete card from database
      const { error } = await supabase
        .from('element_cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;

      // Delete image from storage if it exists
      if (card?.image_url) {
        await deleteImage(card.image_url);
      }

      toast({
        title: "Sucesso",
        description: "Carta excluída com sucesso!",
      });

      loadCards();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao excluir carta",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      symbol: '',
      atomic_number: 0,
      atomic_mass: 0,
      knight_name: '',
      special_ability: '',
      rarity: 'common',
      element_type: 'metal',
      group_number: 1,
      period_number: 1,
      electronegativity: 0,
      description: '',
      image_url: ''
    });
  };

  const startEdit = (card: ElementCard) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      symbol: card.symbol,
      atomic_number: card.atomic_number,
      atomic_mass: card.atomic_mass,
      knight_name: card.knight_name,
      special_ability: card.special_ability || '',
      rarity: card.rarity,
      element_type: card.element_type,
      group_number: card.group_number || 1,
      period_number: card.period_number || 1,
      electronegativity: card.electronegativity || 0,
      description: card.description || '',
      image_url: card.image_url || ''
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'cosmic-gold';
      case 'epic': return 'cosmic-purple';
      case 'rare': return 'cosmic-blue';
      default: return 'cosmic-green';
    }
  };

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-cosmic-nebula to-cosmic-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cosmic-gold border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-cosmic-nebula to-cosmic-dark flex items-center justify-center">
        <Card className="max-w-md bg-card/80 backdrop-blur-lg border-red-500/20">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-2xl font-bold text-red-500">
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Apenas administradores podem acessar esta área
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const CardForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome do Elemento</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="ex: Hidrogênio"
          />
        </div>
        <div>
          <Label htmlFor="symbol">Símbolo</Label>
          <Input
            id="symbol"
            value={formData.symbol}
            onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
            placeholder="ex: H"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="knight_name">Nome do Cavaleiro</Label>
        <Input
          id="knight_name"
          value={formData.knight_name}
          onChange={(e) => setFormData(prev => ({ ...prev, knight_name: e.target.value }))}
          placeholder="ex: Sir Hidrogênio, o Leve"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="atomic_number">Número Atômico</Label>
          <Input
            id="atomic_number"
            type="number"
            value={formData.atomic_number}
            onChange={(e) => setFormData(prev => ({ ...prev, atomic_number: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="atomic_mass">Massa Atômica</Label>
          <Input
            id="atomic_mass"
            type="number"
            step="0.01"
            value={formData.atomic_mass}
            onChange={(e) => setFormData(prev => ({ ...prev, atomic_mass: parseFloat(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rarity">Raridade</Label>
          <Select value={formData.rarity} onValueChange={(value) => setFormData(prev => ({ ...prev, rarity: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="common">Comum</SelectItem>
              <SelectItem value="rare">Raro</SelectItem>
              <SelectItem value="epic">Épico</SelectItem>
              <SelectItem value="legendary">Lendário</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="element_type">Tipo</Label>
          <Select value={formData.element_type} onValueChange={(value) => setFormData(prev => ({ ...prev, element_type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metal">Metal</SelectItem>
              <SelectItem value="non-metal">Não-metal</SelectItem>
              <SelectItem value="metalloid">Metalóide</SelectItem>
              <SelectItem value="noble_gas">Gás nobre</SelectItem>
              <SelectItem value="alkali_metal">Metal alcalino</SelectItem>
              <SelectItem value="alkaline_earth">Alcalino terroso</SelectItem>
              <SelectItem value="transition_metal">Metal de transição</SelectItem>
              <SelectItem value="lanthanide">Lantanídeo</SelectItem>
              <SelectItem value="actinide">Actinídeo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="special_ability">Habilidade Especial</Label>
        <Textarea
          id="special_ability"
          value={formData.special_ability}
          onChange={(e) => setFormData(prev => ({ ...prev, special_ability: e.target.value }))}
          placeholder="Descreva a habilidade especial do cavaleiro"
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descrição adicional do elemento"
        />
      </div>

      <CardImageUpload
        currentImageUrl={formData.image_url}
        cardId={editingCard?.id || 'new'}
        onImageUpload={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
        onImageDelete={() => setFormData(prev => ({ ...prev, image_url: '' }))}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cosmic-nebula to-cosmic-dark">
      <Navbar />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cosmic-gold opacity-10 rounded-full animate-stellar-pulse" />
        <div className="absolute top-3/4 right-1/3 w-48 h-48 bg-cosmic-purple opacity-15 rounded-full animate-cosmic-float" />
        <div className="absolute bottom-1/4 left-2/3 w-32 h-32 bg-cosmic-blue opacity-20 rounded-full animate-stellar-pulse" />
      </div>

      <div className="relative pt-24 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Admin Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Crown className="w-16 h-16 text-cosmic-gold" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent mb-4">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground">
              Gerencie os cavaleiros dos elementos
            </p>
          </div>

          <Tabs defaultValue="cards" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="cards">Gerenciar Cartas</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-card/80 backdrop-blur-lg border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Cartas</CardTitle>
                    <BarChart3 className="h-4 w-4 text-cosmic-gold" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-cosmic-gold">{stats.totalCards}</div>
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-lg border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Usuários</CardTitle>
                    <Users className="h-4 w-4 text-cosmic-blue" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-cosmic-blue">{stats.totalUsers}</div>
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-lg border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Jogos</CardTitle>
                    <BarChart3 className="h-4 w-4 text-cosmic-purple" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-cosmic-purple">{stats.totalGames}</div>
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-lg border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                    <Users className="h-4 w-4 text-cosmic-green" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-cosmic-green">{stats.activeUsers}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cards" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-cosmic-gold">Cavaleiros dos Elementos</h2>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Carta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Criar Nova Carta</DialogTitle>
                      <DialogDescription>
                        Adicione um novo cavaleiro à coleção
                      </DialogDescription>
                    </DialogHeader>
                    <CardForm />
                    <div className="flex justify-end space-x-2 mt-6">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateCard} className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark">
                        Criar Carta
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                  <Card key={card.id} className="bg-card/80 backdrop-blur-lg border-primary/20">
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-4">
                        <div className={`w-16 h-16 bg-gradient-to-br from-${getRarityColor(card.rarity)} to-${getRarityColor(card.rarity)}-light rounded-full flex items-center justify-center shadow-cosmic`}>
                          <span className="text-2xl font-bold text-cosmic-dark">
                            {card.symbol}
                          </span>
                        </div>
                      </div>
                      
                      <CardTitle className="text-lg font-bold text-cosmic-gold">
                        {card.knight_name}
                      </CardTitle>
                      
                      <CardDescription>
                        {card.name} (#{card.atomic_number})
                      </CardDescription>
                      
                      <div className="flex justify-center items-center space-x-2 mt-2">
                        <Badge variant="outline" className={`border-${getRarityColor(card.rarity)}/30 text-xs`}>
                          <span className="capitalize">{card.rarity}</span>
                        </Badge>
                        <Badge variant="outline" className="border-cosmic-gold/30 text-xs">
                          <span className="capitalize">{card.element_type.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex justify-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(card)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCard(card.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Edit Dialog */}
              <Dialog open={!!editingCard} onOpenChange={(open) => !open && setEditingCard(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Editar Carta</DialogTitle>
                    <DialogDescription>
                      Modifique as informações do cavaleiro
                    </DialogDescription>
                  </DialogHeader>
                  <CardForm />
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline" onClick={() => setEditingCard(null)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdateCard} className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark">
                      Salvar Alterações
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;