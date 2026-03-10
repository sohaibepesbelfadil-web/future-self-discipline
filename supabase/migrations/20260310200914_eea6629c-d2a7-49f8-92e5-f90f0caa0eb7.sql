-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

-- 1. Users can always see their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Create a secure view that only exposes safe fields for public access
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;