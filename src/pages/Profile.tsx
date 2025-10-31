import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Mail, LogOut, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  // Datos de demostración
  const user = {
    name: "Juan Pérez",
    email: "juan@ejemplo.com",
    totalProgress: 44,
    completedLessons: 4,
    totalLessons: 9,
    certificates: 0,
  };

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
                  {user.name.charAt(0)}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre Completo</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={user.name}
                      className="pl-10 bg-background/50"
                      readOnly
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
                      value={user.email}
                      className="pl-10 bg-background/50"
                      readOnly
                    />
                  </div>
                </div>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => navigate("/")}
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
                      {user.totalProgress}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Clases Completadas
                    </span>
                    <span className="text-2xl font-bold text-secondary">
                      {user.completedLessons}/{user.totalLessons}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Certificados</span>
                    <span className="text-2xl font-bold text-primary">
                      {user.certificates}
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
                  profesional. Actualmente tienes {user.completedLessons} de{" "}
                  {user.totalLessons} clases completadas.
                </p>
                <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-border">
                  <p className="text-sm text-center text-muted-foreground">
                    No hay certificados disponibles aún
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
