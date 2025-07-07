-- Migration pour corriger les données existantes et maintenir la cohérence du nombre d'articles

-- Mettre à jour le article_count pour tous les flux existants
UPDATE public.feeds 
SET article_count = (
  SELECT COUNT(*)
  FROM public.articles
  WHERE articles.feed_id = feeds.id
);

-- Créer une fonction pour maintenir automatiquement le article_count
CREATE OR REPLACE FUNCTION public.update_feed_article_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Mise à jour du compteur d'articles pour le flux concerné
  UPDATE public.feeds 
  SET article_count = (
    SELECT COUNT(*)
    FROM public.articles
    WHERE feed_id = COALESCE(NEW.feed_id, OLD.feed_id)
  )
  WHERE id = COALESCE(NEW.feed_id, OLD.feed_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Créer des triggers pour maintenir automatiquement le article_count
CREATE TRIGGER update_feed_article_count_on_insert
  AFTER INSERT ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_feed_article_count();

CREATE TRIGGER update_feed_article_count_on_delete
  AFTER DELETE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_feed_article_count();