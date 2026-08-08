-- 1. Profiles: remove broad full-row exposure
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anon can view public profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Safe, column-limited views
ALTER VIEW public.public_profiles SET (security_invoker = false);

CREATE OR REPLACE VIEW public.safe_profiles
WITH (security_invoker = false) AS
SELECT id, user_id, username, display_name, avatar_url, profile_visible, created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT SELECT ON public.safe_profiles TO authenticated;

-- 2. user_scores: no direct client writes
DROP POLICY IF EXISTS "Users can update their own scores" ON public.user_scores;
DROP POLICY IF EXISTS "System can insert scores" ON public.user_scores;
REVOKE INSERT, UPDATE ON public.user_scores FROM authenticated, anon;

CREATE OR REPLACE FUNCTION public.set_leaderboard_visibility(_visible boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  UPDATE public.user_scores
  SET leaderboard_visible = _visible, updated_at = now()
  WHERE user_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.set_leaderboard_visibility(boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_leaderboard_visibility(boolean) TO authenticated;

-- 3. Enforce bans at the database level
DROP POLICY IF EXISTS "Users can create their own posts" ON public.community_posts;
CREATE POLICY "Users can create their own posts"
ON public.community_posts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND NOT public.is_user_banned(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
CREATE POLICY "Users can update their own posts"
ON public.community_posts FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND NOT public.is_user_banned(auth.uid()))
WITH CHECK (auth.uid() = user_id AND NOT public.is_user_banned(auth.uid()));

-- 4. Server-side length limits
ALTER TABLE public.community_posts ADD CONSTRAINT community_posts_content_length CHECK (char_length(content) <= 5000);
ALTER TABLE public.notes ADD CONSTRAINT notes_title_length CHECK (char_length(title) <= 200);
ALTER TABLE public.notes ADD CONSTRAINT notes_content_length CHECK (content IS NULL OR char_length(content) <= 20000);
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_subject_length CHECK (char_length(subject) <= 200);
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_message_length CHECK (char_length(message) <= 10000);
ALTER TABLE public.tasks ADD CONSTRAINT tasks_title_length CHECK (char_length(title) <= 200);
ALTER TABLE public.tasks ADD CONSTRAINT tasks_description_length CHECK (description IS NULL OR char_length(description) <= 5000);
ALTER TABLE public.promises ADD CONSTRAINT promises_title_length CHECK (char_length(title) <= 200);
ALTER TABLE public.promises ADD CONSTRAINT promises_description_length CHECK (description IS NULL OR char_length(description) <= 5000);