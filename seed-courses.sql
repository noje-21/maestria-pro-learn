-- ========================================
-- SEED: Cursos de Ejemplo para Testing
-- ========================================
-- Este archivo contiene datos de ejemplo para probar el sistema multi-curso.
-- Puedes ejecutarlo desde el panel de admin de Supabase o usando la CLI.

-- Curso 1: Diplomado en Hipertensión Pulmonar (Nivel Avanzado)
INSERT INTO public.courses (
  title,
  description,
  image_url,
  level,
  status,
  is_active,
  start_date,
  end_date
) VALUES (
  'Diplomado en Hipertensión Pulmonar',
  'Programa especializado enfocado en el diagnóstico, tratamiento y manejo clínico de la hipertensión pulmonar. Incluye casos clínicos reales y protocolos actualizados.',
  NULL, -- Agregar URL de imagen si está disponible
  'avanzado',
  'active',
  true,
  '2025-03-01',
  '2025-08-31'
) ON CONFLICT DO NOTHING;

-- Curso 2: Fundamentos de Cardiología Pulmonar (Nivel Básico)
INSERT INTO public.courses (
  title,
  description,
  image_url,
  level,
  status,
  is_active,
  start_date,
  end_date
) VALUES (
  'Fundamentos de Cardiología Pulmonar',
  'Introducción completa a la cardiología pulmonar. Ideal para residentes y médicos generales que desean especializarse en esta área.',
  NULL,
  'básico',
  'active',
  true,
  '2025-02-01',
  '2025-06-30'
) ON CONFLICT DO NOTHING;

-- Curso 3: Actualización en Circulación Pulmonar 2025 (Nivel Medio)
INSERT INTO public.courses (
  title,
  description,
  image_url,
  level,
  status,
  is_active,
  start_date,
  end_date
) VALUES (
  'Actualización en Circulación Pulmonar 2025',
  'Curso de actualización con las últimas investigaciones y avances en el campo de la circulación pulmonar. Incluye conferencias de expertos internacionales.',
  NULL,
  'medio',
  'active',
  true,
  '2025-04-01',
  '2025-09-30'
) ON CONFLICT DO NOTHING;

-- Curso 4: Especialización en Ecocardiografía Pulmonar (Nivel Avanzado)
INSERT INTO public.courses (
  title,
  description,
  image_url,
  level,
  status,
  is_active,
  start_date,
  end_date
) VALUES (
  'Especialización en Ecocardiografía Pulmonar',
  'Formación intensiva en técnicas avanzadas de ecocardiografía aplicadas al diagnóstico de patologías pulmonares. Incluye prácticas con simuladores.',
  NULL,
  'avanzado',
  'active',
  true,
  '2025-05-01',
  '2025-11-30'
) ON CONFLICT DO NOTHING;

-- Curso 5: Curso en Borrador (para testing de estado "draft")
INSERT INTO public.courses (
  title,
  description,
  image_url,
  level,
  status,
  is_active,
  start_date
) VALUES (
  'Próximo Curso en Desarrollo',
  'Este curso está en fase de preparación y no debe ser visible para los estudiantes hasta que se active.',
  NULL,
  'medio',
  'draft',
  true,
  '2025-09-01'
) ON CONFLICT DO NOTHING;

-- ========================================
-- Módulos de Ejemplo para Cursos Nuevos
-- ========================================

-- Obtener IDs de los cursos recién creados
DO $$
DECLARE
  diplomado_id UUID;
  fundamentos_id UUID;
BEGIN
  -- ID del Diplomado
  SELECT id INTO diplomado_id 
  FROM public.courses 
  WHERE title = 'Diplomado en Hipertensión Pulmonar' 
  LIMIT 1;
  
  -- ID de Fundamentos
  SELECT id INTO fundamentos_id 
  FROM public.courses 
  WHERE title = 'Fundamentos de Cardiología Pulmonar' 
  LIMIT 1;
  
  -- Solo agregar módulos si los cursos existen
  IF diplomado_id IS NOT NULL THEN
    -- Módulo 1 del Diplomado
    INSERT INTO public.modules (
      course_id,
      module_number,
      title,
      description,
      instructor,
      is_active
    ) VALUES (
      diplomado_id,
      1,
      'Introducción a la Hipertensión Pulmonar',
      'Conceptos básicos, fisiopatología y clasificación',
      'Dr. Carlos Mendoza',
      true
    ) ON CONFLICT DO NOTHING;
    
    -- Módulo 2 del Diplomado
    INSERT INTO public.modules (
      course_id,
      module_number,
      title,
      description,
      instructor,
      is_active
    ) VALUES (
      diplomado_id,
      2,
      'Diagnóstico Clínico',
      'Métodos diagnósticos y pruebas complementarias',
      'Dra. Ana Rodríguez',
      true
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  IF fundamentos_id IS NOT NULL THEN
    -- Módulo 1 de Fundamentos
    INSERT INTO public.modules (
      course_id,
      module_number,
      title,
      description,
      instructor,
      is_active
    ) VALUES (
      fundamentos_id,
      1,
      'Anatomía Cardiovascular Pulmonar',
      'Estructura y función del sistema cardiovascular pulmonar',
      'Dr. Miguel Fernández',
      true
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ========================================
-- Verificación de Datos
-- ========================================

-- Consulta para verificar cursos creados
SELECT 
  id,
  title,
  level,
  status,
  (SELECT COUNT(*) FROM modules WHERE course_id = courses.id) as modules_count
FROM public.courses
ORDER BY created_at DESC;
