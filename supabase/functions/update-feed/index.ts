
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { feedId, url } = await req.json()

    if (!feedId || !url) {
      return new Response(
        JSON.stringify({ error: 'Feed ID and URL are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Fetching RSS feed from: ${url}`)

    // Fetch RSS feed
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS Feed Updater/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const rssText = await response.text()
    console.log('RSS content fetched successfully')

    // Parse RSS content to extract metadata
    const titleMatch = rssText.match(/<title[^>]*>(.*?)<\/title>/i)
    const descriptionMatch = rssText.match(/<description[^>]*>(.*?)<\/description>/i) ||
                            rssText.match(/<subtitle[^>]*>(.*?)<\/subtitle>/i)
    
    // Count items in the feed
    const itemMatches = rssText.match(/<item[^>]*>/gi) || rssText.match(/<entry[^>]*>/gi) || []
    const articleCount = itemMatches.length

    // Clean up extracted text (remove HTML tags and decode entities)
    const cleanText = (text: string) => {
      if (!text) return ''
      return text
        .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim()
    }

    const extractedTitle = titleMatch ? cleanText(titleMatch[1]) : null
    const extractedDescription = descriptionMatch ? cleanText(descriptionMatch[1]) : null

    console.log(`Extracted data: title="${extractedTitle}", description="${extractedDescription}", articles=${articleCount}`)

    // Update feed in database
    const updateData: any = {
      last_updated: new Date().toISOString(),
      article_count: articleCount,
      status: 'active'
    }

    // Only update title and description if we found them and they're different
    if (extractedTitle) {
      updateData.name = extractedTitle
    }
    if (extractedDescription) {
      updateData.description = extractedDescription
    }

    const { data, error } = await supabase
      .from('feeds')
      .update(updateData)
      .eq('id', feedId)
      .select()

    if (error) {
      console.error('Database update error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to update feed in database' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Feed updated successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data[0],
        extracted: {
          title: extractedTitle,
          description: extractedDescription,
          articleCount
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error updating feed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
