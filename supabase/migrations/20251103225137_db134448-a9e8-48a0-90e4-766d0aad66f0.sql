-- Agregar columnas status y role a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student'));

-- Actualizar función handle_new_user para incluir status y role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, status, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.email,
    'pending',
    'student'
  );
  RETURN NEW;
END;
$$;

-- Actualizar el perfil del admin existente
UPDATE public.profiles 
SET status = 'approved', role = 'admin' 
WHERE email = 'admin@maestriapro.com';

-- Eliminar políticas existentes si existen y recrearlas
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Crear nuevas políticas RLS para acceso administrativo
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  role = 'admin' OR id = auth.uid()
);

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  role = 'admin' OR id = auth.uid()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);