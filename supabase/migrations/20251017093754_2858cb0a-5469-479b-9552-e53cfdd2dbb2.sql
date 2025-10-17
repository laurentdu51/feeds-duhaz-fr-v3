-- Étape 1: Ajouter des index pour optimiser les requêtes de purge
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at);
CREATE INDEX IF NOT EXISTS idx_user_articles_article_id_pinned ON public.user_articles(article_id, is_pinned);
CREATE INDEX IF NOT EXISTS idx_user_articles_article_id_read_count ON public.user_articles(article_id, read_count);

-- Étape 2: Optimiser la fonction de purge avec une approche plus rapide
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
  v_cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculer la date limite (48 heures)
  v_cutoff_date := NOW() - INTERVAL '48 hours';
  
  -- Récupérer les emails des super users
  SELECT ARRAY_AGG(email) INTO v_admin_emails
  FROM public.super_users;
  
  -- Supprimer les articles en une seule requête optimisée
  WITH articles_to_delete AS (
    SELECT a.id
    FROM public.articles a
    WHERE a.published_at < v_cutoff_date
    AND NOT EXISTS (
      SELECT 1 
      FROM public.user_articles ua
      WHERE ua.article_id = a.id
      AND (ua.is_pinned = true OR ua.read_count > 20)
    )
    LIMIT 1000  -- Limiter pour éviter les timeouts
  ),
  deleted AS (
    DELETE FROM public.articles
    WHERE id IN (SELECT id FROM articles_to_delete)
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO v_deleted_count FROM deleted;
  
  -- Log l'opération
  RAISE NOTICE 'Purge automatique: % articles supprimés', v_deleted_count;
  
  -- Retourner les résultats
  RETURN QUERY SELECT v_deleted_count, v_admin_emails;
END;
$$;

-- Étape 3: Créer une fonction de test pour la purge manuelle
CREATE OR REPLACE FUNCTION public.test_purge_articles()
RETURNS TABLE(
  articles_to_delete INTEGER,
  oldest_article_date TIMESTAMP WITH TIME ZONE,
  newest_article_date TIMESTAMP WITH TIME ZONE,
  sample_titles TEXT[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  v_cutoff_date := NOW() - INTERVAL '48 hours';
  
  RETURN QUERY
  WITH eligible_articles AS (
    SELECT a.id, a.published_at, a.title
    FROM public.articles a
    WHERE a.published_at < v_cutoff_date
    AND NOT EXISTS (
      SELECT 1 
      FROM public.user_articles ua
      WHERE ua.article_id = a.id
      AND (ua.is_pinned = true OR ua.read_count > 20)
    )
  ),
  sample_articles AS (
    SELECT title
    FROM eligible_articles
    ORDER BY published_at DESC
    LIMIT 5
  )
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM eligible_articles),
    (SELECT MIN(published_at) FROM eligible_articles),
    (SELECT MAX(published_at) FROM eligible_articles),
    (SELECT ARRAY_AGG(title) FROM sample_articles)
  ;
END;
$$;