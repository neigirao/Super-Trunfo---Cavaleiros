-- Add more common element cards for better variety (avoiding duplicates)
INSERT INTO public.element_cards (name, symbol, atomic_number, atomic_mass, density, melting_point, reactivity, radioactivity, knight_name, element_type, rarity, special_ability, description) VALUES
-- More common metals (avoiding existing symbols)
('Magnésio', 'Mg', 12, 24.305, 1.74, 650, 70, 0, 'Sir Magnésio, o Protetor Leve', 'metal', 'common', 'Resistência Elemental: Reduz dano de ataques ácidos', 'Um cavaleiro ágil que brilha com luz prateada'),
('Alumínio', 'Al', 13, 26.982, 2.70, 660, 60, 0, 'Lorde Alumínio, o Condutor', 'metal', 'common', 'Condutividade: Aumenta velocidade de ataques elétricos', 'Mestre da condução e resistência à corrosão'),
('Silício', 'Si', 14, 28.085, 2.33, 1414, 40, 0, 'Sábio Silício, o Semicondutor', 'non_metal', 'common', 'Cristalização: Cria escudos cristalinos que refletem ataques', 'Guardião dos cristais e tecnologias antigas'),
('Potássio', 'K', 19, 39.098, 0.86, 63, 85, 0, 'Rei Potássio, o Explosivo', 'metal', 'common', 'Reação Aquática: Explode ao contato com água causando dano massivo', 'Monarca volátil dos metais alcalinos'),
('Cálcio', 'Ca', 20, 40.078, 1.55, 842, 75, 0, 'Guardião Cálcio, o Ossificador', 'metal', 'common', 'Fortificação: Aumenta a defesa de aliados próximos', 'Protetor dos ossos e estruturas vitais'),

-- More common non-metals  
('Fósforo', 'P', 15, 30.974, 1.82, 44, 65, 0, 'Mago Fósforo, o Luminoso', 'non_metal', 'common', 'Ignição Espontânea: Ataques têm chance de causar queimadura', 'Alquimista do fogo e da luz'),
('Enxofre', 'S', 16, 32.06, 2.07, 115, 55, 0, 'Bruxo Enxofre, o Fedorento', 'non_metal', 'common', 'Aura Tóxica: Envenena inimigos próximos gradualmente', 'Mestre dos vapores e compostos sulfurosos'),
('Cloro', 'Cl', 17, 35.45, 3.21, -101, 80, 0, 'Assassino Cloro, o Desinfetante', 'non_metal', 'common', 'Purificação Mortal: Remove buffs inimigos e causa dano', 'Executor silencioso dos halogênios'),

-- Rare metals for more variety
('Cobre', 'Cu', 29, 63.546, 8.96, 1085, 45, 0, 'Artesão Cobre, o Condutor Ancestral', 'metal', 'rare', 'Condução Perfeita: Amplifica ataques elétricos de aliados', 'Mestre ancestral da metalurgia'),
('Prata', 'Ag', 47, 107.868, 10.49, 962, 25, 0, 'Dama Prata, a Reluzente', 'metal', 'rare', 'Reflexão Lunar: Reflete ataques mágicos de volta ao inimigo', 'Guardiã espelhada da luz lunar'),

-- Epic noble gases (avoiding He duplicate)
('Neônio', 'Ne', 10, 20.180, 0.90, -249, 10, 0, 'Lorde Neônio, o Brilhante', 'noble_gas', 'epic', 'Luz Ofuscante: Cega temporariamente todos os inimigos', 'Senhor das luzes e sinais luminosos'),
('Argônio', 'Ar', 18, 39.948, 1.78, -189, 5, 0, 'Guardião Argônio, o Inerte', 'noble_gas', 'epic', 'Aura de Inércia: Reduz drasticamente a velocidade de inimigos próximos', 'Protetor silencioso dos gases nobres'),

-- Legendary heavy elements (avoiding Au duplicate)
('Platina', 'Pt', 78, 195.084, 21.45, 1768, 20, 0, 'Arquiduque Platina, o Catalisador', 'metal', 'legendary', 'Catálise Suprema: Acelera todas as reações aliadas', 'Nobre catalisador das transformações');

-- Create trigger function for new users to automatically receive starter cards
CREATE OR REPLACE FUNCTION auto_give_starter_cards()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    card_record RECORD;
    cards_given INTEGER := 0;
BEGIN
    -- Give 8 random common cards to new users (more than minimum for safety)
    FOR card_record IN 
        SELECT id, name, knight_name, rarity
        FROM public.element_cards
        WHERE rarity = 'common'
        ORDER BY RANDOM()
        LIMIT 8
    LOOP
        INSERT INTO public.user_cards (user_id, card_id, quantity)
        VALUES (NEW.id, card_record.id, 1);
        cards_given := cards_given + 1;
    END LOOP;
    
    -- Record the pack opening
    INSERT INTO public.user_pack_openings (user_id, pack_type, cards_obtained)
    VALUES (
        NEW.id, 
        'auto_starter', 
        json_build_array(json_build_object('cards_given', cards_given, 'type', 'auto_starter'))
    );
    
    RETURN NEW;
END;
$$;

-- Create trigger that fires when a new profile is created
DROP TRIGGER IF EXISTS trigger_auto_starter_cards ON public.profiles;
CREATE TRIGGER trigger_auto_starter_cards
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_give_starter_cards();

-- Update existing cards descriptions for better gameplay
UPDATE public.element_cards SET 
  description = 'Cavaleiro primordial da simplicidade e poder',
  special_ability = 'Fusão Nuclear: Pode se combinar com outros elementos'
WHERE symbol = 'H';

UPDATE public.element_cards SET 
  description = 'Guardião dos oceanos e fonte da vida',  
  special_ability = 'Ciclo Vital: Regenera HP de aliados continuamente'
WHERE symbol = 'O';

UPDATE public.element_cards SET 
  description = 'Senhor dos diamantes e grafite',
  special_ability = 'Metamorfose: Alterna entre forma diamante (defesa) e grafite (ataque)'
WHERE symbol = 'C';