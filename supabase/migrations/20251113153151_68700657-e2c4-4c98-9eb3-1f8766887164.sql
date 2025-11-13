-- Crear bucket para imágenes de correos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'email-assets',
  'email-assets',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Política: Admins pueden subir imágenes
CREATE POLICY "Admins can upload email images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'email-assets' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Política: Imágenes son públicas para lectura
CREATE POLICY "Email images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'email-assets');

-- Política: Admins pueden actualizar imágenes
CREATE POLICY "Admins can update email images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'email-assets' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Política: Admins pueden eliminar imágenes
CREATE POLICY "Admins can delete email images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'email-assets' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Crear tabla para guardar borradores de correos
CREATE TABLE IF NOT EXISTS public.email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  connection_link TEXT,
  manual_recipients TEXT,
  selected_recipient_ids TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para borradores
ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage their drafts"
ON public.email_drafts
FOR ALL
TO authenticated
USING (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
)
WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_email_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_email_drafts_updated_at ON public.email_drafts;

CREATE TRIGGER trigger_update_email_drafts_updated_at
BEFORE UPDATE ON public.email_drafts
FOR EACH ROW
EXECUTE FUNCTION update_email_drafts_updated_at();