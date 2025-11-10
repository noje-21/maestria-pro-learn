import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap, Award, Users2, Calendar, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import simposioImage from "@/assets/simposio-2025.jpg";
import logoMlcp from "@/assets/logo-mlcp.jpg";
const Landing = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Glow Effect Background */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoMlcp} alt="MLCP Logo" className="h-14 w-14 md:h-16 md:w-16 rounded-full object-cover" />
            <span className="text-xl md:text-2xl font-black gradient-text">MCP</span>
          </div>
          <Button variant="outline" onClick={() => navigate("/auth")} className="border-primary/50 hover:bg-primary/10 text-xs md:text-sm">
            Iniciar Sesión
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary">
            <Award className="h-4 w-4" />
            <span>Único en Latinoamérica</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight">
            Maestría Latinoamericana en <span className="gradient-text">Circulación Pulmonar</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Formación intensiva teórico-práctica con modalidad MEET UP, junto a los expertos más representativos en
            hipertensión pulmonar de la región.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" className="btn-gradient-primary px-8 py-6 text-lg" onClick={() => navigate("/auth")}>
              Acceder al Campus
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* About Program Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="glass-card p-8 md:p-12 max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Modalidad del Programa</h2>
            <div className="w-20 h-1 bg-gradient-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Duración</h3>
              <p className="text-muted-foreground text-sm">
                Del 3 al 15 de noviembre - Régimen intensivo teórico-práctico
              </p>
            </div>

            <div className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mx-auto">
                <Users2 className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-bold">Formato MEET UP</h3>
              <p className="text-muted-foreground text-sm">
                Modalidad personalizada con los expertos más representativos de la región
              </p>
            </div>

            <div className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Rotaciones Prácticas</h3>
              <p className="text-muted-foreground text-sm">
                Centros de referencia en la patología con entrenamiento hands-on
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <p className="text-lg leading-relaxed">
              El Campus Virtual MLCP es único en Latinoamérica, combinando teoría y práctica con modalidad MEET UP.
              Aprenderás cada grupo de HTP con entrenamiento en:
            </p>
            <ul className="grid md:grid-cols-2 gap-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Ecocardiografía avanzada
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Capilaroscopia
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Cateterismo cardíaco derecho
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Enfermedad intersticial pulmonar
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="glass-card p-8 space-y-4 animate-slide-up" style={{
          animationDelay: "0.1s"
        }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">28 Módulos Especializados</h3>
            <p className="text-muted-foreground">
              Desde fundamentos hasta tratamientos de vanguardia, cubriendo todos los aspectos de la hipertensión
              pulmonar.
            </p>
          </div>

          <div className="glass-card p-8 space-y-4 animate-slide-up" style={{
          animationDelay: "0.2s"
        }}>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Users2 className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold">Expertos Regionales</h3>
            <p className="text-muted-foreground">
              Aprende directamente de los referentes más destacados en circulación pulmonar de Latinoamérica.
            </p>
          </div>

          <div className="glass-card p-8 space-y-4 animate-slide-up" style={{
          animationDelay: "0.3s"
        }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Certificación Profesional</h3>
            <p className="text-muted-foreground">
              Obtén tu certificado avalado por los líderes en el manejo de hipertensión pulmonar.
            </p>
          </div>
        </div>
      </section>

      {/* Simposio Section */}
      <section className="relative z-10 container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <img src={simposioImage} alt="4to Simposio Latinoamericano de Hipertensión Pulmonar" className="w-full rounded-2xl shadow-md" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="glass-card p-12 max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">¿Listo para transformar tu práctica clínica?</h2>
          <p className="text-xl text-muted-foreground">
            Únete a al simposio que está formando a los especialistas en circulación pulmonar del futuro.
          </p>
          <Button size="lg" className="btn-gradient-primary px-8 py-6 text-lg" onClick={() => navigate("/simposio")}>
            Registro para el Simposio
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-6 max-w-2xl mx-auto">
            {/* Logo */}
            <img src={logoMlcp} alt="MLCP Logo" className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover" />
            
            {/* Powered by text */}
            <div className="text-center space-y-2">
              <p className="text-sm font-bold text-foreground">Powered by:</p>
              <p className="text-base md:text-lg font-semibold text-foreground">
                Maestría Latinoamericana en Circulación Pulmonar
              </p>
            </div>

            {/* Contact info */}
            <div className="text-center space-y-1 text-sm text-muted-foreground">
              <p>Correo: <a href="mailto:magisterenhipertensionpulmonar@gmail.com" className="text-primary hover:underline">magisterenhipertensionpulmonar@gmail.com</a></p>
              <p>Sitio web: <a href="https://www.maestriacp.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.maestriacp.com</a></p>
            </div>

            {/* Social media icons */}
            <div className="flex items-center gap-4 pt-2">
              <a href="https://www.instagram.com/magisterencirculacionpulmonar?igsh=MW82b2YzdGo2ajcxdA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-110">
                <Instagram className="h-5 w-5 text-primary" />
              </a>
              <a href="https://www.facebook.com/share/1K5djkRfr8/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-110">
                <Facebook className="h-5 w-5 text-primary" />
              </a>
              <a href="https://www.linkedin.com/in/hipertension-pulmonar-655a43253?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-110">
                <Linkedin className="h-5 w-5 text-primary" />
              </a>
            </div>

            {/* Copyright */}
            <div className="border-t border-border w-full pt-6 mt-4">
              <p className="text-center text-xs text-muted-foreground">
                © 2025 Maestría Latinoamericana en Circulación Pulmonar. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Landing;