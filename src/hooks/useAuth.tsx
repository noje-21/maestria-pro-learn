import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { getSmartRedirectPath } from '@/services/authRedirectService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, country?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({
        title: "Error de inicio de sesión",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
    toast({
      title: "Bienvenido",
      description: "Has iniciado sesión exitosamente",
    });
    
    // Redirección inteligente basada en inscripciones
    if (data.user) {
      const redirectPath = await getSmartRedirectPath(data.user.id);
      navigate(redirectPath);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, country?: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          country: country || "",
        },
      },
    });
    
    if (error) {
      // Si el usuario ya existe, mostrar mensaje más claro
      if (error.message.includes("already registered") || error.message.includes("User already registered")) {
        toast({
          title: "Correo ya registrado",
          description: "Este correo ya está registrado. Intenta iniciar sesión o recuperar tu contraseña.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error de registro",
          description: error.message,
          variant: "destructive",
        });
      }
      throw error;
    }

    // Check if user was created (not just returned existing)
    if (data.user && !data.user.identities?.length) {
      toast({
        title: "Correo ya registrado",
        description: "Este correo ya está registrado. Intenta iniciar sesión.",
        variant: "destructive",
      });
      throw new Error("User already exists");
    }

    toast({
      title: "Registro exitoso",
      description: "Bienvenido a MLCP",
    });
    
    // Usuarios nuevos van al catálogo de cursos
    navigate('/courses');
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};