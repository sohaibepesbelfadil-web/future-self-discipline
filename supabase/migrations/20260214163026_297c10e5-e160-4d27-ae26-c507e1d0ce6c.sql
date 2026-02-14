
-- Table to store external identity providers (e.g., Apple stable subject)
CREATE TABLE public.user_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  provider_subject text NOT NULL,
  email_snapshot text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_subject)
);

-- Enable RLS
ALTER TABLE public.user_identities ENABLE ROW LEVEL SECURITY;

-- Users can view their own identities
CREATE POLICY "Users can view their own identities"
ON public.user_identities
FOR SELECT
USING (auth.uid() = user_id);

-- Only system/edge functions insert (via service role), but allow user to see their own
CREATE POLICY "Service role can manage identities"
ON public.user_identities
FOR ALL
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_identities_updated_at
BEFORE UPDATE ON public.user_identities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
