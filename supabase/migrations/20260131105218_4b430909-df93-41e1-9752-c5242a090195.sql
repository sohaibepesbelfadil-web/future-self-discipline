-- Add new profile fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS real_name text,
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS age integer CHECK (age >= 13 OR age IS NULL);

-- Add unique constraint on username
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Update RLS policy to allow viewing public profiles
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
CREATE POLICY "Users can view public profiles" 
ON public.profiles 
FOR SELECT 
USING (
  profile_visible = true 
  OR auth.uid() = user_id
);

-- Drop the old restrictive policy if it exists
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;