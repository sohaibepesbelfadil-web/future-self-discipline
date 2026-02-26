
-- Fix connections: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can create connection requests" ON public.connections;
DROP POLICY IF EXISTS "Users can delete their connections" ON public.connections;
DROP POLICY IF EXISTS "Users can update their connection requests" ON public.connections;
DROP POLICY IF EXISTS "Users can view their connections" ON public.connections;

CREATE POLICY "Users can view their connections" ON public.connections
  FOR SELECT USING ((auth.uid() = requester_id) OR (auth.uid() = addressee_id));

CREATE POLICY "Users can create connection requests" ON public.connections
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their connection requests" ON public.connections
  FOR UPDATE USING ((auth.uid() = requester_id) OR (auth.uid() = addressee_id));

CREATE POLICY "Users can delete their connections" ON public.connections
  FOR DELETE USING ((auth.uid() = requester_id) OR (auth.uid() = addressee_id));

-- Add unique constraint to prevent duplicate requests
ALTER TABLE public.connections DROP CONSTRAINT IF EXISTS unique_connection_pair;
ALTER TABLE public.connections ADD CONSTRAINT unique_connection_pair UNIQUE (requester_id, addressee_id);

-- Fix groups: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can view public groups" ON public.groups;
DROP POLICY IF EXISTS "Members can view their private groups" ON public.groups;
DROP POLICY IF EXISTS "Owners can delete their groups" ON public.groups;
DROP POLICY IF EXISTS "Owners can update their groups" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;

CREATE POLICY "Anyone can view public groups" ON public.groups
  FOR SELECT USING ((group_type = 'public'::group_type) OR (owner_id = auth.uid()));

CREATE POLICY "Members can view their private groups" ON public.groups
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.status IN ('member'::group_member_status, 'admin'::group_member_status)
  ));

CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their groups" ON public.groups
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their groups" ON public.groups
  FOR DELETE USING (auth.uid() = owner_id);

-- Fix group_members: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Members can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can request to join groups" ON public.group_members;
DROP POLICY IF EXISTS "Admins can update member status" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;

CREATE POLICY "Members can view group members" ON public.group_members
  FOR SELECT USING (
    (EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.status IN ('member'::group_member_status, 'admin'::group_member_status)
    )) OR (user_id = auth.uid())
  );

CREATE POLICY "Users can request to join groups" ON public.group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update member status" ON public.group_members
  FOR UPDATE USING (
    (EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.status = 'admin'::group_member_status
    )) OR (user_id = auth.uid())
  );

CREATE POLICY "Users can leave groups" ON public.group_members
  FOR DELETE USING (auth.uid() = user_id);
