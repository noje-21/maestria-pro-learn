-- Create lesson_videos table for multiple videos per lesson
CREATE TABLE public.lesson_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,
  title TEXT,
  order_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create lesson_materials table for multiple materials per lesson
CREATE TABLE public.lesson_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.lesson_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lesson_videos
CREATE POLICY "Authenticated users can view lesson videos"
ON public.lesson_videos
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage lesson videos"
ON public.lesson_videos
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for lesson_materials
CREATE POLICY "Authenticated users can view lesson materials"
ON public.lesson_materials
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage lesson materials"
ON public.lesson_materials
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing video URLs from lessons table to lesson_videos
INSERT INTO public.lesson_videos (lesson_id, video_url, title, order_number)
SELECT id, video_url, 'Video Principal', 1
FROM public.lessons
WHERE video_url IS NOT NULL AND video_url != '';

-- Create secure RPC function to mark lesson as viewed
CREATE OR REPLACE FUNCTION public.mark_lesson_viewed(_lesson_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _lesson_exists BOOLEAN;
  _lesson_is_active BOOLEAN;
BEGIN
  -- Get authenticated user
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Validate lesson exists and is active
  SELECT EXISTS(
    SELECT 1 FROM public.lessons WHERE id = _lesson_id
  ) INTO _lesson_exists;

  IF NOT _lesson_exists THEN
    RAISE EXCEPTION 'La lección no existe';
  END IF;

  SELECT is_active INTO _lesson_is_active
  FROM public.lessons
  WHERE id = _lesson_id;

  IF NOT _lesson_is_active THEN
    RAISE EXCEPTION 'La lección no está disponible';
  END IF;

  -- Mark lesson as viewed (not completed, awaiting exam)
  INSERT INTO public.user_progress (user_id, lesson_id, completed, completed_at)
  VALUES (_user_id, _lesson_id, false, NULL)
  ON CONFLICT (user_id, lesson_id) 
  DO UPDATE SET updated_at = now();

  -- Return success with lesson info
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Lección marcada como vista',
    'lesson_id', _lesson_id
  );
END;
$$;

-- Create function to get student progress for admin
CREATE OR REPLACE FUNCTION public.get_student_progress(_user_id UUID DEFAULT NULL)
RETURNS TABLE(
  user_id UUID,
  user_name TEXT,
  lesson_id UUID,
  lesson_title TEXT,
  module_title TEXT,
  course_title TEXT,
  completed BOOLEAN,
  completed_at TIMESTAMP WITH TIME ZONE,
  lesson_number INTEGER,
  module_number INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id as user_id,
    p.full_name as user_name,
    l.id as lesson_id,
    l.title as lesson_title,
    m.title as module_title,
    c.title as course_title,
    COALESCE(up.completed, false) as completed,
    up.completed_at,
    l.lesson_number,
    m.module_number
  FROM public.profiles p
  CROSS JOIN public.lessons l
  INNER JOIN public.modules m ON l.module_id = m.id
  INNER JOIN public.courses c ON m.course_id = c.id
  LEFT JOIN public.user_progress up ON up.user_id = p.id AND up.lesson_id = l.id
  WHERE 
    has_role(auth.uid(), 'admin'::app_role)
    AND l.is_active = true
    AND (_user_id IS NULL OR p.id = _user_id)
    AND p.status = 'approved'
  ORDER BY p.full_name, m.module_number, l.lesson_number;
$$;

-- Add indexes for performance
CREATE INDEX idx_lesson_videos_lesson_id ON public.lesson_videos(lesson_id);
CREATE INDEX idx_lesson_materials_lesson_id ON public.lesson_materials(lesson_id);
CREATE INDEX idx_user_progress_user_lesson ON public.user_progress(user_id, lesson_id);