-- Create learning_analytics table for tracking real learning data
CREATE TABLE public.learning_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER DEFAULT 0,
  video_views JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning_sessions table for daily aggregated data
CREATE TABLE public.learning_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_time_seconds INTEGER DEFAULT 0,
  lessons_viewed INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  videos_watched INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, session_date)
);

-- Create user_learning_profile for storing learning patterns
CREATE TABLE public.user_learning_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  preferred_time_slot TEXT,
  avg_session_duration_minutes INTEGER DEFAULT 0,
  learning_pace TEXT DEFAULT 'moderate',
  total_study_time_minutes INTEGER DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE,
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_profile ENABLE ROW LEVEL SECURITY;

-- RLS policies for learning_analytics
CREATE POLICY "Users can view their own analytics"
ON public.learning_analytics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
ON public.learning_analytics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics"
ON public.learning_analytics FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics"
ON public.learning_analytics FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for learning_sessions
CREATE POLICY "Users can view their own sessions"
ON public.learning_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
ON public.learning_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.learning_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
ON public.learning_sessions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for user_learning_profile
CREATE POLICY "Users can view their own profile"
ON public.user_learning_profile FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.user_learning_profile FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.user_learning_profile FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.user_learning_profile FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to get admin learning insights
CREATE OR REPLACE FUNCTION public.get_admin_learning_insights()
RETURNS TABLE (
  total_students INTEGER,
  active_students_week INTEGER,
  avg_completion_rate NUMERIC,
  avg_time_per_course_hours NUMERIC,
  courses_with_data JSONB,
  difficult_modules JSONB,
  stagnant_users INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow admins
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(DISTINCT id)::INTEGER FROM profiles WHERE status = 'approved') as total_students,
    (SELECT COUNT(DISTINCT user_id)::INTEGER FROM learning_sessions WHERE session_date >= CURRENT_DATE - INTERVAL '7 days') as active_students_week,
    COALESCE((
      SELECT ROUND(AVG(
        CASE WHEN total_lessons > 0 THEN (completed_lessons::NUMERIC / total_lessons::NUMERIC) * 100 ELSE 0 END
      ), 1)
      FROM (
        SELECT 
          uc.user_id,
          uc.course_id,
          (SELECT COUNT(*) FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = uc.course_id AND l.is_active = true) as total_lessons,
          (SELECT COUNT(*) FROM user_progress up JOIN lessons l ON up.lesson_id = l.id JOIN modules m ON l.module_id = m.id WHERE up.user_id = uc.user_id AND m.course_id = uc.course_id AND up.completed = true) as completed_lessons
        FROM user_courses uc
      ) sub
    ), 0) as avg_completion_rate,
    COALESCE((
      SELECT ROUND(AVG(total_time_seconds::NUMERIC / 3600), 1)
      FROM (
        SELECT course_id, SUM(total_time_seconds) as total_time_seconds
        FROM learning_sessions
        GROUP BY course_id
      ) sub
    ), 0) as avg_time_per_course_hours,
    COALESCE((
      SELECT jsonb_agg(course_data)
      FROM (
        SELECT jsonb_build_object(
          'course_id', c.id,
          'title', c.title,
          'enrolled', (SELECT COUNT(*) FROM user_courses WHERE course_id = c.id),
          'completed', (SELECT COUNT(*) FROM user_courses WHERE course_id = c.id AND status = 'completed'),
          'avg_progress', COALESCE((SELECT ROUND(AVG(progress), 1) FROM user_courses WHERE course_id = c.id), 0)
        ) as course_data
        FROM courses c
        WHERE c.is_active = true
        LIMIT 10
      ) sub
    ), '[]'::jsonb) as courses_with_data,
    COALESCE((
      SELECT jsonb_agg(module_data)
      FROM (
        SELECT jsonb_build_object(
          'module_id', m.id,
          'title', m.title,
          'course_title', c.title,
          'avg_time_minutes', COALESCE(
            (SELECT ROUND(AVG(time_spent_seconds::NUMERIC / 60), 0) FROM learning_analytics WHERE module_id = m.id),
            0
          )
        ) as module_data
        FROM modules m
        JOIN courses c ON m.course_id = c.id
        WHERE m.is_active = true
        ORDER BY (SELECT AVG(time_spent_seconds) FROM learning_analytics WHERE module_id = m.id) DESC NULLS LAST
        LIMIT 5
      ) sub
    ), '[]'::jsonb) as difficult_modules,
    (
      SELECT COUNT(DISTINCT user_id)::INTEGER
      FROM user_learning_profile
      WHERE last_active_at < NOW() - INTERVAL '7 days'
    ) as stagnant_users;
