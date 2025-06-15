
// Function to extract YouTube channel ID from various URL formats
export const extractYouTubeChannelId = (url: string): string | null => {
  const patterns = [
    // Channel ID format: https://www.youtube.com/channel/UCxxxxxx
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    // Handle format: https://www.youtube.com/c/ChannelName
    /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
    // User format: https://www.youtube.com/user/username
    /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
    // Custom URL format: https://www.youtube.com/@channelname
    /youtube\.com\/@([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
};

// Function to convert YouTube channel URL to RSS feed URL
export const convertYouTubeToRSS = (url: string): string => {
  // If it's already an RSS feed URL, return as is
  if (url.includes('feeds/videos.xml')) {
    return url;
  }

  const channelId = extractYouTubeChannelId(url);
  
  if (channelId) {
    // For channel ID format, we can directly create the RSS URL
    if (url.includes('/channel/')) {
      return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    }
    
    // For other formats (@username, /c/, /user/), we need to note that
    // the RSS conversion might need the actual channel ID
    // For now, we'll try with the extracted identifier
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  }
  
  // If we can't extract the channel ID, return the original URL
  return url;
};

// Function to extract channel name from @username format URL
export const extractChannelNameFromUrl = (url: string): string | null => {
  // Try to extract from @username format
  const atMatch = url.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/);
  if (atMatch && atMatch[1]) {
    return atMatch[1];
  }
  
  // Try to extract from /c/ format
  const cMatch = url.match(/youtube\.com\/c\/([a-zA-Z0-9_-]+)/);
  if (cMatch && cMatch[1]) {
    return cMatch[1];
  }
  
  // Try to extract from /user/ format
  const userMatch = url.match(/youtube\.com\/user\/([a-zA-Z0-9_-]+)/);
  if (userMatch && userMatch[1]) {
    return userMatch[1];
  }
  
  return null;
};

// Function to fetch YouTube channel name from page metadata with multiple fallbacks
export const fetchYouTubeChannelName = async (url: string): Promise<string | null> => {
  // First, try to extract name from URL if it's an @username format
  const urlName = extractChannelNameFromUrl(url);
  if (urlName) {
    console.log('Extracted channel name from URL:', urlName);
    return urlName;
  }

  // List of CORS proxy services to try
  const proxies = [
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/get?url='
  ];
  
  for (const proxy of proxies) {
    try {
      console.log(`Trying proxy: ${proxy}`);
      const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 seconds timeout
      });
      
      if (!response.ok) {
        console.log(`Proxy ${proxy} failed with status:`, response.status);
        continue;
      }
      
      let html = '';
      
      // Handle different proxy response formats
      if (proxy.includes('allorigins.win')) {
        const data = await response.json();
        html = data.contents || '';
      } else {
        html = await response.text();
      }
      
      if (html) {
        // Try to extract channel name from various meta tags
        const metaPatterns = [
          /<meta property="og:title" content="([^"]+)"/,
          /<meta name="twitter:title" content="([^"]+)"/,
          /<title>([^<]+)<\/title>/,
          /<meta property="og:site_name" content="([^"]+)"/
        ];
        
        for (const pattern of metaPatterns) {
          const match = html.match(pattern);
          if (match && match[1]) {
            let title = match[1].trim();
            // Clean up the title (remove " - YouTube" suffix if present)
            title = title.replace(/ - YouTube$/, '');
            if (title && title !== 'YouTube') {
              console.log('Successfully extracted channel name:', title);
              return title;
            }
          }
        }
      }
    } catch (error) {
      console.log(`Proxy ${proxy} failed:`, error);
      continue;
    }
  }
  
  console.log('All proxies failed, could not fetch channel name');
  return null;
};
