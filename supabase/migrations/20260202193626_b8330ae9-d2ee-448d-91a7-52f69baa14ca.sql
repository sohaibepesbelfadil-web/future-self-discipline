-- Create a trigger function to automatically set owner_id to the authenticated user
CREATE OR REPLACE FUNCTION public.set_group_owner_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Always set owner_id to the authenticated user, preventing impersonation
    NEW.owner_id := auth.uid();
    RETURN NEW;
END;
$$;

-- Create trigger to run before INSERT on groups table
DROP TRIGGER IF EXISTS set_group_owner_trigger ON public.groups;
CREATE TRIGGER set_group_owner_trigger
    BEFORE INSERT ON public.groups
    FOR EACH ROW
    EXECUTE FUNCTION public.set_group_owner_id();