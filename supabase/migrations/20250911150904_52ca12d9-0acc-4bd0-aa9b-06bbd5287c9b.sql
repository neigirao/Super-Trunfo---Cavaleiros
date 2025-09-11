-- Adicionar atributos necessários para o Super Trunfo
ALTER TABLE public.element_cards 
ADD COLUMN IF NOT EXISTS atomic_mass numeric,
ADD COLUMN IF NOT EXISTS density numeric,
ADD COLUMN IF NOT EXISTS melting_point numeric,
ADD COLUMN IF NOT EXISTS reactivity integer DEFAULT 0 CHECK (reactivity >= 0 AND reactivity <= 100),
ADD COLUMN IF NOT EXISTS radioactivity integer DEFAULT 0 CHECK (radioactivity >= 0 AND radioactivity <= 100),
ADD COLUMN IF NOT EXISTS is_super_trump boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS trump_weakness text;

-- Inserir alguns elementos exemplo com todos os atributos
INSERT INTO public.element_cards (
    name, symbol, atomic_number, atomic_mass, density, melting_point, 
    reactivity, radioactivity, knight_name, element_type, rarity, 
    special_ability, is_super_trump, trump_weakness
) VALUES 
(
    'Hidrogênio', 'H', 1, 1.008, 0.00009, -259, 85, 0,
    'Cavaleiro Primordial', 'non_metal', 'rare',
    'Primeiro elemento: Ignição instantânea, causando dano em área',
    false, null
),
(
    'Ferro', 'Fe', 26, 55.845, 7.87, 1538, 40, 0,
    'Cavaleiro de Ferro', 'metal', 'common',
    'Forja Resistente: Absorve 50% do dano físico por 3 turnos',
    false, null
),
(
    'Urânio', 'U', 92, 238.029, 18.95, 1132, 70, 95,
    'Cavaleiro Nuclear', 'metal', 'epic',
    'Fissão Nuclear: Causa dano massivo mas perde vida a cada turno',
    false, null
),
(
    'Oganessônio', 'Og', 118, 294, 4.9, -100, 100, 100,
    'Cavaleiro Supremo', 'noble_gas', 'legendary',
    'Domínio Absoluto: Vence qualquer batalha exceto contra Hélio',
    true, 'Hélio'
),
(
    'Hélio', 'He', 2, 4.003, 0.00018, -272, 5, 0,
    'Cavaleiro Etéreo', 'noble_gas', 'rare',
    'Intangibilidade: Imune a ataques físicos, rival do Oganessônio',
    false, null
)
ON CONFLICT (symbol) DO UPDATE SET
    atomic_mass = EXCLUDED.atomic_mass,
    density = EXCLUDED.density,
    melting_point = EXCLUDED.melting_point,
    reactivity = EXCLUDED.reactivity,
    radioactivity = EXCLUDED.radioactivity,
    is_super_trump = EXCLUDED.is_super_trump,
    trump_weakness = EXCLUDED.trump_weakness;