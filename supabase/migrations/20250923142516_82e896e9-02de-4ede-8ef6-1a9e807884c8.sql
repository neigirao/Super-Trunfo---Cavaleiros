-- Create card game rankings table
CREATE TABLE public.card_game_rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 0,
  games_won INTEGER NOT NULL DEFAULT 0,
  games_lost INTEGER NOT NULL DEFAULT 0,
  total_games INTEGER NOT NULL DEFAULT 0,
  win_rate DECIMAL(5,2) NOT NULL DEFAULT 0.0,
  highest_score INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  favorite_element_type TEXT,
  total_cards_played INTEGER NOT NULL DEFAULT 0,
  average_game_duration INTEGER NOT NULL DEFAULT 0,
  difficulty_level TEXT NOT NULL DEFAULT 'medium',
  last_played_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.card_game_rankings ENABLE ROW LEVEL SECURITY;

-- Create policies for card game rankings
CREATE POLICY "Anyone can view card game rankings" 
ON public.card_game_rankings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own ranking" 
ON public.card_game_rankings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ranking" 
ON public.card_game_rankings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_card_game_rankings_updated_at
BEFORE UPDATE ON public.card_game_rankings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_card_game_rankings_total_score ON public.card_game_rankings(total_score DESC);
CREATE INDEX idx_card_game_rankings_user_id ON public.card_game_rankings(user_id);
CREATE INDEX idx_card_game_rankings_win_rate ON public.card_game_rankings(win_rate DESC);
CREATE INDEX idx_card_game_rankings_games_won ON public.card_game_rankings(games_won DESC);