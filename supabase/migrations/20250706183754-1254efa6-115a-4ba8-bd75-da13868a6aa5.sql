-- Créer les politiques RLS manquantes pour la suppression des flux

-- Politique DELETE pour la table feeds - seuls les super utilisateurs peuvent supprimer des flux
CREATE POLICY "Super users can delete feeds" 
ON public.feeds 
FOR DELETE 
TO authenticated
USING (public.is_super_user());

-- Politique DELETE pour la table articles - permettre la suppression en cascade quand un flux est supprimé
CREATE POLICY "Articles can be deleted when feed is deleted" 
ON public.articles 
FOR DELETE 
TO authenticated
USING (public.is_super_user());

-- La table user_articles a déjà une politique DELETE qui permet aux utilisateurs de gérer leurs propres interactions