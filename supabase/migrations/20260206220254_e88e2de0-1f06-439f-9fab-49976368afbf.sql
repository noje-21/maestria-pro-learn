-- Tabla para leads/preinscripciones
CREATE TABLE IF NOT EXISTS public.enrollment_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  specialty TEXT NOT NULL,
  phone TEXT,
  course_id UUID REFERENCES public.courses(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'paid', 'enrolled', 'cancelled')),
  stripe_customer_id TEXT,
  stripe_session_id TEXT,
  payment_completed_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enrollment_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view/manage all leads
CREATE POLICY "Admins can manage all enrollment leads"
ON public.enrollment_leads
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Anyone can insert a lead (public signup)
CREATE POLICY "Anyone can create enrollment lead"
ON public.enrollment_leads
FOR INSERT
WITH CHECK (true);

-- Policy: Users can view their own lead by email match
CREATE POLICY "Users can view their own lead"
ON public.enrollment_leads
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  email = (SELECT p.email FROM profiles p WHERE p.id = auth.uid())
);

-- Index for faster lookups
CREATE INDEX idx_enrollment_leads_email ON public.enrollment_leads(email);
CREATE INDEX idx_enrollment_leads_status ON public.enrollment_leads(status);
CREATE INDEX idx_enrollment_leads_stripe_session ON public.enrollment_leads(stripe_session_id);

-- Trigger for updated_at
CREATE TRIGGER update_enrollment_leads_updated_at
BEFORE UPDATE ON public.enrollment_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();