
-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job that runs every 10 minutes to fetch RSS content for active feeds
SELECT cron.schedule(
  'fetch-active-feeds',
  '*/10 * * * *', -- every 10 minutes
  $$
  DECLARE
    feed_record RECORD;
  BEGIN
    -- Loop through all active feeds
    FOR feed_record IN 
      SELECT id, url FROM public.feeds WHERE status = 'active'
    LOOP
      -- Call the fetch-rss function for each active feed
      PERFORM net.http_post(
        url := 'https://wftyukugedtojizgatwj.supabase.co/functions/v1/fetch-rss',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdHl1a3VnZWR0b2ppemdhdHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNjIxNTEsImV4cCI6MjA2NDkzODE1MX0.KflrS6WiGksws1nO8NDm5i_Dav4u2JDSuEYtEnmKCRE"}'::jsonb,
        body := json_build_object(
          'feedId', feed_record.id,
          'feedUrl', feed_record.url
        )::jsonb
      );
    END LOOP;
  END;
  $$
);
