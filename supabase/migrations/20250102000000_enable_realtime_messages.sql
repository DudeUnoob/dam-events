-- Enable Realtime for Messages Table
-- This migration enables real-time subscriptions for the messages table
-- so that both parties can see messages instantly

-- Enable realtime publication for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Set replica identity to FULL to include old values in updates
-- This is required for realtime to work properly with UPDATE events
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Create index for realtime performance
CREATE INDEX IF NOT EXISTS idx_messages_realtime ON public.messages(lead_id, created_at DESC);

-- Comment explaining the purpose
COMMENT ON TABLE public.messages IS 'Messages between planners and vendors. Realtime enabled for instant messaging.';
