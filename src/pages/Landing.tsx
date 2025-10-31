import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap, Award, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Glow Effect Background */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-border backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">MaestríaPro</span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/auth")}
            className="border-primary/50 hover:bg-primary/10"
          >
            Iniciar Sesión
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary">
            <Award className="h-4 w-4" />
            <span>Plataforma Educativa de Última Generación</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Transforma tu <span className="gradient-text">Carrera Profesional</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Aprende a tu ritmo con nuestra plataforma educativa de clase mundial. 
            Desbloquea módulos progresivamente y obtén tu certificación profesional.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg"
              className="btn-gradient-primary px-8 py-6 text-lg"
              onClick={() => navigate("/auth")}
            >
              Comenzar Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg border-border hover:bg-card"
              onClick={() => navigate("/auth")}
            >
              Explorar Cursos
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="glass-card p-8 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Aprendizaje Progresivo</h3>
            <p className="text-muted-foreground">
              Desbloquea clases secuencialmente a medida que completas módulos y apruebas exámenes.
            </p>
          </div>

          <div className="glass-card p-8 space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold">Sistema de Evaluación</h3>
            <p className="text-muted-foreground">
              Examenes diseñados para garantizar tu comprensión antes de avanzar al siguiente nivel.
            </p>
          </div>

          <div className="glass-card p-8 space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Certificación Profesional</h3>
            <p className="text-muted-foreground">
              Obtén tu certificado al finalizar todos los módulos y demuestra tus habilidades.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="glass-card p-12 max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            ¿Listo para comenzar tu transformación?
          </h2>
          <p className="text-xl text-muted-foreground">
            Únete a miles de estudiantes que ya están construyendo su futuro profesional.
          </p>
          <Button 
            size="lg"
            className="btn-gradient-primary px-8 py-6 text-lg"
            onClick={() => navigate("/auth")}
          >
            Registrarse Gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 MaestríaPro. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
