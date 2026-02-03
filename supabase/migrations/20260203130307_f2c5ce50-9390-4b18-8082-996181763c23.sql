-- Add QCM responses column to profiles for storing onboarding answers
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS qcm_responses jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS privacy_accepted_at timestamp with time zone DEFAULT NULL;

-- Add image_url column to community_posts for photo posts
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS image_url text DEFAULT NULL;

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    category text NOT NULL DEFAULT 'feedback',
    status text NOT NULL DEFAULT 'open',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for support_tickets
CREATE POLICY "Users can create their own tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tickets"
ON public.support_tickets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
ON public.support_tickets
FOR UPDATE
USING (auth.uid() = user_id);

-- Create storage bucket for community post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-images', 'community-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for community images
CREATE POLICY "Community images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'community-images');

CREATE POLICY "Users can upload community images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'community-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own community images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'community-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own community images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'community-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add trigger for updated_at on support_tickets
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();