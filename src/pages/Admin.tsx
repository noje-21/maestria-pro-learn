import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Layout
import { AdminLayout } from "@/layouts/AdminLayout";

// Views
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";
import { UserManagementView } from "@/components/admin/UserManagementView";
import { CoursesManagerView } from "@/components/admin/CoursesManagerView";
import { LessonVideosManager } from "@/components/admin/LessonVideosManager";
import { LessonMaterialsManager } from "@/components/admin/LessonMaterialsManager";
import { StudentProgressView } from "@/components/admin/StudentProgressView";
import SimposioRegistrations from "@/components/admin/SimposioRegistrations";
import { ModuleVisibilityManager } from "@/components/admin/ModuleVisibilityManager";
import { LessonImageManager } from "@/components/admin/LessonImageManager";
import { ExamQuestionsManager } from "@/components/admin/ExamQuestionsManager";
import { ModuleLessonManager } from "@/components/admin/ModuleLessonManager";
import { LearningAnalytics } from "@/components/admin/LearningAnalytics";

// Loading skeleton
import { Skeleton } from "@/components/ui/skeleton";

const Admin = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  // Sync URL with tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

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

      setLoading(false);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground font-medium">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardView onNavigate={handleTabChange} />;
      case 'courses':
        return <CoursesManagerView />;
      case 'users':
        return <UserManagementView />;
      case 'modules':
        return <ModuleLessonManager />;
      case 'videos':
        return <LessonVideosManager />;
      case 'materials':
        return <LessonMaterialsManager />;
      case 'images':
        return <LessonImageManager />;
      case 'exams':
        return <ExamQuestionsManager />;
      case 'progress':
        return <StudentProgressView />;
      case 'analytics':
        return <LearningAnalytics />;
      case 'visibility':
        return <ModuleVisibilityManager />;
      case 'simposio':
        return <SimposioRegistrations />;
      default:
        return <AdminDashboardView onNavigate={handleTabChange} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderContent()}
    </AdminLayout>
  );
};

export default Admin;