END;
$$;

-- Create function to get student analytics
CREATE OR REPLACE FUNCTION public.get_student_analytics(_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_study_time_minutes INTEGER,
  this_week_minutes INTEGER,
  last_week_minutes INTEGER,
  avg_session_minutes INTEGER,
  current_streak INTEGER,
  longest_streak INTEGER,
  learning_pace TEXT,
  preferred_time TEXT,
  recent_activity JSONB,
  module_times JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  target_user_id := COALESCE(_user_id, auth.uid());
  
  -- Check access
  IF target_user_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE((SELECT SUM(total_time_seconds) / 60 FROM learning_sessions WHERE user_id = target_user_id), 0)::INTEGER as total_study_time_minutes,
    COALESCE((SELECT SUM(total_time_seconds) / 60 FROM learning_sessions WHERE user_id = target_user_id AND session_date >= CURRENT_DATE - INTERVAL '7 days'), 0)::INTEGER as this_week_minutes,
    COALESCE((SELECT SUM(total_time_seconds) / 60 FROM learning_sessions WHERE user_id = target_user_id AND session_date >= CURRENT_DATE - INTERVAL '14 days' AND session_date < CURRENT_DATE - INTERVAL '7 days'), 0)::INTEGER as last_week_minutes,
    COALESCE((SELECT ulp.avg_session_duration_minutes FROM user_learning_profile ulp WHERE ulp.user_id = target_user_id), 0)::INTEGER as avg_session_minutes,
    COALESCE((SELECT ulp.streak_days FROM user_learning_profile ulp WHERE ulp.user_id = target_user_id), 0)::INTEGER as current_streak,
    COALESCE((SELECT ulp.longest_streak FROM user_learning_profile ulp WHERE ulp.user_id = target_user_id), 0)::INTEGER as longest_streak,
    COALESCE((SELECT ulp.learning_pace FROM user_learning_profile ulp WHERE ulp.user_id = target_user_id), 'moderate') as learning_pace,
    COALESCE((SELECT ulp.preferred_time_slot FROM user_learning_profile ulp WHERE ulp.user_id = target_user_id), 'variable') as preferred_time,
    COALESCE((
      SELECT jsonb_agg(activity_data ORDER BY session_date DESC)
      FROM (
        SELECT jsonb_build_object(
          'date', session_date,
          'minutes', total_time_seconds / 60,
          'lessons', lessons_completed
        ) as activity_data, session_date
        FROM learning_sessions
        WHERE user_id = target_user_id
        ORDER BY session_date DESC
        LIMIT 14
      ) sub
    ), '[]'::jsonb) as recent_activity,
    COALESCE((
      SELECT jsonb_agg(module_time)
      FROM (
        SELECT jsonb_build_object(
          'module_id', m.id,
          'title', m.title,
          'time_minutes', COALESCE(SUM(la.time_spent_seconds) / 60, 0)
        ) as module_time
        FROM modules m
        LEFT JOIN learning_analytics la ON la.module_id = m.id AND la.user_id = target_user_id
        WHERE m.is_active = true
        GROUP BY m.id, m.title
        ORDER BY SUM(la.time_spent_seconds) DESC NULLS LAST
        LIMIT 5
      ) sub
    ), '[]'::jsonb) as module_times;
END;
$$;

-- Create trigger to update timestamps
CREATE TRIGGER update_learning_analytics_updated_at
BEFORE UPDATE ON public.learning_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_sessions_updated_at
BEFORE UPDATE ON public.learning_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_learning_profile_updated_at
BEFORE UPDATE ON public.user_learning_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();