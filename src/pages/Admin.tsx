import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users, BookOpen, FileQuestion, CheckCircle, XCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonVideosManager } from "@/components/admin/LessonVideosManager";
import { LessonMaterialsManager } from "@/components/admin/LessonMaterialsManager";
import { StudentProgressView } from "@/components/admin/StudentProgressView";

interface Profile {
  id: string;
  full_name: string | null;
  status: string;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    approvedUsers: 0,
    rejectedUsers: 0,
  });

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      // Use server-side RPC function for admin verification
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('verify_admin_access');

      if (adminError) throw adminError;

      // Check if user is approved
      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', user.id)
        .single();

      if (!isAdmin || profile?.status !== 'approved') {
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos de administrador",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      loadProfiles();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate("/dashboard");
    }
  };

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_list_for_admin');

      if (error) throw error;

      setProfiles(data || []);
      
      const stats = {
        totalUsers: data?.length || 0,
        pendingUsers: data?.filter(p => p.status === 'pending').length || 0,
        approvedUsers: data?.filter(p => p.status === 'approved').length || 0,
        rejectedUsers: data?.filter(p => p.status === 'rejected').length || 0,
      };
      
      setStats(stats);
    } catch (error: any) {
      console.error('Error loading profiles:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `Usuario ${newStatus === 'approved' ? 'aprobado' : 'rechazado'} correctamente`,
      });

      loadProfiles();
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del usuario",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando panel administrativo...</p>
        </div>
      </div>
    );
  }

  const pendingProfiles = profiles.filter(p => p.status === 'pending');
  const approvedProfiles = profiles.filter(p => p.status === 'approved');
  const rejectedProfiles = profiles.filter(p => p.status === 'rejected');

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona usuarios, módulos y exámenes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Usuarios</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-500">{stats.pendingUsers}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprobados</p>
                <p className="text-3xl font-bold text-green-500">{stats.approvedUsers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rechazados</p>
                <p className="text-3xl font-bold text-red-500">{stats.rejectedUsers}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="pending">
              Pendientes ({pendingProfiles.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Aprobados ({approvedProfiles.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rechazados ({rejectedProfiles.length})
            </TabsTrigger>
            <TabsTrigger value="videos">
              Videos
            </TabsTrigger>
            <TabsTrigger value="materials">
              Materiales
            </TabsTrigger>
            <TabsTrigger value="progress">
              Progreso
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingProfiles.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No hay usuarios pendientes</p>
              </Card>
            ) : (
              pendingProfiles.map((profile) => (
                <Card key={profile.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{profile.full_name || 'Sin nombre'}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Registrado: {new Date(profile.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateUserStatus(profile.id, 'approved')}
                        className="btn-gradient-primary"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobar
                      </Button>
                      <Button
                        onClick={() => updateUserStatus(profile.id, 'rejected')}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedProfiles.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No hay usuarios aprobados</p>
              </Card>
            ) : (
              approvedProfiles.map((profile) => (
                <Card key={profile.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{profile.full_name || 'Sin nombre'}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-500">Aprobado</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedProfiles.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No hay usuarios rechazados</p>
              </Card>
            ) : (
              rejectedProfiles.map((profile) => (
                <Card key={profile.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{profile.full_name || 'Sin nombre'}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-sm text-red-500">Rechazado</span>
                      <Button
                        onClick={() => updateUserStatus(profile.id, 'approved')}
                        variant="outline"
                        size="sm"
                      >
                        Aprobar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="videos">
            <LessonVideosManager />
          </TabsContent>

          <TabsContent value="materials">
            <LessonMaterialsManager />
          </TabsContent>

          <TabsContent value="progress">
            <StudentProgressView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
