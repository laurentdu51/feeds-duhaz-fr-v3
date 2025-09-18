-- Corriger la vulnérabilité de sécurité de la fonction update_feed_article_count
-- en ajoutant SET search_path = public pour empêcher les attaques par manipulation du search_path

CREATE OR REPLACE FUNCTION public.update_feed_article_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
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
$function$;