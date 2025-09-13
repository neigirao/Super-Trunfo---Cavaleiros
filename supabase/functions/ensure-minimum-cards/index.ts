import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ElementCard {
  id: string;
  name: string;
  symbol: string;
  atomic_number: number;
  knight_name: string;
  rarity: string;
  element_type: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    // Get user from the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const MINIMUM_CARDS_REQUIRED = 6

    // Check current user cards count
    const { data: userCards, error: userCardsError } = await supabase
      .from('user_cards')
      .select('id, quantity')
      .eq('user_id', user.id)

    if (userCardsError) throw userCardsError

    const currentTotal = userCards?.reduce((total, card) => total + card.quantity, 0) || 0

    if (currentTotal >= MINIMUM_CARDS_REQUIRED) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User already has minimum cards',
          cardsCount: currentTotal
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const needed = MINIMUM_CARDS_REQUIRED - currentTotal

    // Get common cards for starter pack
    const { data: commonCards, error: cardsError } = await supabase
      .from('element_cards')
      .select('*')
      .eq('rarity', 'common')
      .limit(20)

    if (cardsError) throw cardsError

    if (!commonCards || commonCards.length === 0) {
      throw new Error('No common cards available')
    }

    // Select random cards that user doesn't have
    const { data: existingUserCards } = await supabase
      .from('user_cards')
      .select('card_id')
      .eq('user_id', user.id)

    const userCardIds = existingUserCards?.map(uc => uc.card_id) || []
    const availableCards = commonCards.filter(card => !userCardIds.includes(card.id))

    // If user has most common cards, include some they already have
    const cardsToChooseFrom = availableCards.length >= needed ? availableCards : commonCards

    const selectedCards: ElementCard[] = []
    const shuffledCards = [...cardsToChooseFrom].sort(() => Math.random() - 0.5)

    for (let i = 0; i < Math.min(needed, shuffledCards.length); i++) {
      selectedCards.push(shuffledCards[i])
    }

    // Check if this is their first pack
    const { data: packHistory } = await supabase
      .from('user_pack_openings')
      .select('id')
      .eq('user_id', user.id)
      .eq('pack_type', 'emergency')
      .limit(1)

    const isFirstEmergencyPack = !packHistory || packHistory.length === 0

    // Record pack opening
    const { error: packError } = await supabase
      .from('user_pack_openings')
      .insert({
        user_id: user.id,
        pack_type: isFirstEmergencyPack ? 'starter' : 'emergency',
        cards_obtained: selectedCards.map(card => ({ id: card.id, rarity: card.rarity }))
      })

    if (packError) throw packError

    // Add cards to user collection
    for (const card of selectedCards) {
      // Check if user already has this card
      const { data: existingCard } = await supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('card_id', card.id)
        .single()

      if (existingCard) {
        // Increment quantity
        await supabase
          .from('user_cards')
          .update({ quantity: existingCard.quantity + 1 })
          .eq('id', existingCard.id)
      } else {
        // Add new card
        await supabase
          .from('user_cards')
          .insert({
            user_id: user.id,
            card_id: card.id,
            quantity: 1
          })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully added ${selectedCards.length} cards`,
        cardsAdded: selectedCards.length,
        totalCards: currentTotal + selectedCards.length,
        cards: selectedCards.map(card => ({
          name: card.knight_name,
          element: card.name,
          rarity: card.rarity
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in ensure-minimum-cards function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})