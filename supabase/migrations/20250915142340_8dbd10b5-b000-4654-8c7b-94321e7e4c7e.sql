-- Migration to ensure all existing users have minimum cards
-- This will give starter cards to users who don't have enough

-- First, let's create a function to give starter cards to users who need them
CREATE OR REPLACE FUNCTION give_starter_cards_to_user(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    current_card_count INTEGER;
    needed_cards INTEGER;
    card_record RECORD;
    cards_given INTEGER := 0;
    minimum_required INTEGER := 6;
BEGIN
    -- Check current card count for user
    SELECT COALESCE(SUM(quantity), 0) INTO current_card_count
    FROM public.user_cards 
    WHERE user_id = target_user_id;
    
    -- If user already has enough cards, return
    IF current_card_count >= minimum_required THEN
        RETURN 0;
    END IF;
    
    needed_cards := minimum_required - current_card_count;
    
    -- Get common cards to give as starters (avoid duplicates if possible)
    FOR card_record IN 
        SELECT ec.id, ec.name, ec.knight_name, ec.rarity
        FROM public.element_cards ec
        WHERE ec.rarity = 'common'
        AND NOT EXISTS (
            SELECT 1 FROM public.user_cards uc 
            WHERE uc.user_id = target_user_id AND uc.card_id = ec.id
        )
        ORDER BY RANDOM()
        LIMIT needed_cards
    LOOP
        -- Insert card into user's collection
        INSERT INTO public.user_cards (user_id, card_id, quantity)
        VALUES (target_user_id, card_record.id, 1)
        ON CONFLICT (user_id, card_id) DO UPDATE SET
            quantity = user_cards.quantity + 1;
            
        cards_given := cards_given + 1;
    END LOOP;
    
    -- If we still need more cards (user had most common cards), give some random common cards
    IF cards_given < needed_cards THEN
        FOR card_record IN 
            SELECT ec.id, ec.name, ec.knight_name, ec.rarity
            FROM public.element_cards ec
            WHERE ec.rarity = 'common'
            ORDER BY RANDOM()
            LIMIT (needed_cards - cards_given)
        LOOP
            -- Insert or increment card quantity
            INSERT INTO public.user_cards (user_id, card_id, quantity)
            VALUES (target_user_id, card_record.id, 1)
            ON CONFLICT (user_id, card_id) DO UPDATE SET
                quantity = user_cards.quantity + 1;
                
            cards_given := cards_given + 1;
        END LOOP;
    END IF;
    
    -- Record the pack opening if cards were given
    IF cards_given > 0 THEN
        INSERT INTO public.user_pack_openings (user_id, pack_type, cards_obtained)
        VALUES (
            target_user_id, 
            'migration_starter', 
            json_build_array(json_build_object('cards_given', cards_given, 'type', 'migration'))
        );
    END IF;
    
    RETURN cards_given;
END;
$$;

-- Give starter cards to all users who need them
DO $$
DECLARE
    user_record RECORD;
    cards_given INTEGER;
    total_users_helped INTEGER := 0;
BEGIN
    -- Loop through all users in profiles table
    FOR user_record IN 
        SELECT DISTINCT p.id, p.email, p.full_name
        FROM public.profiles p
        WHERE p.id IS NOT NULL
    LOOP
        -- Give starter cards to this user
        SELECT give_starter_cards_to_user(user_record.id) INTO cards_given;
        
        IF cards_given > 0 THEN
            total_users_helped := total_users_helped + 1;
            RAISE NOTICE 'Gave % cards to user % (%)', cards_given, user_record.full_name, user_record.email;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Migration complete: Helped % users with starter cards', total_users_helped;
END;
$$;

-- Clean up the temporary function
DROP FUNCTION IF EXISTS give_starter_cards_to_user(UUID);