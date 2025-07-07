-- Créer une politique RLS pour permettre aux visiteurs anonymes de lire les articles
CREATE POLICY "Public users can read articles" 
ON public.articles 
FOR SELECT 
USING (true);