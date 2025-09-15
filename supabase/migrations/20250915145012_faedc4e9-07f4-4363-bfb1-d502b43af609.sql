-- Give additional cards to existing users for better variety
-- Since everyone has 6 cards but from a limited pool, let's give them 2 more diverse cards

DO $$
DECLARE
    user_record RECORD;
    card_record RECORD;
    cards_given INTEGER;
    total_users_helped INTEGER := 0;
BEGIN
    -- Loop through all existing users
    FOR user_record IN 
        SELECT DISTINCT p.id, p.email, p.full_name
        FROM public.profiles p
        WHERE p.id IS NOT NULL
    LOOP
        cards_given := 0;
        
        -- Give 2 additional cards from the new diverse set
        FOR card_record IN 
            SELECT ec.id, ec.name, ec.knight_name, ec.rarity
            FROM public.element_cards ec
            WHERE ec.rarity IN ('common', 'rare')
            AND NOT EXISTS (
                SELECT 1 FROM public.user_cards uc 
                WHERE uc.user_id = user_record.id AND uc.card_id = ec.id
            )
            ORDER BY RANDOM()
            LIMIT 2
        LOOP
            -- Insert new card into user's collection
            INSERT INTO public.user_cards (user_id, card_id, quantity)
            VALUES (user_record.id, card_record.id, 1);
            cards_given := cards_given + 1;
        END LOOP;
        
        -- If we couldn't find new cards, give duplicates of existing ones
        IF cards_given < 2 THEN
            FOR card_record IN 
                SELECT ec.id, ec.name, ec.knight_name, ec.rarity
                FROM public.element_cards ec
                WHERE ec.rarity = 'common'
                ORDER BY RANDOM()
                LIMIT (2 - cards_given)
            LOOP
                -- Increment existing card quantity or insert new
                INSERT INTO public.user_cards (user_id, card_id, quantity)
                VALUES (user_record.id, card_record.id, 1)
                ON CONFLICT (user_id, card_id) DO UPDATE SET
                    quantity = user_cards.quantity + 1;
                cards_given := cards_given + 1;
            END LOOP;
        END IF;
        
        -- Record the bonus pack if cards were given
        IF cards_given > 0 THEN
            INSERT INTO public.user_pack_openings (user_id, pack_type, cards_obtained)
            VALUES (
                user_record.id, 
                'variety_bonus', 
                json_build_array(json_build_object('cards_given', cards_given, 'type', 'variety_bonus'))
            );
            total_users_helped := total_users_helped + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Variety bonus complete: Helped % users with additional cards', total_users_helped;
END;
$$;