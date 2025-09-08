-- Create profiles table with admin role
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN NEW.email = 'neigirao@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create element_cards table
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

-- Enable RLS
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

-- Enable RLS
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for user_cards
CREATE POLICY "Users can view own cards" ON public.user_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON public.user_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON public.user_cards
  FOR UPDATE USING (auth.uid() = user_id);

-- Create chemical_advantages table
CREATE TABLE IF NOT EXISTS public.chemical_advantages (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  element_type_1 TEXT NOT NULL,
  element_type_2 TEXT NOT NULL,
  advantage_multiplier DECIMAL NOT NULL DEFAULT 1.0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE(element_type_1, element_type_2)
);

-- Enable RLS
ALTER TABLE public.chemical_advantages ENABLE ROW LEVEL SECURITY;

-- Create policies for chemical_advantages
CREATE POLICY "Anyone can view advantages" ON public.chemical_advantages
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage advantages" ON public.chemical_advantages
  FOR ALL USING (is_admin());

-- Create game_matches table
CREATE TABLE IF NOT EXISTS public.game_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  player1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  game_mode TEXT NOT NULL DEFAULT 'classic',
  match_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.game_matches ENABLE ROW LEVEL SECURITY;

-- Create policies for game_matches
CREATE POLICY "Users can view own matches" ON public.game_matches
  FOR SELECT USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can insert matches" ON public.game_matches
  FOR INSERT WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Update function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_element_cards_updated_at
  BEFORE UPDATE ON public.element_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial elements
INSERT INTO public.element_cards (symbol, name, knight_name, atomic_number, atomic_mass, electronegativity, group_number, period_number, element_type, rarity, description, special_ability) VALUES
  ('H', 'Hidrogênio', 'Cavaleiro do Hidrogênio', 1, 1.008, 2.20, 1, 1, 'non-metal', 'common', 'O primeiro elemento, origem de todas as estrelas', 'Fusão Estelar - Dobra o dano contra elementos pesados'),
  ('He', 'Hélio', 'Cavaleiro do Hélio', 2, 4.003, NULL, 18, 1, 'noble-gas', 'uncommon', 'Nobre e inerte, protetor dos cosmos', 'Escudo Nobre - Imune a ataques químicos'),
  ('Li', 'Lítio', 'Cavaleiro do Lítio', 3, 6.941, 0.98, 1, 2, 'metal', 'common', 'Metal alcalino de grande reatividade', 'Explosão Alcalina - Dano extra contra não-metais'),
  ('Be', 'Berílio', 'Cavaleiro do Berílio', 4, 9.012, 1.57, 2, 2, 'metal', 'rare', 'Metal duro e resistente como diamante', 'Dureza Extrema - Resistência aumentada'),
  ('C', 'Carbono', 'Cavaleiro do Carbono', 6, 12.011, 2.55, 14, 2, 'non-metal', 'epic', 'Base da vida, formador de diamantes', 'Polimorfismo - Pode mudar suas propriedades'),
  ('O', 'Oxigênio', 'Cavaleiro do Oxigênio', 8, 15.999, 3.44, 16, 2, 'non-metal', 'uncommon', 'Essencial para a vida, oxidante supremo', 'Combustão - Amplifica ataques de metais'),
  ('Fe', 'Ferro', 'Cavaleiro do Ferro', 26, 55.845, 1.83, 8, 4, 'metal', 'common', 'Metal das armaduras, coração das estrelas', 'Magnetismo - Atrai elementos metálicos'),
  ('Au', 'Ouro', 'Cavaleiro do Ouro', 79, 196.967, 2.54, 11, 6, 'metal', 'legendary', 'Metal nobre e eterno, símbolo de perfeição', 'Nobreza Eterna - Imune à corrosão e oxidação'),
  ('U', 'Urânio', 'Cavaleiro do Urânio', 92, 238.029, 1.38, 7, 7, 'metal', 'legendary', 'Elemento radioativo de poder destrutivo', 'Fissão Nuclear - Dano devastador a todos elementos');

-- Insert chemical advantages
INSERT INTO public.chemical_advantages (element_type_1, element_type_2, advantage_multiplier, description) VALUES
  ('metal', 'non-metal', 1.2, 'Metais reagem com não-metais formando compostos iônicos'),
  ('non-metal', 'metal', 0.8, 'Não-metais são menos reativos contra metais'),
  ('noble-gas', 'metal', 1.1, 'Gases nobres são inertes mas estáveis'),
  ('noble-gas', 'non-metal', 1.1, 'Gases nobres resistem a reações'),
  ('metalloid', 'metal', 1.0, 'Metaloides têm propriedades intermediárias'),
  ('metalloid', 'non-metal', 1.0, 'Metaloides podem reagir como metais ou não-metais');