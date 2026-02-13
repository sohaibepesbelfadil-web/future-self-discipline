
-- Create banned_users table
CREATE TABLE public.banned_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  banned_by uuid NOT NULL,
  reason text,
  ban_type text NOT NULL DEFAULT 'permanent' CHECK (ban_type IN ('permanent', 'temporary')),
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- Only admins/moderators can view bans
CREATE POLICY "Admins can view bans"
  ON public.banned_users FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Only admins/moderators can create bans
CREATE POLICY "Admins can create bans"
  ON public.banned_users FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Only admins can delete bans (unban)
CREATE POLICY "Admins can delete bans"
  ON public.banned_users FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins/moderators to delete any community post
CREATE POLICY "Admins can delete any post"
  ON public.community_posts FOR DELETE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Create a security definer function to check if a user is banned
CREATE OR REPLACE FUNCTION public.is_user_banned(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.banned_users
    WHERE user_id = _user_id
      AND (ban_type = 'permanent' OR (ban_type = 'temporary' AND expires_at > now()))
  )
$$;
