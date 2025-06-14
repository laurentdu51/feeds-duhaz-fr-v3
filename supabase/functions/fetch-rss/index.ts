
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts'

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  guid?: string;
  content?: string;
  image?: string;
}

interface RSSFeed {
  title: string;
  description: string;
  items: RSSItem[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { feedId, feedUrl } = await req.json()

    console.log(`Fetching RSS for feed: ${feedId}, URL: ${feedUrl}`)

    // Fetch RSS content
    const response = await fetch(feedUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.statusText}`)
    }

    const rssText = await response.text()
    
    // Parse RSS using deno-dom DOMParser
    const parser = new DOMParser()
    const doc = parser.parseFromString(rssText, 'text/xml')
    
    if (!doc) {
      throw new Error('Failed to parse RSS XML')
    }

    // Extract RSS items
    const items = Array.from(doc.querySelectorAll('item, entry')).map(item => {
      const title = item.querySelector('title')?.textContent?.trim() || ''
      const description = item.querySelector('description, summary')?.textContent?.trim() || ''
      const link = item.querySelector('link')?.textContent?.trim() || 
                  item.querySelector('link')?.getAttribute('href') || ''
      const pubDate = item.querySelector('pubDate, published')?.textContent?.trim() || ''
      const guid = item.querySelector('guid')?.textContent?.trim() || link
      
      // Try to extract image from content or enclosure
      let image = ''
      const enclosure = item.querySelector('enclosure[type^="image"]')
      if (enclosure) {
        image = enclosure.getAttribute('url') || ''
      } else {
        // Try to find image in content
        const content = item.querySelector('content\\:encoded, content')?.textContent
        if (content) {
          const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i)
          if (imgMatch) {
            image = imgMatch[1]
          }
        }
      }

      return {
        title,
        description,
        link,
        pubDate,
        guid,
        image,
        content: description
      }
    }).filter(item => item.title && item.guid)

    console.log(`Found ${items.length} items`)

    // Save articles to database
    const articlesToInsert = items.map(item => {
      // Calculate read time (rough estimate: 200 words per minute)
      const wordCount = (item.description || '').split(' ').length
      const readTime = Math.max(1, Math.ceil(wordCount / 200))

      return {
        feed_id: feedId,
        title: item.title,
        description: item.description,
        content: item.content || item.description,
        url: item.link,
        image_url: item.image || null,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        guid: item.guid,
        read_time: readTime
      }
    })

    // Insert articles (on conflict do nothing to avoid duplicates)
    const { error: insertError } = await supabaseClient
      .from('articles')
      .upsert(articlesToInsert, { 
        onConflict: 'feed_id,guid',
        ignoreDuplicates: true 
      })

    if (insertError) {
      console.error('Error inserting articles:', insertError)
      throw insertError
    }

    // Update feed's last_fetched_at
    const { error: updateError } = await supabaseClient
      .from('feeds')
      .update({ 
        last_fetched_at: new Date().toISOString(),
        status: 'active'
      })
      .eq('id', feedId)

    if (updateError) {
      console.error('Error updating feed:', updateError)
      throw updateError
    }

    console.log(`Successfully processed ${articlesToInsert.length} articles for feed ${feedId}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        articlesProcessed: articlesToInsert.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in fetch-rss function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
