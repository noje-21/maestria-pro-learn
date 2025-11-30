-- Mejoras a la tabla courses existente
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'maestría',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft'));

-- Crear tabla de inscripciones de usuarios a cursos
CREATE TABLE IF NOT EXISTS public.user_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'finished', 'pending')),
  progress NUMERIC(5,2) DEFAULT 0.0,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Habilitar RLS en user_courses
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_courses
CREATE POLICY "Users can view their own course enrollments"
ON public.user_courses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses"
ON public.user_courses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments"
ON public.user_courses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments"
ON public.user_courses
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all enrollments"
ON public.user_courses
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_user_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_user_courses_updated_at
BEFORE UPDATE ON public.user_courses
FOR EACH ROW
EXECUTE FUNCTION update_user_courses_updated_at();

-- Función para calcular progreso de un curso
CREATE OR REPLACE FUNCTION calculate_course_progress(_user_id UUID, _course_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  progress_percentage NUMERIC;
BEGIN
  -- Contar total de lecciones activas del curso
  SELECT COUNT(*) INTO total_lessons
  FROM public.lessons l
  INNER JOIN public.modules m ON l.module_id = m.id
  WHERE m.course_id = _course_id
    AND l.is_active = true;
  
  -- Si no hay lecciones, retornar 0
  IF total_lessons = 0 THEN
    RETURN 0;
  END IF;
  
  -- Contar lecciones completadas por el usuario
  SELECT COUNT(*) INTO completed_lessons
  FROM public.user_progress up
  INNER JOIN public.lessons l ON up.lesson_id = l.id
  INNER JOIN public.modules m ON l.module_id = m.id
  WHERE up.user_id = _user_id
    AND m.course_id = _course_id
    AND up.completed = true;
  
  -- Calcular porcentaje
  progress_percentage := (completed_lessons::NUMERIC / total_lessons::NUMERIC) * 100;
  
  RETURN ROUND(progress_percentage, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Función para inscribir usuario en curso
CREATE OR REPLACE FUNCTION enroll_in_course(_course_id UUID)
RETURNS JSON AS $$
DECLARE
  _user_id UUID;
  _enrollment_id UUID;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  -- Verificar que el curso existe y está activo
  IF NOT EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = _course_id AND status = 'active' AND is_active = true
  ) THEN
    RAISE EXCEPTION 'El curso no está disponible';
  END IF;
  
  -- Inscribir (o actualizar si ya existe)
  INSERT INTO public.user_courses (user_id, course_id, status)
  VALUES (_user_id, _course_id, 'enrolled')
  ON CONFLICT (user_id, course_id) 
  DO UPDATE SET 
    status = 'enrolled',
    updated_at = now()
  RETURNING id INTO _enrollment_id;
  
  RETURN json_build_object(
    'success', true,
    'enrollment_id', _enrollment_id,
    'message', 'Inscripción exitosa'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Actualizar RLS de courses para permitir ver solo cursos activos
DROP POLICY IF EXISTS "Courses are viewable by authenticated users" ON public.courses;

CREATE POLICY "Active courses are viewable by authenticated users"
ON public.courses
FOR SELECT
USING (
  auth.role() = 'authenticated' 
  AND (status = 'active' OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Admins can manage courses"
ON public.courses
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));