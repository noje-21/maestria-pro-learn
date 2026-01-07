-- ============================================
-- CORRECCIÓN DE PROGRESO - FASE 7
-- Funciones RPC robustas para persistencia
-- ============================================

-- 1. FUNCIÓN PARA COMPLETAR LECCIÓN
-- Reemplaza mark_lesson_viewed con lógica correcta
CREATE OR REPLACE FUNCTION public.complete_lesson(_lesson_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id UUID;
  _lesson_exists BOOLEAN;
  _module_id UUID;
  _course_id UUID;
  _current_progress NUMERIC;
BEGIN
  -- Get authenticated user
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Validate lesson exists
  SELECT EXISTS(
    SELECT 1 FROM public.lessons WHERE id = _lesson_id AND is_active = true
  ) INTO _lesson_exists;

  IF NOT _lesson_exists THEN
    RAISE EXCEPTION 'La lección no existe o no está activa';
  END IF;

  -- Get module and course IDs
  SELECT l.module_id, m.course_id 
  INTO _module_id, _course_id
  FROM public.lessons l
  JOIN public.modules m ON l.module_id = m.id
  WHERE l.id = _lesson_id;

  -- Mark lesson as completed (UPSERT)
  INSERT INTO public.user_progress (user_id, lesson_id, completed, completed_at)
  VALUES (_user_id, _lesson_id, true, now())
  ON CONFLICT (user_id, lesson_id) 
  DO UPDATE SET 
    completed = true,
    completed_at = COALESCE(public.user_progress.completed_at, now()),
    updated_at = now();

  -- Calculate and update course progress
  SELECT calculate_course_progress(_user_id, _course_id) INTO _current_progress;
  
  -- Update user_courses with new progress
  UPDATE public.user_courses
  SET 
    progress = _current_progress,
    status = CASE WHEN _current_progress >= 100 THEN 'completed' ELSE 'enrolled' END,
    completed_at = CASE WHEN _current_progress >= 100 THEN now() ELSE NULL END,
    updated_at = now()
  WHERE user_id = _user_id AND course_id = _course_id;

  -- Return success with updated data
  RETURN jsonb_build_object(
    'success', true,
    'lesson_id', _lesson_id,
    'course_id', _course_id,
    'progress', _current_progress,
    'completed_at', now()
  );
END;
$$;

-- 2. FUNCIÓN PARA OBTENER PROGRESO REAL DEL USUARIO
CREATE OR REPLACE FUNCTION public.get_user_course_progress(_course_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id UUID;
  _result jsonb;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Usuario no autenticado');
  END IF;

  SELECT jsonb_build_object(
    'course_id', _course_id,
    'progress', COALESCE(uc.progress, 0),
    'status', COALESCE(uc.status, 'not_enrolled'),
    'enrolled_at', uc.enrolled_at,
    'completed_at', uc.completed_at,
    'completed_lessons', (
      SELECT jsonb_agg(lesson_id)
      FROM public.user_progress up
      JOIN public.lessons l ON up.lesson_id = l.id
      JOIN public.modules m ON l.module_id = m.id
      WHERE up.user_id = _user_id 
        AND up.completed = true
        AND m.course_id = _course_id
    ),
    'last_completed_lesson', (
      SELECT up.lesson_id
      FROM public.user_progress up
      JOIN public.lessons l ON up.lesson_id = l.id
      JOIN public.modules m ON l.module_id = m.id
      WHERE up.user_id = _user_id 
        AND up.completed = true
        AND m.course_id = _course_id
      ORDER BY up.completed_at DESC
      LIMIT 1
    )
  )
  INTO _result
  FROM public.user_courses uc
  WHERE uc.user_id = _user_id AND uc.course_id = _course_id;

  -- If not enrolled, return default
  IF _result IS NULL THEN
    RETURN jsonb_build_object(
      'course_id', _course_id,
      'progress', 0,
      'status', 'not_enrolled',
      'completed_lessons', '[]'::jsonb,
      'last_completed_lesson', null
    );
  END IF;

  RETURN _result;
END;
$$;

-- 3. AGREGAR ÍNDICE ÚNICO PARA EVITAR DUPLICADOS
DROP INDEX IF EXISTS idx_user_progress_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progress_user_lesson 
ON public.user_progress(user_id, lesson_id);

-- 4. FUNCIÓN PARA RECALCULAR TODO EL PROGRESO (ADMIN/RECOVERY)
CREATE OR REPLACE FUNCTION public.recalculate_all_progress()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can run this
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Update all user_courses with correct progress
  UPDATE public.user_courses uc
  SET 
    progress = calculate_course_progress(uc.user_id, uc.course_id),
    status = CASE 
      WHEN calculate_course_progress(uc.user_id, uc.course_id) >= 100 THEN 'completed' 
      ELSE 'enrolled' 
    END,
    updated_at = now();
END;
$$;