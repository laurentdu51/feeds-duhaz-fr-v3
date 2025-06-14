
-- Supprimer l'ancienne tâche cron défectueuse
SELECT cron.unschedule('fetch-active-feeds');

-- Créer une nouvelle tâche cron avec la syntaxe correcte
SELECT cron.schedule(
  'fetch-active-feeds',
  '*/10 * * * *', -- every 10 minutes
  $$
  SELECT net.http_post(
    url := 'https://wftyukugedtojizgatwj.supabase.co/functions/v1/fetch-rss',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdHl1a3VnZWR0b2ppemdhdHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNjIxNTEsImV4cCI6MjA2NDkzODE1MX0.KflrS6WiGksws1nO8NDm5i_Dav4u2JDSuEYtEnmKCRE"}'::jsonb,
    body := json_build_object(
      'feedId', feeds.id,
      'feedUrl', feeds.url
    )::jsonb
  )
  FROM public.feeds 
  WHERE status = 'active';
  $$
);
