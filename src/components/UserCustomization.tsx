import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Palette, Bell, User, Monitor, Moon, Sun } from 'lucide-react';

interface UserCustomization {
  avatar_style: string;
  theme_preference: string;
  notification_preferences: {
    daily_challenge: boolean;
    pack_reminder: boolean;
    achievements: boolean;
  };
}

const avatarStyles = [
  { id: 'default', name: 'Padrão', icon: '👤' },
  { id: 'scientist', name: 'Cientista', icon: '🧑‍🔬' },
  { id: 'robot', name: 'Robô', icon: '🤖' },
  { id: 'wizard', name: 'Mago', icon: '🧙‍♂️' },
  { id: 'knight', name: 'Cavaleiro', icon: '⚔️' },
  { id: 'ninja', name: 'Ninja', icon: '🥷' },
];

const UserCustomization = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customization, setCustomization] = useState<UserCustomization>({
    avatar_style: 'default',
    theme_preference: 'system',
    notification_preferences: {
      daily_challenge: true,
      pack_reminder: true,
      achievements: true,
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadCustomization();
    }
  }, [user]);

  const loadCustomization = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_customization')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCustomization({
          avatar_style: data.avatar_style,
          theme_preference: data.theme_preference,
          notification_preferences: data.notification_preferences as any,
        });
      }
    } catch (error) {
      console.error('Error loading customization:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar configurações de personalização",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCustomization = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_customization')
        .upsert({
          user_id: user.id,
          avatar_style: customization.avatar_style,
          theme_preference: customization.theme_preference,
          notification_preferences: customization.notification_preferences,
        });

      if (error) throw error;

      toast({
        title: "Configurações Salvas! ✨",
        description: "Suas preferências foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving customization:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationPreference = (key: keyof typeof customization.notification_preferences, value: boolean) => {
    setCustomization(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [key]: value
      }
    }));
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-card animate-pulse rounded-lg"></div>
        <div className="h-48 bg-card animate-pulse rounded-lg"></div>
        <div className="h-64 bg-card animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent mb-2">
          Personalização
        </h2>
        <p className="text-muted-foreground">Customize sua experiência no jogo</p>
      </div>

      {/* Avatar Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-cosmic-purple" />
            <span>Estilo do Avatar</span>
          </CardTitle>
          <CardDescription>
            Escolha como você quer aparecer no jogo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {avatarStyles.map((style) => (
              <div
                key={style.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  customization.avatar_style === style.id 
                    ? 'border-cosmic-gold bg-cosmic-gold/10' 
                    : 'border-border'
                }`}
                onClick={() => setCustomization(prev => ({ ...prev, avatar_style: style.id }))}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{style.icon}</div>
                  <div className="text-sm font-medium">{style.name}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Theme Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-cosmic-blue" />
            <span>Tema</span>
          </CardTitle>
          <CardDescription>
            Escolha a aparência da interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={customization.theme_preference} 
            onValueChange={(value) => setCustomization(prev => ({ ...prev, theme_preference: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um tema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-4 h-4" />
                  <span>Automático (Sistema)</span>
                </div>
              </SelectItem>
              <SelectItem value="light">
                <div className="flex items-center space-x-2">
                  <Sun className="w-4 h-4" />
                  <span>Claro</span>
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div className="flex items-center space-x-2">
                  <Moon className="w-4 h-4" />
                  <span>Escuro</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-cosmic-gold" />
            <span>Notificações</span>
          </CardTitle>
          <CardDescription>
            Configure quando você quer ser notificado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Desafios Diários</Label>
              <div className="text-sm text-muted-foreground">
                Receba notificações sobre novos desafios diários
              </div>
            </div>
            <Switch
              checked={customization.notification_preferences.daily_challenge}
              onCheckedChange={(checked) => updateNotificationPreference('daily_challenge', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Lembrete de Packs</Label>
              <div className="text-sm text-muted-foreground">
                Seja lembrado quando novos packs estiverem disponíveis
              </div>
            </div>
            <Switch
              checked={customization.notification_preferences.pack_reminder}
              onCheckedChange={(checked) => updateNotificationPreference('pack_reminder', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Conquistas</Label>
              <div className="text-sm text-muted-foreground">
                Receba notificações quando conquistar algo novo
              </div>
            </div>
            <Switch
              checked={customization.notification_preferences.achievements}
              onCheckedChange={(checked) => updateNotificationPreference('achievements', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveCustomization}
          disabled={saving}
          className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark font-semibold"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};

export default UserCustomization;