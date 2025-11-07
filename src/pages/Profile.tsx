import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, User, Mail, LogOut, Award, Edit2, Save, X, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { profileUpdateSchema } from "@/lib/validations";

interface ProfileData {
  full_name: string;
  email: string;
  avatar_url?: string;
  country?: string;
}

interface ProgressStats {
  totalProgress: number;
  completedLessons: number;
  totalLessons: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    email: "",
    avatar_url: "",
    country: "",
  });
  const [stats, setStats] = useState<ProgressStats>({
    totalProgress: 0,
    completedLessons: 0,
    totalLessons: 0,
  });

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      // Load profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          email: profileData.email || user.email || "",
          avatar_url: profileData.avatar_url || "",
          country: profileData.country || "",
        });
      } else {
        // Fallback to user data
        setProfile({
          full_name: user.user_metadata?.full_name || "",
          email: user.email || "",
          avatar_url: "",
          country: user.user_metadata?.country || "",
        });
      }

      // Load progress stats
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('id')
        .eq('is_active', true);

      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true);

      const totalLessons = lessonsData?.length || 0;
      const completedLessons = progressData?.length || 0;
      const totalProgress = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      setStats({
        totalProgress,
        completedLessons,
        totalLessons,
      });

    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      // Validate input
      const validation = profileUpdateSchema.safeParse({
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        country: profile.country,
      });

      if (!validation.success) {
        toast({
          title: "Error de validación",
          description: validation.error.issues[0].message,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          country: profile.country,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Tus cambios se guardaron correctamente",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="glass-card p-8">
          <h1 className="text-4xl font-bold mb-8">Mi Perfil</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Profile Info */}
            <div className="space-y-6">
              <div className="flex justify-center md:justify-start">
                <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center text-4xl font-bold">
                  {profile.full_name ? getInitials(profile.full_name) : '?'}
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                {!editing ? (
                  <Button
                    onClick={() => setEditing(true)}
                    className="btn-gradient-primary gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSave}
                      className="btn-gradient-primary gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Guardar
                    </Button>
                    <Button
                      onClick={() => setEditing(false)}
                      variant="outline"
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre Completo</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="pl-10 bg-background/50"
                      readOnly={!editing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      className="pl-10 bg-background/50"
                      readOnly
                      disabled
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    El correo electrónico no se puede modificar
                  </p>
                </div>

                <div>
                  <Label htmlFor="country">País</Label>
                  <div className="relative mt-2">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="country"
                      value={profile.country || ""}
                      onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                      className="pl-10 bg-background/50"
                      readOnly={!editing}
                      placeholder="Tu país"
                    />
                  </div>
                </div>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4">Estadísticas</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Progreso Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {stats.totalProgress}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Clases Completadas
                    </span>
                    <span className="text-2xl font-bold text-secondary">
                      {stats.completedLessons}/{stats.totalLessons}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Certificados</span>
                    <span className="text-2xl font-bold text-primary">
                      {stats.totalProgress === 100 ? 1 : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold">Certificaciones</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Completa todos los módulos para obtener tu certificado
                  profesional. Actualmente tienes {stats.completedLessons} de{" "}
                  {stats.totalLessons} clases completadas.
                </p>
                {stats.totalProgress === 100 ? (
                  <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/30">
                    <p className="text-sm text-center text-success font-semibold mb-2">
                      ¡Felicitaciones! Has completado el curso
                    </p>
                    <Button
                      onClick={() => navigate('/certificate')}
                      className="w-full btn-gradient-primary"
                    >
                      Descargar Certificado
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-border">
                    <p className="text-sm text-center text-muted-foreground">
                      Completa todas las lecciones para obtener tu certificado
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
