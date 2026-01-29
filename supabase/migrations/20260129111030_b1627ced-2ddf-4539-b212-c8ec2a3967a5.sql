-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create connection_type enum
CREATE TYPE public.connection_type AS ENUM ('friend', 'family');

-- Create connection_status enum
CREATE TYPE public.connection_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create group_type enum
CREATE TYPE public.group_type AS ENUM ('public', 'private');

-- Create group_member_status enum
CREATE TYPE public.group_member_status AS ENUM ('pending', 'member', 'admin');

-- User roles table (for admin/mod privileges - separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- User scores table (discipline metrics)
CREATE TABLE public.user_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    discipline_score INTEGER NOT NULL DEFAULT 0,
    total_promises INTEGER NOT NULL DEFAULT 0,
    promises_kept INTEGER NOT NULL DEFAULT 0,
    promises_broken INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    consistency_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    leaderboard_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Connections table (friend/family relationships)
CREATE TABLE public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL,
    addressee_id UUID NOT NULL,
    connection_type connection_type NOT NULL DEFAULT 'friend',
    status connection_status NOT NULL DEFAULT 'pending',
    hide_broken_promises BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (requester_id, addressee_id)
);

-- Groups table
CREATE TABLE public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    group_type group_type NOT NULL DEFAULT 'public',
    owner_id UUID NOT NULL,
    member_count INTEGER NOT NULL DEFAULT 1,
    average_score DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Group members table
CREATE TABLE public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    status group_member_status NOT NULL DEFAULT 'pending',
    joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (group_id, user_id)
);

-- Add username and profile_visible to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS profile_visible BOOLEAN NOT NULL DEFAULT true;

-- Enable RLS on all new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's discipline score
CREATE OR REPLACE FUNCTION public.get_user_score(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(discipline_score, 0)
  FROM public.user_scores
  WHERE user_id = _user_id
$$;

-- Function to check if users are connected
CREATE OR REPLACE FUNCTION public.are_connected(_user1 UUID, _user2 UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.connections
    WHERE status = 'accepted'
      AND ((requester_id = _user1 AND addressee_id = _user2)
           OR (requester_id = _user2 AND addressee_id = _user1))
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_scores
CREATE POLICY "Users can view their own scores"
ON public.user_scores FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public leaderboard scores"
ON public.user_scores FOR SELECT
USING (leaderboard_visible = true);

CREATE POLICY "Users can update their own scores"
ON public.user_scores FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert scores"
ON public.user_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for connections
CREATE POLICY "Users can view their connections"
ON public.connections FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create connection requests"
ON public.connections FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their connection requests"
ON public.connections FOR UPDATE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can delete their connections"
ON public.connections FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- RLS Policies for groups
CREATE POLICY "Anyone can view public groups"
ON public.groups FOR SELECT
USING (group_type = 'public' OR owner_id = auth.uid());

CREATE POLICY "Members can view their private groups"
ON public.groups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = groups.id
    AND user_id = auth.uid()
    AND status IN ('member', 'admin')
  )
);

CREATE POLICY "Users can create groups"
ON public.groups FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their groups"
ON public.groups FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their groups"
ON public.groups FOR DELETE
USING (auth.uid() = owner_id);

-- RLS Policies for group_members
CREATE POLICY "Members can view group members"
ON public.group_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
    AND gm.status IN ('member', 'admin')
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Users can request to join groups"
ON public.group_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update member status"
ON public.group_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
    AND gm.status = 'admin'
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Users can leave groups"
ON public.group_members FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to create user_scores when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_scores (user_id)
    VALUES (NEW.user_id);
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'user');
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_profile();

-- Trigger to update scores when daily_logs change
CREATE OR REPLACE FUNCTION public.update_user_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_kept INTEGER;
    v_broken INTEGER;
    v_total INTEGER;
    v_streak INTEGER;
    v_longest INTEGER;
    v_score INTEGER;
    v_consistency DECIMAL(5,2);
BEGIN
    -- Count promises kept and broken
    SELECT 
        COUNT(*) FILTER (WHERE status = 'kept'),
        COUNT(*) FILTER (WHERE status = 'broken'),
        COUNT(*)
    INTO v_kept, v_broken, v_total
    FROM public.daily_logs
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
    
    -- Calculate current streak (consecutive kept days)
    WITH ranked_logs AS (
        SELECT 
            log_date,
            status,
            log_date - (ROW_NUMBER() OVER (ORDER BY log_date))::INTEGER AS grp
        FROM public.daily_logs
        WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
        AND status = 'kept'
        ORDER BY log_date DESC
    ),
    streaks AS (
        SELECT grp, COUNT(*) as streak_length
        FROM ranked_logs
        GROUP BY grp
    )
    SELECT COALESCE(MAX(streak_length), 0) INTO v_streak
    FROM streaks
    WHERE grp = (SELECT grp FROM ranked_logs LIMIT 1);
    
    -- Get longest streak
    SELECT COALESCE(longest_streak, 0) INTO v_longest
    FROM public.user_scores
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
    
    IF v_streak > v_longest THEN
        v_longest := v_streak;
    END IF;
    
    -- Calculate score: +10 per kept, -15 per broken, +5 per streak day bonus
    v_score := (v_kept * 10) - (v_broken * 15) + (v_streak * 5);
    IF v_score < 0 THEN
        v_score := 0;
    END IF;
    
    -- Calculate consistency
    IF v_total > 0 THEN
        v_consistency := (v_kept::DECIMAL / v_total::DECIMAL) * 100;
    ELSE
        v_consistency := 0;
    END IF;
    
    -- Update or insert scores
    INSERT INTO public.user_scores (
        user_id, discipline_score, total_promises, promises_kept, 
        promises_broken, current_streak, longest_streak, consistency_percentage
    )
    VALUES (
        COALESCE(NEW.user_id, OLD.user_id), v_score, v_total, v_kept,
        v_broken, v_streak, v_longest, v_consistency
    )
    ON CONFLICT (user_id) DO UPDATE SET
        discipline_score = v_score,
        total_promises = v_total,
        promises_kept = v_kept,
        promises_broken = v_broken,
        current_streak = v_streak,
        longest_streak = v_longest,
        consistency_percentage = v_consistency,
        updated_at = now();
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_daily_log_change
AFTER INSERT OR UPDATE OR DELETE ON public.daily_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_user_scores();

-- Function to update group average score
CREATE OR REPLACE FUNCTION public.update_group_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_avg DECIMAL(10,2);
    v_count INTEGER;
BEGIN
    -- Calculate average score and member count
    SELECT 
        COALESCE(AVG(us.discipline_score), 0),
        COUNT(*)
    INTO v_avg, v_count
    FROM public.group_members gm
    JOIN public.user_scores us ON us.user_id = gm.user_id
    WHERE gm.group_id = COALESCE(NEW.group_id, OLD.group_id)
    AND gm.status IN ('member', 'admin');
    
    -- Update group stats
    UPDATE public.groups
    SET average_score = v_avg,
        member_count = v_count,
        updated_at = now()
    WHERE id = COALESCE(NEW.group_id, OLD.group_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_group_member_change
AFTER INSERT OR UPDATE OR DELETE ON public.group_members
FOR EACH ROW
EXECUTE FUNCTION public.update_group_stats();