-- Update existing profiles table to set neigirao@gmail.com as admin
UPDATE public.profiles SET role = 'admin' WHERE email = 'neigirao@gmail.com';

-- Create element_cards table if not exists
CREATE TABLE IF NOT EXISTS public.element_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  knight_name TEXT NOT NULL,
  atomic_number INTEGER NOT NULL,
  atomic_mass DECIMAL NOT NULL,
  electronegativity DECIMAL,
  group_number INTEGER,
  period_number INTEGER,
  element_type TEXT NOT NULL, -- metal, non-metal, metalloid, noble-gas
  rarity TEXT NOT NULL DEFAULT 'common', -- common, uncommon, rare, epic, legendary
  image_url TEXT,
  description TEXT,
  special_ability TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on element_cards
ALTER TABLE public.element_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for element_cards
CREATE POLICY "Anyone can view cards" ON public.element_cards
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage cards" ON public.element_cards
  FOR ALL USING (is_admin());

-- Create user_cards table (user collection)
CREATE TABLE IF NOT EXISTS public.user_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.element_cards(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE(user_id, card_id)
);

-- Enable RLS on user_cards
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for user_cards
CREATE POLICY "Users can view own cards" ON public.user_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON public.user_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert initial element cards
INSERT INTO public.element_cards (symbol, name, knight_name, atomic_number, atomic_mass, electronegativity, group_number, period_number, element_type, rarity, description, special_ability) VALUES
  ('H', 'Hidrogênio', 'Cavaleiro do Hidrogênio', 1, 1.008, 2.20, 1, 1, 'non-metal', 'common', 'O primeiro elemento, origem de todas as estrelas', 'Fusão Estelar - Dobra o dano contra elementos pesados'),
  ('He', 'Hélio', 'Cavaleiro do Hélio', 2, 4.003, NULL, 18, 1, 'noble-gas', 'uncommon', 'Nobre e inerte, protetor dos cosmos', 'Escudo Nobre - Imune a ataques químicos'),
  ('Li', 'Lítio', 'Cavaleiro do Lítio', 3, 6.941, 0.98, 1, 2, 'metal', 'common', 'Metal alcalino de grande reatividade', 'Explosão Alcalina - Dano extra contra não-metais'),
  ('C', 'Carbono', 'Cavaleiro do Carbono', 6, 12.011, 2.55, 14, 2, 'non-metal', 'epic', 'Base da vida, formador de diamantes', 'Polimorfismo - Pode mudar suas propriedades'),
  ('O', 'Oxigênio', 'Cavaleiro do Oxigênio', 8, 15.999, 3.44, 16, 2, 'non-metal', 'uncommon', 'Essencial para a vida, oxidante supremo', 'Combustão - Amplifica ataques de metais'),
  ('Fe', 'Ferro', 'Cavaleiro do Ferro', 26, 55.845, 1.83, 8, 4, 'metal', 'common', 'Metal das armaduras, coração das estrelas', 'Magnetismo - Atrai elementos metálicos'),
  ('Au', 'Ouro', 'Cavaleiro do Ouro', 79, 196.967, 2.54, 11, 6, 'metal', 'legendary', 'Metal nobre e eterno, símbolo de perfeição', 'Nobreza Eterna - Imune à corrosão e oxidação'),
  ('U', 'Urânio', 'Cavaleiro do Urânio', 92, 238.029, 1.38, 7, 7, 'metal', 'legendary', 'Elemento radioativo de poder destrutivo', 'Fissão Nuclear - Dano devastador a todos elementos');

-- Create storage bucket for card images
INSERT INTO storage.buckets (id, name, public) VALUES ('card-images', 'card-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for card images
CREATE POLICY "Anyone can view card images" ON storage.objects
  FOR SELECT USING (bucket_id = 'card-images');

CREATE POLICY "Admins can upload card images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'card-images' AND is_admin());