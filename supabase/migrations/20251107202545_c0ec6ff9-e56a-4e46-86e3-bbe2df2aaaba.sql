-- Agregar campo image_url a la tabla lessons
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Agregar campo hint a la tabla exam_questions
ALTER TABLE public.exam_questions ADD COLUMN IF NOT EXISTS hint TEXT;

-- Crear bucket de storage para imágenes de lecciones
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lesson-images', 'lesson-images', true)
ON CONFLICT (id) DO NOTHING;

-- Eliminar políticas existentes si existen (para recrearlas)
DROP POLICY IF EXISTS "Las imágenes de lecciones son públicas" ON storage.objects;
DROP POLICY IF EXISTS "Los admins pueden subir imágenes de lecciones" ON storage.objects;
DROP POLICY IF EXISTS "Los admins pueden actualizar imágenes de lecciones" ON storage.objects;
DROP POLICY IF EXISTS "Los admins pueden eliminar imágenes de lecciones" ON storage.objects;

-- Crear políticas para el bucket de imágenes de lecciones
-- Permitir lectura pública de las imágenes
CREATE POLICY "Las imágenes de lecciones son públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-images');

-- Solo admins pueden subir imágenes
CREATE POLICY "Los admins pueden subir imágenes de lecciones"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lesson-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Solo admins pueden actualizar imágenes
CREATE POLICY "Los admins pueden actualizar imágenes de lecciones"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lesson-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Solo admins pueden eliminar imágenes
CREATE POLICY "Los admins pueden eliminar imágenes de lecciones"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lesson-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);