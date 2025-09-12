-- Create tutorials table
CREATE TABLE public.tutorials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  duration_minutes INTEGER DEFAULT 5,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user tutorial progress table
CREATE TABLE public.user_tutorial_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id),
  is_completed BOOLEAN DEFAULT false,
  current_step INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tutorial_id)
);

-- Create user customization table
CREATE TABLE public.user_customization (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  avatar_style TEXT DEFAULT 'default',
  theme_preference TEXT DEFAULT 'system',
  notification_preferences JSONB DEFAULT '{"daily_challenge": true, "pack_reminder": true, "achievements": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add points system to profiles
ALTER TABLE public.profiles 
ADD COLUMN points INTEGER DEFAULT 0,
ADD COLUMN level INTEGER DEFAULT 1,
ADD COLUMN experience INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_customization ENABLE ROW LEVEL SECURITY;

-- Tutorials policies
CREATE POLICY "Anyone can view tutorials" 
ON public.tutorials 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage tutorials" 
ON public.tutorials 
FOR ALL 
USING (is_admin());

-- User tutorial progress policies
CREATE POLICY "Users can view their own tutorial progress" 
ON public.user_tutorial_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tutorial progress" 
ON public.user_tutorial_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tutorial progress" 
ON public.user_tutorial_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- User customization policies
CREATE POLICY "Users can view their own customization" 
ON public.user_customization 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customization" 
ON public.user_customization 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customization" 
ON public.user_customization 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert sample tutorials
INSERT INTO public.tutorials (title, description, content, difficulty, duration_minutes, order_index, is_required) VALUES
('Bem-vindo ao Super Trunfo Químico', 'Aprenda os conceitos básicos do jogo', '[
  {"type": "text", "content": "Bem-vindo ao Super Trunfo Químico! Aqui você vai aprender sobre elementos químicos jogando."},
  {"type": "action", "content": "Clique em ''Coleção'' para ver suas cartas", "target": "collection"}
]', 'beginner', 3, 1, true),
('Como Batalhar', 'Aprenda as regras do Super Trunfo', '[
  {"type": "text", "content": "No Super Trunfo, você compara atributos das cartas para vencer."},
  {"type": "text", "content": "Escolha o atributo que você acha que tem o maior valor."},
  {"type": "action", "content": "Vá para ''Batalha'' e forme seu primeiro baralho", "target": "battle"}
]', 'beginner', 5, 2, true),
('Abrir Packs de Cartas', 'Descubra como conseguir novas cartas', '[
  {"type": "text", "content": "Você pode abrir um pack gratuito a cada 7 dias."},
  {"type": "text", "content": "Cada pack contém 3 cartas aleatórias com diferentes raridades."},
  {"type": "action", "content": "Abra seu primeiro pack em ''Coleção''", "target": "collection"}
]', 'beginner', 2, 3, false),
('Elementos Químicos Avançados', 'Entenda os Super Trunfos e suas fraquezas', '[
  {"type": "text", "content": "Cartas Super Trunfo vencem todas as outras, exceto contra sua fraqueza específica."},
  {"type": "text", "content": "Por exemplo: Oganesson é Super Trunfo, mas perde para Hélio."}
]', 'advanced', 7, 4, false);

-- Insert sample daily challenges
INSERT INTO public.daily_challenges (title, description, challenge_type, target_metric, target_value, reward_points, start_date, end_date) VALUES
('Primeira Vitória', 'Vença sua primeira batalha hoje', 'battle', 'wins', 1, 50, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
('Explorador Químico', 'Abra um pack de cartas', 'collection', 'packs_opened', 1, 30, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
('Mestre dos Elementos', 'Vença 3 batalhas consecutivas', 'battle', 'consecutive_wins', 3, 100, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day');

-- Update trigger for tutorials
CREATE TRIGGER update_tutorials_updated_at
BEFORE UPDATE ON public.tutorials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_tutorial_progress_updated_at
BEFORE UPDATE ON public.user_tutorial_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_customization_updated_at
BEFORE UPDATE ON public.user_customization
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();