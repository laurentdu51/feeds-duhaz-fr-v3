-- Étape 1: Ajouter la colonne read_count à la table user_articles
ALTER TABLE public.user_articles 
ADD COLUMN IF NOT EXISTS read_count INTEGER NOT NULL DEFAULT 0;

-- Étape 2: Créer la fonction trigger pour incrémenter read_count
CREATE OR REPLACE FUNCTION public.increment_read_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Incrémenter uniquement si is_read passe de false à true
  IF NEW.is_read = true AND OLD.is_read = false THEN
    NEW.read_count = OLD.read_count + 1;
  END IF;
  RETURN NEW;
END;
$$;

-- Étape 3: Créer le trigger sur user_articles
DROP TRIGGER IF EXISTS trigger_increment_read_count ON public.user_articles;
CREATE TRIGGER trigger_increment_read_count
  BEFORE UPDATE ON public.user_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_read_count();

-- Étape 4: Vérifier et mettre à jour la foreign key avec CASCADE
ALTER TABLE public.user_articles
DROP CONSTRAINT IF EXISTS user_articles_article_id_fkey;

ALTER TABLE public.user_articles
ADD CONSTRAINT user_articles_article_id_fkey
FOREIGN KEY (article_id) 
REFERENCES public.articles(id) 
ON DELETE CASCADE;

-- Étape 5: Créer la fonction de purge automatique
CREATE OR REPLACE FUNCTION public.purge_old_articles()
RETURNS TABLE(
  deleted_count INTEGER,
  admin_emails TEXT[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INTEGER;
  v_admin_emails TEXT[];
BEGIN
  -- Récupérer les emails des super users
  SELECT ARRAY_AGG(email) INTO v_admin_emails
  FROM public.super_users;
  
  -- Supprimer les articles de plus de 48h qui ne sont ni épinglés ni très lus
  WITH deleted AS (
    DELETE FROM public.articles
    WHERE id IN (
      SELECT a.id 
      FROM public.articles a
      WHERE a.published_at < NOW() - INTERVAL '48 hours'
      AND NOT EXISTS (
        SELECT 1 
        FROM public.user_articles ua
        WHERE ua.article_id = a.id
        AND (ua.is_pinned = true OR ua.read_count > 20)
      )
    )
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;
  
  -- Log l'opération
  RAISE NOTICE 'Purge automatique: % articles supprimés', v_deleted_count;
  
  -- Retourner les résultats
  RETURN QUERY SELECT v_deleted_count, v_admin_emails;
END;
$$;

-- Étape 6: Activer l'extension pg_cron si pas déjà activée
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Étape 7: Créer le cron job pour exécuter tous les jours à 3h du matin
SELECT cron.schedule(
  'purge-old-articles-daily',
  '0 3 * * *', -- Tous les jours à 3h00 du matin
  $$
  SELECT net.http_post(
    url := 'https://wftyukugedtojizgatwj.supabase.co/functions/v1/purge-articles',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdHl1a3VnZWR0b2ppemdhdHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNjIxNTEsImV4cCI6MjA2NDkzODE1MX0.KflrS6WiGksws1nO8NDm5i_Dav4u2JDSuEYtEnmKCRE"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);