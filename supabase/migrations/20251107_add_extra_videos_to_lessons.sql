-- ================================================
-- 🚀 Migración: Agregar campos de video adicionales
-- Fecha: 2025-11-07
-- ================================================

-- Asegurar que la extensión UUID esté activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 🧩 Agregar columnas nuevas si no existen
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS video1_url TEXT,
ADD COLUMN IF NOT EXISTS video2_url TEXT;

-- 🧩 Verificar que los campos nuevos no estén vacíos (opcional)
UPDATE public.lessons
SET video1_url = NULL, video2_url = NULL
WHERE video1_url IS NULL AND video2_url IS NULL;

-- ✅ Activar seguridad (por si no está habilitada)
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- 🛡️ Política: usuarios autenticados pueden ver las lecciones
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Lessons are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Lessons are viewable by authenticated users"
      ON public.lessons FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;
