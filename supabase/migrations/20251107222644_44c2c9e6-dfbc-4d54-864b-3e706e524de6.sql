-- Add country column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;