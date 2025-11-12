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
import SimposioRegistrations from "@/components/admin/SimposioRegistrations";
import { ModuleVisibilityManager } from "@/components/admin/ModuleVisibilityManager";
import { LessonImageManager } from "@/components/admin/LessonImageManager";
import { ExamQuestionsManager } from "@/components/admin/ExamQuestionsManager";
import { ModuleLessonManager } from "@/components/admin/ModuleLessonManager";
import { UserManagement } from "@/components/admin/UserManagement";

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
          <p className="text-foreground font-medium">Cargando panel administrativo...</p>
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
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gestiona usuarios, módulos y exámenes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6 border-primary/20 shadow-lg hover:shadow-glow transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Total Usuarios</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{stats.totalUsers}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-yellow-500/20 shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Pendientes</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-500">{stats.pendingUsers}</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-success/20 shadow-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Aprobados</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-success">{stats.approvedUsers}</p>
              </div>
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-secondary/20 shadow-lg hover:shadow-glow-secondary transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Rechazados</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary">{stats.rejectedUsers}</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/10">
                <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-4">
            <TabsList className="inline-flex w-full min-w-max sm:grid sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-12 gap-1">
              <TabsTrigger value="users" className="text-xs sm:text-sm whitespace-nowrap">
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm whitespace-nowrap">
                Pendientes
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-xs sm:text-sm whitespace-nowrap">
                Aprobados
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs sm:text-sm whitespace-nowrap">
                Rechazados
              </TabsTrigger>
              <TabsTrigger value="modules" className="text-xs sm:text-sm whitespace-nowrap">
                Módulos
              </TabsTrigger>
              <TabsTrigger value="videos" className="text-xs sm:text-sm whitespace-nowrap">
                Videos
              </TabsTrigger>
              <TabsTrigger value="materials" className="text-xs sm:text-sm whitespace-nowrap">
                Materiales
              </TabsTrigger>
              <TabsTrigger value="images" className="text-xs sm:text-sm whitespace-nowrap">
                Imágenes
              </TabsTrigger>
              <TabsTrigger value="exams" className="text-xs sm:text-sm whitespace-nowrap">
                Exámenes
              </TabsTrigger>
              <TabsTrigger value="progress" className="text-xs sm:text-sm whitespace-nowrap">
                Progreso
              </TabsTrigger>
              <TabsTrigger value="visibility" className="text-xs sm:text-sm whitespace-nowrap">
                Visibilidad
              </TabsTrigger>
              <TabsTrigger value="simposio" className="text-xs sm:text-sm whitespace-nowrap">
                Simposio
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="pending" className="space-y-3 sm:space-y-4">
            {pendingProfiles.length === 0 ? (
              <Card className="p-6 sm:p-8 text-center">
                <p className="text-sm sm:text-base text-muted-foreground">No hay usuarios pendientes</p>
              </Card>
            ) : (
              pendingProfiles.map((profile) => (
                <Card key={profile.id} className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold break-words">{profile.full_name || 'Sin nombre'}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Registrado: {new Date(profile.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        onClick={() => updateUserStatus(profile.id, 'approved')}
                        className="btn-gradient-primary flex-1 sm:flex-initial text-xs sm:text-sm"
                        size="sm"
                      >
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Aprobar
                      </Button>
                      <Button
                        onClick={() => updateUserStatus(profile.id, 'rejected')}
                        variant="destructive"
                        className="flex-1 sm:flex-initial text-xs sm:text-sm"
                        size="sm"
                      >
                        <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-3 sm:space-y-4">
            {approvedProfiles.length === 0 ? (
              <Card className="p-6 sm:p-8 text-center">
                <p className="text-sm sm:text-base text-muted-foreground">No hay usuarios aprobados</p>
              </Card>
            ) : (
              approvedProfiles.map((profile) => (
                <Card key={profile.id} className="p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold break-words">{profile.full_name || 'Sin nombre'}</h3>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      <span className="text-xs sm:text-sm text-green-500">Aprobado</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-3 sm:space-y-4">
            {rejectedProfiles.length === 0 ? (
              <Card className="p-6 sm:p-8 text-center">
                <p className="text-sm sm:text-base text-muted-foreground">No hay usuarios rechazados</p>
              </Card>
            ) : (
              rejectedProfiles.map((profile) => (
                <Card key={profile.id} className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold break-words">{profile.full_name || 'Sin nombre'}</h3>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 shrink-0" />
                      <span className="text-xs sm:text-sm text-red-500">Rechazado</span>
                      <Button
                        onClick={() => updateUserStatus(profile.id, 'approved')}
                        variant="outline"
                        size="sm"
                        className="ml-auto text-xs sm:text-sm"
                      >
                        Aprobar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="modules">
            <ModuleLessonManager />
          </TabsContent>

          <TabsContent value="videos">
            <LessonVideosManager />
          </TabsContent>

          <TabsContent value="materials">
            <LessonMaterialsManager />
          </TabsContent>

          <TabsContent value="images">
            <LessonImageManager />
          </TabsContent>

          <TabsContent value="exams">
            <ExamQuestionsManager />
          </TabsContent>

          <TabsContent value="progress">
            <StudentProgressView />
          </TabsContent>

          <TabsContent value="visibility">
            <ModuleVisibilityManager />
          </TabsContent>

          <TabsContent value="simposio">
            <SimposioRegistrations />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
