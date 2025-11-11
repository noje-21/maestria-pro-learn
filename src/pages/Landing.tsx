import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Award,
  Users2,
  Calendar,
  MapPin,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoMlcp from "@/assets/logo-mlcp.jpg";
import EventCarousel from "@/components/EventCarousel";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Glow Effect Background */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoMlcp} alt="MLCP Logo" className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover" />
            <span className="text-lg md:text-2xl font-black gradient-text">MCP</span>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/auth")}
            className="border-primary/50 hover:bg-primary/10 text-xs md:text-sm"
          >
            Iniciar Sesión
          </Button>
        </div>
      </nav>

      {/* Event Carousel - Full Screen */}
      <section
        className={`
          relative z-10 w-full 
          flex justify-center items-center 
          bg-background/30 backdrop-blur-sm border-b border-border overflow-hidden
          ${window.innerWidth < 640 ? "py-2" : "py-16 sm:py-20 md:py-28"}
        `}
      >
        <div
          className={`
            transition-all duration-500 ease-in-out shadow-2xl overflow-hidden
            ${
              window.innerWidth < 640
                ? "w-[96%] h-[90dvh] mx-auto rounded-xl bg-black"
                : "w-[90%] sm:w-[70%] md:w-[70%] lg:w-[55%] aspect-[16/9] rounded-2xl bg-white"
            }
          `}
        >
          <EventCarousel />
        </div>

        {/* Indicador para desplazarse hacia abajo */}
        {window.innerWidth >= 640 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground animate-bounce">
            <ArrowRight className="rotate-90 h-6 w-6" />
          </div>
        )}
      </section>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-16 md:py-28 text-center">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight">
            Maestría Latinoamericana en <span className="gradient-text">Circulación Pulmonar</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Formación intensiva teórico-práctica con modalidad MEET UP, junto a los expertos más representativos en
            hipertensión pulmonar de la región.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              className="btn-gradient-primary px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
              onClick={() => navigate("/auth")}
            >
              Acceder al Campus
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Badge Section */}
      <section className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary">
            <Award className="h-4 w-4" />
            <span>Único en Latinoamérica</span>
          </div>
        </div>
      </section>

      {/* About Program Section */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <div className="glass-card p-6 sm:p-8 md:p-12 max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Modalidad del Programa</h2>
            <div className="w-20 h-1 bg-gradient-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
              <p className="text-muted-foreground text-sm">Centros de referencia con entrenamiento hands-on</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <p className="text-base md:text-lg leading-relaxed">
              El Campus Virtual MLCP es único en Latinoamérica, combinando teoría y práctica con modalidad MEET UP.
              Aprenderás con entrenamiento en:
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 text-muted-foreground">
              {[
                "Ecocardiografía avanzada",
                "Capilaroscopia",
                "Cateterismo cardíaco derecho",
                "Enfermedad intersticial pulmonar",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: <BookOpen className="h-6 w-6 text-primary" />,
              title: "28 Módulos Especializados",
              text: "Desde fundamentos hasta tratamientos de vanguardia, cubriendo todos los aspectos de la hipertensión pulmonar.",
            },
            {
              icon: <Users2 className="h-6 w-6 text-secondary" />,
              title: "Expertos Regionales",
              text: "Aprende directamente de los referentes más destacados en circulación pulmonar de Latinoamérica.",
            },
            {
              icon: <Award className="h-6 w-6 text-primary" />,
              title: "Certificación Profesional",
              text: "Obtén tu certificado avalado por los líderes en el manejo de hipertensión pulmonar.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-card p-8 space-y-4 animate-slide-up"
              style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">{item.icon}</div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <div className="glass-card p-8 sm:p-12 max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">¿Listo para transformar tu práctica clínica?</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Únete al programa que está formando a los especialistas en circulación pulmonar del futuro.
          </p>
          <Button size="lg" className="btn-gradient-primary px-8 py-6 text-lg" onClick={() => navigate("/auth")}>
            Acceder al Campus Virtual
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-10 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-6 max-w-2xl mx-auto">
            <img src={logoMlcp} alt="MLCP Logo" className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover" />

            <div className="text-center space-y-2">
              <p className="text-sm font-bold text-foreground">Powered by:</p>
              <p className="text-base md:text-lg font-semibold text-foreground">
                Maestría Latinoamericana en Circulación Pulmonar
              </p>
            </div>

            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>
                Correo:{" "}
                <a href="mailto:magisterenhipertensionpulmonar@gmail.com" className="text-primary hover:underline">
                  magisterenhipertensionpulmonar@gmail.com
                </a>
              </p>
              <p>
                Sitio web:{" "}
                <a
                  href="https://www.maestriacp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.maestriacp.com
                </a>
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://www.instagram.com/magisterencirculacionpulmonar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-110"
              >
                <Instagram className="h-5 w-5 text-primary" />
              </a>
              <a
                href="https://www.facebook.com/share/1K5djkRfr8"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-110"
              >
                <Facebook className="h-5 w-5 text-primary" />
              </a>
              <a
                href="https://www.linkedin.com/in/hipertension-pulmonar-655a43253"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-110"
              >
                <Linkedin className="h-5 w-5 text-primary" />
              </a>
            </div>

            <div className="border-t border-border w-full pt-4">
              <p className="text-center text-xs text-muted-foreground">
                © 2025 Maestría Latinoamericana en Circulación Pulmonar. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
