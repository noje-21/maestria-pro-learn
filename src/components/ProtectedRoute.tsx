import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (user && !loading) {
      checkUserStatus();
    }
  }, [user, loading]);

  const checkUserStatus = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfileStatus(profile?.status || null);
      
      if (profile?.status !== 'approved') {
        toast({
          title: "Acceso pendiente",
          description: "Tu solicitud está pendiente de aprobación por el equipo administrativo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  if (loading || checkingStatus) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profileStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="glass-card p-8 max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
            <span className="text-4xl">⏳</span>
          </div>
          <h2 className="text-2xl font-bold">Pendiente de Aprobación</h2>
          <p className="text-muted-foreground">
            Tu solicitud está siendo revisada por el equipo administrativo. 
            Recibirás un correo cuando tu cuenta sea aprobada.
          </p>
          <Navigate to="/auth" replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;