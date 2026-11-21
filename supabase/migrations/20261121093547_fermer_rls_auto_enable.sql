-- Fonction créée par l'option « RLS automatique » de Supabase : elle ne doit pas être appelable par l'API.
-- Elle continue de servir de déclencheur d'événement (exécutée par son propriétaire).
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
