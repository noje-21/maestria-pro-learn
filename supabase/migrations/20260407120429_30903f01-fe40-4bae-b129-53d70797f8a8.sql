
-- 1. Create secure view for exam questions (excludes correct_answer)
CREATE OR REPLACE VIEW public.exam_questions_safe AS
SELECT id, exam_id, question_text, option_a, option_b, option_c, option_d, hint, created_at
FROM public.exam_questions;

-- Grant access to the view
GRANT SELECT ON public.exam_questions_safe TO authenticated;
GRANT SELECT ON public.exam_questions_safe TO anon;

-- 2. Update submit_exam_attempt to do SERVER-SIDE grading
CREATE OR REPLACE FUNCTION public.submit_exam_attempt(_exam_id uuid, _lesson_id uuid, _answers jsonb, _score integer DEFAULT 0, _passed boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _attempt_id UUID;
  _next_lesson_id UUID;
  _current_lesson_number INTEGER;
  _current_module_id UUID;
  _total_questions INTEGER;
  _correct_count INTEGER;
  _calculated_score INTEGER;
  _calculated_passed BOOLEAN;
  _passing_score INTEGER;
  _question RECORD;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Get passing score for this exam
  SELECT passing_score INTO _passing_score FROM public.exams WHERE id = _exam_id;
  IF _passing_score IS NULL THEN
    _passing_score := 80;
  END IF;

  -- Server-side grading: count correct answers
  _total_questions := 0;
  _correct_count := 0;
  
  FOR _question IN 
    SELECT eq.id, eq.correct_answer, eq.option_a, eq.option_b, eq.option_c, eq.option_d
    FROM public.exam_questions eq
    WHERE eq.exam_id = _exam_id
  LOOP
    _total_questions := _total_questions + 1;
    
    -- Map correct_answer letter to option_key and compare with student answer
    IF (_question.correct_answer = 'A' AND _answers->>(_question.id::text) = 'option_a') OR
       (_question.correct_answer = 'B' AND _answers->>(_question.id::text) = 'option_b') OR
       (_question.correct_answer = 'C' AND _answers->>(_question.id::text) = 'option_c') OR
       (_question.correct_answer = 'D' AND _answers->>(_question.id::text) = 'option_d') THEN
      _correct_count := _correct_count + 1;
    END IF;
  END LOOP;

  IF _total_questions = 0 THEN
    RAISE EXCEPTION 'No se encontraron preguntas para este examen';
  END IF;

  _calculated_score := ROUND((_correct_count::NUMERIC / _total_questions::NUMERIC) * 100);
  _calculated_passed := _calculated_score >= _passing_score;

  -- Record the attempt with SERVER-calculated score
  INSERT INTO public.exam_attempts (user_id, exam_id, score, passed, answers)
  VALUES (_user_id, _exam_id, _calculated_score, _calculated_passed, _answers)
  RETURNING id INTO _attempt_id;

  -- If passed, update progress
  IF _calculated_passed THEN
    INSERT INTO public.user_progress (user_id, lesson_id, completed, completed_at)
    VALUES (_user_id, _lesson_id, true, now())
    ON CONFLICT (user_id, lesson_id) 
    DO UPDATE SET 
      completed = true,
      completed_at = now(),
      updated_at = now();

    SELECT lesson_number, module_id 
    INTO _current_lesson_number, _current_module_id
    FROM public.lessons
    WHERE id = _lesson_id;

    SELECT id INTO _next_lesson_id
    FROM public.lessons
    WHERE module_id = _current_module_id
      AND lesson_number = _current_lesson_number + 1
      AND is_active = true
    LIMIT 1;

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

  RETURN jsonb_build_object(
    'attempt_id', _attempt_id,
    'passed', _calculated_passed,
    'score', _calculated_score,
    'correct_count', _correct_count,
    'total_questions', _total_questions,
    'next_lesson_id', _next_lesson_id
  );
END;
$function$;

-- 3. Remove the public INSERT policy on user_courses (prevents self-enrollment bypass)
DROP POLICY IF EXISTS "Users can enroll in courses" ON public.user_courses;

-- 4. Drop the old permissive SELECT policy for exam_questions for non-admins
-- Keep admin policy, replace student policy with one that excludes correct_answer
DROP POLICY IF EXISTS "Exam questions are viewable by authenticated users" ON public.exam_questions;

-- Only admins can directly query exam_questions (with correct_answer)
-- Students must use the exam_questions_safe view
CREATE POLICY "Only admins can view exam questions directly"
ON public.exam_questions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
