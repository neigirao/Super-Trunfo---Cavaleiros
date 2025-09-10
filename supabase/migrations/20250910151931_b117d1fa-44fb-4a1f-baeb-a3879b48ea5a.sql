-- Criar tabela para controlar abertura de pacotes
CREATE TABLE public.user_pack_openings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pack_type TEXT NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cards_obtained JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_pack_openings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own pack openings" 
ON public.user_pack_openings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pack openings" 
ON public.user_pack_openings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Função para verificar se o usuário pode abrir um pacote (1 por semana)
CREATE OR REPLACE FUNCTION public.can_user_open_pack(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.user_pack_openings 
    WHERE user_id = user_uuid 
    AND opened_at > (now() - interval '7 days')
  );
$$;

-- Função para obter próxima data disponível para abertura
CREATE OR REPLACE FUNCTION public.get_next_pack_opening_date(user_uuid UUID)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT opened_at + interval '7 days' 
     FROM public.user_pack_openings 
     WHERE user_id = user_uuid 
     ORDER BY opened_at DESC 
     LIMIT 1),
    now()
  );
$$;