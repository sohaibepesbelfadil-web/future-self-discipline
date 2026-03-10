-- Fix SECURITY DEFINER view by explicitly setting SECURITY INVOKER
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  username,
  display_name,
  avatar_url,
  profile_visible,
  created_at
FROM public.profiles
WHERE profile_visible = true;

-- We need a policy that allows authenticated users to see public profiles (non-sensitive fields only)
-- The view + RLS approach: add a policy for reading public profiles with limited info
-- Since the view filters to profile_visible=true, we need a policy that allows this
CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (profile_visible = true);

-- Allow anon to see public profiles through the view
CREATE POLICY "Anon can view public profiles"
ON public.profiles
FOR SELECT
TO anon
USING (profile_visible = true);