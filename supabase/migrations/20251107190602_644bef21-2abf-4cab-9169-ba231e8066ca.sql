-- Create table for simposio registrations
CREATE TABLE public.simposio_registros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL,
  pais TEXT NOT NULL,
  telefono TEXT,
  modalidad TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.simposio_registros ENABLE ROW LEVEL SECURITY;

-- Admins can view all registrations
CREATE POLICY "Admins can view all simposio registrations"
ON public.simposio_registros
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can insert their registration (public form)
CREATE POLICY "Anyone can register for simposio"
ON public.simposio_registros
FOR INSERT
WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX idx_simposio_registros_correo ON public.simposio_registros(correo);
CREATE INDEX idx_simposio_registros_created_at ON public.simposio_registros(created_at DESC);