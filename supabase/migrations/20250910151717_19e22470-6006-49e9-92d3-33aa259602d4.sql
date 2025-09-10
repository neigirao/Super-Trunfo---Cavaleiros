-- Inserir cartas básicas dos elementos químicos
INSERT INTO element_cards (name, symbol, atomic_number, knight_name, special_ability, rarity, element_type, atomic_mass, electronegativity, group_number, period_number, description) VALUES

-- Cartas Comuns
('Hidrogênio', 'H', 1, 'Cavaleiro das Chamas Primordiais', 'Inflamação Instantânea: Causa dano de fogo adicional', 'common', 'non-metal', 1.008, 2.20, 1, 1, 'O primeiro dos elementos, mestre do fogo primordial'),
('Hélio', 'He', 2, 'Guardião do Vazio Etéreo', 'Levitação: Imune a ataques terrestres', 'common', 'noble_gas', 4.003, NULL, 18, 1, 'Nobre guardião dos céus, intocável e sereno'),
('Lítio', 'Li', 3, 'Lâmina da Aurora', 'Carregamento Elétrico: Aumenta velocidade de ataque', 'common', 'metal', 6.94, 0.98, 1, 2, 'Guerreiro da luz matinal, rápido como o relâmpago'),
('Carbono', 'C', 6, 'Forjador de Vínculos', 'Ligação Múltipla: Pode atacar vários inimigos', 'common', 'non-metal', 12.01, 2.55, 14, 2, 'Mestre da criação, forma alianças inquebráveis'),
('Oxigênio', 'O', 8, 'Senhor dos Ventos Vitais', 'Combustão: Amplifica ataques de fogo aliados', 'common', 'non-metal', 15.999, 3.44, 16, 2, 'Dador da vida, alimenta as chamas da existência'),

-- Cartas Raras
('Sódio', 'Na', 11, 'Imperador das Marés Salgadas', 'Explosão Aquática: Dano massivo em contato com água', 'rare', 'metal', 22.99, 0.93, 1, 3, 'Soberano dos oceanos, violento quando provocado'),
('Magnésio', 'Mg', 12, 'Cavaleiro da Luz Cegante', 'Flash Luminoso: Cega inimigos por 2 turnos', 'rare', 'metal', 24.31, 1.31, 2, 3, 'Guerreiro brilhante, sua luz ofusca os adversários'),
('Cloro', 'Cl', 17, 'Assassino das Sombras Tóxicas', 'Veneno Corrosivo: Dano contínuo por 3 turnos', 'rare', 'non-metal', 35.45, 3.16, 17, 3, 'Matador silencioso, sua toxicidade é letal'),
('Ferro', 'Fe', 26, 'Guardião das Fortalezas', 'Armadura Indestrutível: Reduz dano recebido em 50%', 'rare', 'metal', 55.85, 1.83, 8, 4, 'Defensor inabalável, protetor dos fracos'),

-- Cartas Épicas
('Cobre', 'Cu', 29, 'Condutor dos Raios Dourados', 'Tempestade Elétrica: Ataque em área com dano elétrico', 'epic', 'metal', 63.55, 1.90, 11, 4, 'Mestre da eletricidade, canaliza o poder dos céus'),
('Prata', 'Ag', 47, 'Lâmina da Lua Prateada', 'Corte Lunar: Ignora armaduras e escudos', 'epic', 'metal', 107.87, 1.93, 11, 5, 'Guerreiro noturno, sua lâmina é afiada como a lua'),
('Iodo', 'I', 53, 'Curandeiro das Feridas Púrpuras', 'Regeneração: Cura aliados e causa dano a mortos-vivos', 'epic', 'non-metal', 126.90, 2.66, 17, 5, 'Místico curador, suas poções salvam e destroem'),

-- Cartas Lendárias
('Ouro', 'Au', 79, 'Imperador do Reino Dourado', 'Toque de Midas: Transforma inimigos em estátuas por 1 turno', 'legendary', 'metal', 196.97, 2.54, 11, 6, 'Soberano supremo, seu toque transforma tudo em riqueza'),
('Urânio', 'U', 92, 'Devastador Nuclear', 'Fissão Atômica: Destrói todos os inimigos no campo', 'legendary', 'metal', 238.03, 1.38, NULL, 7, 'Força apocalíptica, sua energia pode acabar com mundos'),
('Plutônio', 'Pu', 94, 'Senhor da Destruição Eterna', 'Radiação Mortal: Dano crescente a cada turno', 'legendary', 'metal', 244.06, 1.28, NULL, 7, 'Entidade de caos puro, sua radiação corrói a realidade');