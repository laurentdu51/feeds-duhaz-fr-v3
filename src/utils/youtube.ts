
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

// Function to fetch YouTube channel name from page metadata
export const fetchYouTubeChannelName = async (url: string): Promise<string | null> => {
  try {
    // Use a CORS proxy to fetch the YouTube page
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (data.contents) {
      const html = data.contents;
      
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
            return title;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching YouTube channel name:', error);
  }
  
  return null;
};
