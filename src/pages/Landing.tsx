import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ChevronDown,
  Play,
  CheckCircle2,
  Globe,
  Heart,
  Stethoscope,
  Microscope,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logoMlcp from "@/assets/logo-mlcp.jpg";
import EventCarousel from "@/components/EventCarousel";

const Landing = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logoMlcp} 
              alt="MLCP Logo" 
              className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover ring-2 ring-primary/20" 
            />
            <div className="hidden sm:block">
              <span className="text-lg md:text-xl font-bold gradient-text">MCP</span>
              <p className="text-xs text-muted-foreground -mt-1">Campus Virtual</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("about")}
              className="hidden md:inline-flex"
            >
              Programa
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("features")}
              className="hidden md:inline-flex"
            >
              Características
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              className="btn-gradient-primary"
            >
              <span className="hidden sm:inline">Iniciar Sesión</span>
              <span className="sm:hidden">Ingresar</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 md:pt-24">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              <Badge 
                variant="secondary" 
                className="mb-4 bg-primary/10 text-primary border-primary/20"
              >
                <Award className="h-3 w-3 mr-1" />
                Único en Latinoamérica
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                Maestría en{" "}
                <span className="gradient-text">Circulación Pulmonar</span>
              </h1>
              
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
                Formación intensiva teórico-práctica con los expertos más representativos 
                en hipertensión pulmonar de América Latina. Modalidad MEET UP presencial.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="btn-gradient-primary gap-2"
                >
                  Acceder al Campus
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection("about")}
                  className="gap-2"
                >
                  Conocer más
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-8 pt-8 border-t border-border/50">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">28+</p>
                  <p className="text-xs text-muted-foreground">Módulos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">15+</p>
                  <p className="text-xs text-muted-foreground">Expertos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">12</p>
                  <p className="text-xs text-muted-foreground">Países</p>
                </div>
              </div>
            </motion.div>

            {/* Right - Event Carousel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/30">
                <EventCarousel />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What is section */}
      <section id="about" className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <Badge variant="secondary" className="mb-4">
              <Stethoscope className="h-3 w-3 mr-1" />
              ¿Qué es la MCP?
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              La Maestría Latinoamericana en Circulación Pulmonar
            </h2>
            <p className="text-muted-foreground">
              Es un programa educativo único diseñado para médicos especialistas que buscan 
              profundizar sus conocimientos en hipertensión pulmonar y enfermedades relacionadas.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Globe,
                title: "Alcance Regional",
                description: "Programa diseñado específicamente para las necesidades y contexto de América Latina, con instructores de 12 países.",
              },
              {
                icon: Heart,
                title: "Enfoque Práctico",
                description: "Modalidad MEET UP con rotaciones prácticas en centros de referencia y entrenamiento hands-on.",
              },
              {
                icon: Microscope,
                title: "Evidencia Actual",
                description: "Contenido actualizado basado en las últimas investigaciones y guías clínicas internacionales.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-border/50 bg-card/50">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-4">
                <Users2 className="h-3 w-3 mr-1" />
                ¿A quién va dirigido?
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
                Diseñado para profesionales comprometidos
              </h2>
              <p className="text-muted-foreground mb-8">
                El programa está orientado a médicos especialistas que desean 
                convertirse en referentes en el manejo de la hipertensión pulmonar.
              </p>

              <div className="space-y-4">
                {[
                  "Cardiólogos y neumólogos",
                  "Médicos internistas con enfoque cardiovascular",
                  "Intensivistas y especialistas en cuidados críticos",
                  "Reumatólogos interesados en hipertensión pulmonar",
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="text-sm font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Duración</h4>
                      <p className="text-sm text-muted-foreground">
                        3 al 15 de noviembre - Régimen intensivo
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-secondary/10">
                      <Users2 className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Formato MEET UP</h4>
                      <p className="text-sm text-muted-foreground">
                        Presencial con expertos de la región
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Rotaciones Prácticas</h4>
                      <p className="text-sm text-muted-foreground">
                        Centros de referencia con entrenamiento hands-on
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <Badge variant="secondary" className="mb-4">
              <Activity className="h-3 w-3 mr-1" />
              ¿Qué nos hace diferentes?
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Una experiencia educativa premium
            </h2>
            <p className="text-muted-foreground">
              Combinamos la mejor educación teórica con experiencia práctica directa
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: BookOpen,
                title: "28 Módulos Especializados",
                description: "Desde fundamentos hasta tratamientos de vanguardia en hipertensión pulmonar.",
                color: "bg-primary/10 text-primary",
              },
              {
                icon: Users2,
                title: "Expertos Regionales",
                description: "Aprende directamente de los referentes más destacados de Latinoamérica.",
                color: "bg-secondary/10 text-secondary",
              },
              {
                icon: Award,
                title: "Certificación Profesional",
                description: "Certificado avalado por los líderes en manejo de hipertensión pulmonar.",
                color: "bg-emerald-500/10 text-emerald-500",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-all group border-border/50 bg-card/50 hover:border-primary/30">
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Learning areas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <Card className="p-6 md:p-8 bg-card/50 border-border/50">
              <h3 className="text-lg font-semibold mb-6 text-center">Áreas de Entrenamiento</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Ecocardiografía avanzada",
                  "Capilaroscopia",
                  "Cateterismo cardíaco derecho",
                  "Enfermedad intersticial pulmonar",
                  "Manejo farmacológico específico",
                  "Casos clínicos complejos",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <Badge variant="secondary" className="mb-4">
              <Play className="h-3 w-3 mr-1" />
              ¿Cómo funciona?
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Tu camino hacia la especialización
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Registro", desc: "Crea tu cuenta en el campus virtual" },
              { step: "2", title: "Acceso", desc: "Explora los módulos y materiales" },
              { step: "3", title: "Aprende", desc: "Completa las lecciones a tu ritmo" },
              { step: "4", title: "Certifícate", desc: "Obtén tu certificación profesional" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                  {item.step}
                </div>
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              <GraduationCap className="h-3 w-3 mr-1" />
              Respaldo Institucional
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Avalado por expertos de toda la región
            </h2>
            <p className="text-muted-foreground mb-8">
              Un programa respaldado por la comunidad médica especializada en 
              hipertensión pulmonar de Latinoamérica.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {["Argentina", "Brasil", "Chile", "Colombia", "México", "Perú"].map((country) => (
                <Badge 
                  key={country} 
                  variant="outline" 
                  className="px-4 py-2"
                >
                  {country}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8 md:p-12 max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Transforma tu práctica médica
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Únete al programa que está formando a los especialistas en 
                circulación pulmonar del futuro.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="btn-gradient-primary gap-2"
              >
                Acceder al Campus Virtual
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-6 max-w-2xl mx-auto">
            <img 
              src={logoMlcp} 
              alt="MLCP Logo" 
              className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20" 
            />

            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">
                Maestría Latinoamericana en Circulación Pulmonar
              </p>
              <p className="text-sm text-muted-foreground">
                Campus Virtual MCP
              </p>
            </div>

            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>
                <a 
                  href="mailto:magisterenhipertensionpulmonar@gmail.com" 
                  className="text-primary hover:underline"
                >
                  magisterenhipertensionpulmonar@gmail.com
                </a>
              </p>
              <p>
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

            <div className="flex items-center gap-4">
              {[
                { icon: Instagram, href: "https://www.instagram.com/magisterencirculacionpulmonar" },
                { icon: Facebook, href: "https://www.facebook.com/share/1K5djkRfr8" },
                { icon: Linkedin, href: "https://www.linkedin.com/in/hipertension-pulmonar-655a43253" },
              ].map(({ icon: Icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-110"
                >
                  <Icon className="h-5 w-5 text-primary" />
                </a>
              ))}
            </div>

            <div className="border-t border-border w-full pt-6">
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
