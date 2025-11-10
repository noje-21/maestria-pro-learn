-- Add documento field to simposio_registros table
ALTER TABLE public.simposio_registros 
ADD COLUMN IF NOT EXISTS documento TEXT NOT NULL DEFAULT '';