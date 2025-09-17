-- Criar tabela para baralhos personalizados dos usuários
CREATE TABLE public.user_decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  card_ids UUID[] NOT NULL DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_decks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own decks" 
ON public.user_decks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decks" 
ON public.user_decks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks" 
ON public.user_decks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks" 
ON public.user_decks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_user_decks_updated_at
BEFORE UPDATE ON public.user_decks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();