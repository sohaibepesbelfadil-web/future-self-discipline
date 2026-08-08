REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_user_score(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.are_connected(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_user_banned(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_score(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.are_connected(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_user_banned(uuid) TO authenticated, service_role;