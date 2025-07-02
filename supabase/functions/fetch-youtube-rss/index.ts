import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    if (!url || !url.includes('youtube.com')) {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube URL' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    console.log('Fetching YouTube page:', url)
    
    // Fetch the YouTube page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`)
    }
    
    const html = await response.text()
    
    // Look for the RSS feed link in the HTML
    const rssLinkMatch = html.match(/<link[^>]+rel="alternate"[^>]+type="application\/rss\+xml"[^>]+href="([^"]+)"/i)
    
    if (!rssLinkMatch) {
      return new Response(
        JSON.stringify({ error: 'RSS feed not found on this YouTube page' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }
    
    const rssUrl = rssLinkMatch[1]
    
    // Also try to extract the channel name from the page title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
    let channelName = null
    
    if (titleMatch) {
      // Remove " - YouTube" from the end if present
      channelName = titleMatch[1].replace(/ - YouTube$/, '')
    }
    
    console.log('Found RSS URL:', rssUrl)
    console.log('Found channel name:', channelName)
    
    return new Response(
      JSON.stringify({ 
        rssUrl,
        channelName
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})