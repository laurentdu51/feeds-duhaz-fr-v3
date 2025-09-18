-- Corriger la vulnérabilité de sécurité de la fonction is_super_user
-- en ajoutant SET search_path = public pour empêcher les attaques par manipulation du search_path

CREATE OR REPLACE FUNCTION public.is_super_user(user_email text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.super_users su
    JOIN auth.users u ON u.id = su.user_id
    WHERE u.email = COALESCE(user_email, (SELECT email FROM auth.users WHERE id = auth.uid()))
  );
$function$;