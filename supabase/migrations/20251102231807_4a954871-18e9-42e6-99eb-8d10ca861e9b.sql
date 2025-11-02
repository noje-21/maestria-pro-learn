-- =============================================
-- 1. SISTEMA DE ROLES SEGURO
-- =============================================

-- Crear enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- Crear tabla de roles de usuario
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Habilitar RLS en user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas para user_roles (solo lectura para usuarios autenticados)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Función SECURITY DEFINER para verificar roles (evita recursión RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- =============================================
-- 2. FUNCIÓN RPC PARA ENVIAR EXAMEN
-- =============================================

CREATE OR REPLACE FUNCTION public.submit_exam_attempt(
  _exam_id UUID,
  _lesson_id UUID,
  _answers JSONB,
  _score INTEGER,
  _passed BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _attempt_id UUID;
  _next_lesson_id UUID;
  _current_lesson_number INTEGER;
  _current_module_id UUID;
BEGIN
  -- Obtener el ID del usuario autenticado
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Registrar el intento de examen
  INSERT INTO public.exam_attempts (user_id, exam_id, score, passed, answers)
  VALUES (_user_id, _exam_id, _score, _passed, _answers)
  RETURNING id INTO _attempt_id;

  -- Si aprobó, actualizar user_progress
  IF _passed THEN
    -- Insertar o actualizar progreso
    INSERT INTO public.user_progress (user_id, lesson_id, completed, completed_at)
    VALUES (_user_id, _lesson_id, true, now())
    ON CONFLICT (user_id, lesson_id) 
    DO UPDATE SET 
      completed = true,
      completed_at = now(),
      updated_at = now();

    -- Obtener información de la lección actual
    SELECT lesson_number, module_id 
    INTO _current_lesson_number, _current_module_id
    FROM public.lessons
    WHERE id = _lesson_id;

    -- Buscar la siguiente lección en el mismo módulo
    SELECT id INTO _next_lesson_id
    FROM public.lessons
    WHERE module_id = _current_module_id
      AND lesson_number = _current_lesson_number + 1
      AND is_active = true
    LIMIT 1;

    -- Si no hay más lecciones en este módulo, buscar el primer módulo siguiente
    IF _next_lesson_id IS NULL THEN
      SELECT l.id INTO _next_lesson_id
      FROM public.lessons l
      JOIN public.modules m ON l.module_id = m.id
      WHERE m.module_number = (
        SELECT module_number + 1 
        FROM public.modules 
        WHERE id = _current_module_id
      )
      AND l.lesson_number = 1
      AND l.is_active = true
      LIMIT 1;
    END IF;
  END IF;

  -- Retornar resultado
  RETURN jsonb_build_object(
    'attempt_id', _attempt_id,
    'passed', _passed,
    'score', _score,
    'next_lesson_id', _next_lesson_id
  );
END;
$$;

-- =============================================
-- 3. MEJORAR POLÍTICAS RLS
-- =============================================

-- Permitir a admins ver todos los perfiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR auth.uid() = id
);

-- Permitir a admins gestionar módulos
DROP POLICY IF EXISTS "Admins can manage modules" ON public.modules;
CREATE POLICY "Admins can manage modules"
ON public.modules
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Permitir a admins gestionar lecciones
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
CREATE POLICY "Admins can manage lessons"
ON public.lessons
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Permitir a admins gestionar exámenes
DROP POLICY IF EXISTS "Admins can manage exams" ON public.exams;
CREATE POLICY "Admins can manage exams"
ON public.exams
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Permitir a admins gestionar preguntas de examen
DROP POLICY IF EXISTS "Admins can manage exam questions" ON public.exam_questions;
CREATE POLICY "Admins can manage exam questions"
ON public.exam_questions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 4. FUNCIÓN PARA VERIFICAR SI USUARIO COMPLETÓ TODO
-- =============================================

CREATE OR REPLACE FUNCTION public.user_completed_all_lessons(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.lessons l
    WHERE l.is_active = true
      AND NOT EXISTS (
        SELECT 1
        FROM public.user_progress up
        WHERE up.user_id = _user_id
          AND up.lesson_id = l.id
          AND up.completed = true
      )
  )
$$;