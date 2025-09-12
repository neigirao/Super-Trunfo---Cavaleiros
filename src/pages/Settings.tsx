import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserCustomization from '@/components/UserCustomization';
import Tutorial from '@/components/Tutorial';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, BookOpen, Palette, HelpCircle } from 'lucide-react';

const Settings = () => {
  const [tutorialOpen, setTutorialOpen] = useState(false);

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent mb-2">
          Configurações
        </h1>
        <p className="text-muted-foreground">Gerencie suas preferências e configurações do jogo</p>
      </div>

      <Tabs defaultValue="customization" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customization" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Personalização</span>
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Tutoriais</span>
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4" />
            <span>Ajuda</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customization" className="mt-6">
          <UserCustomization />
        </TabsContent>

        <TabsContent value="tutorials" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-cosmic-gold" />
                <span>Centro de Tutoriais</span>
              </CardTitle>
              <CardDescription>
                Aprenda a jogar ou revise conceitos importantes do Super Trunfo Químico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setTutorialOpen(true)}
                className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark font-semibold"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Abrir Tutoriais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Como Jogar Super Trunfo Químico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">🎯 Objetivo do Jogo</h4>
                  <p className="text-sm text-muted-foreground">
                    Compare os atributos dos elementos químicos para vencer o oponente e conquistar todas as cartas.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">⚔️ Como Batalhar</h4>
                  <p className="text-sm text-muted-foreground">
                    Escolha um atributo (Número Atômico, Massa Atômica, Densidade, etc.) e compare com a carta do oponente. O maior valor vence!
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🃏 Super Trunfos</h4>
                  <p className="text-sm text-muted-foreground">
                    Cartas especiais que vencem qualquer outra carta, exceto contra sua fraqueza específica.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">📦 Obtendo Cartas</h4>
                  <p className="text-sm text-muted-foreground">
                    Abra packs de cartas gratuitamente a cada 7 dias ou complete desafios para ganhar mais cartas.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sistema de Pontuação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">⭐ Experiência (XP)</h4>
                  <p className="text-sm text-muted-foreground">
                    Ganhe XP jogando, completando tutoriais e desafios. A cada 1000 XP você sobe de nível!
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">🏆 Pontos</h4>
                  <p className="text-sm text-muted-foreground">
                    Use pontos para competir nos rankings globais e mostrar suas habilidades.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">🎯 Desafios Diários</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete desafios especiais para ganhar pontos extras e recompensas exclusivas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Tutorial 
        open={tutorialOpen} 
        onOpenChange={setTutorialOpen}
      />
    </div>
  );
};

export default Settings;