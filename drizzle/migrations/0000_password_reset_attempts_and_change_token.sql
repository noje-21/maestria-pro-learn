ALTER TABLE public.password_reset_tokens
  ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS change_token_hash text,
  ADD COLUMN IF NOT EXISTS change_expires_at timestamptz;
GRANT ALL ON public.password_reset_tokens TO service_role;
DELETE FROM public.password_reset_tokens;