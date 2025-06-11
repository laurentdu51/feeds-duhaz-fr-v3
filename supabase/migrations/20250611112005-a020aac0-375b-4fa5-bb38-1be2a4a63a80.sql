
-- Create articles table to store RSS feed content
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_id UUID REFERENCES public.feeds(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  guid TEXT, -- RSS GUID for deduplication
  read_time INTEGER DEFAULT 5, -- estimated read time in minutes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure we don't duplicate articles
  UNIQUE(feed_id, guid)
);

-- Add indexes for better performance
CREATE INDEX idx_articles_feed_id ON public.articles(feed_id);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_articles_guid ON public.articles(guid);

-- Create user_articles table to track read status and pins
CREATE TABLE public.user_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one record per user per article
  UNIQUE(user_id, article_id)
);

-- Add indexes for user_articles
CREATE INDEX idx_user_articles_user_id ON public.user_articles(user_id);
CREATE INDEX idx_user_articles_article_id ON public.user_articles(article_id);

-- Enable RLS on articles (public read, but we'll filter by user subscriptions in code)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read articles
CREATE POLICY "Authenticated users can read articles" 
  ON public.articles 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Enable RLS on user_articles
ALTER TABLE public.user_articles ENABLE ROW LEVEL SECURITY;

-- Users can only access their own article interactions
CREATE POLICY "Users can manage their own article interactions" 
  ON public.user_articles 
  FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update feeds table to track last fetch time
ALTER TABLE public.feeds 
ADD COLUMN IF NOT EXISTS last_fetched_at TIMESTAMP WITH TIME ZONE;
