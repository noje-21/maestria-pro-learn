import { Button } from "@/components/ui/button";
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
  CheckCircle2,
  Heart,
  Stethoscope,
  Activity,
  Target,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logoMlcp from "@/assets/logo-mlcp.jpg";
import EventCarousel from "@/components/EventCarousel";
import { ClinicalCard, ClinicalCardHeader, ClinicalCardTitle, ClinicalCardDescription } from "@/components/ui/clinical-card";

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
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={logoMlcp} 
                alt="MLCP" 
                className="h-10 w-10 md:h-11 md:w-11 rounded-full object-cover ring-2 ring-primary/20" 
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold">Campus <span className="gradient-text">MCP</span></span>
              <p className="text-[11px] text-muted-foreground -mt-0.5 tracking-wide">Circulación Pulmonar</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("about")}
              className="hidden md:inline-flex text-muted-foreground hover:text-foreground"
            >
              Programa
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("features")}
              className="hidden md:inline-flex text-muted-foreground hover:text-foreground"
            >
              Metodología
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              className="btn-gradient-primary h-9 px-5"
            >
              <span className="hidden sm:inline">Acceder al Campus</span>
              <span className="sm:hidden">Acceder</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Concepto potente */}
      <section className="relative pt-24 md:pt-28 min-h-[90vh] flex items-center">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left - Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              <Badge 
                variant="secondary" 
                className="mb-5 bg-primary/10 text-primary border-primary/20 px-4 py-1.5"
              >
                <Target className="h-3 w-3 mr-1.5" />
                Único en Latinoamérica
              </Badge>
              
              {/* Headline con concepto */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black leading-[1.1] mb-6">
                Donde la excelencia{" "}
                <span className="relative">
                  <span className="gradient-text">médica</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/0" />
                </span>
                {" "}se forma
              </h1>
              
              {/* Subtexto - El "por qué" */}
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                La Maestría Latinoamericana en Circulación Pulmonar reúne a los especialistas 
                más destacados de la región para transformar el manejo de la hipertensión pulmonar.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="btn-gradient-primary gap-2 h-12 px-6 text-base"
                >
                  Acceder al Campus
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection("about")}
                  className="gap-2 h-12 border-border/60 hover:bg-muted/30"
                >
                  Conocer el programa
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Trust indicators - Diseño refinado */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-6 border-t border-border/40">
                {[
                  { value: "28", label: "Módulos", suffix: "+" },
                  { value: "15", label: "Expertos", suffix: "+" },
                  { value: "12", label: "Países", suffix: "" },
                ].map((stat, idx) => (
                  <motion.div 
                    key={idx} 
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                  >
                    <p className="text-2xl font-bold">
                      <span className="gradient-text">{stat.value}</span>
                      <span className="text-muted-foreground">{stat.suffix}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right - Event Carousel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/30">
                <EventCarousel />
                {/* Overlay sutil */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/20 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-xs text-muted-foreground">Descubre más</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Why section - El concepto */}
      <section id="about" className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card/0 via-card/30 to-card/0" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Stethoscope className="h-3 w-3 mr-1.5" />
              ¿Por qué esta formación?
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5">
              Porque la hipertensión pulmonar requiere{" "}
              <span className="gradient-text">especialistas formados con rigor</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Actualizados con la última evidencia científica y conectados 
              con la realidad clínica de América Latina.
            </p>
          </motion.div>

          {/* Cards con firma visual */}
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                icon: Heart,
                title: "Conocimiento de referentes",
                description: "Aprende directamente de quienes lideran el campo en la región. 15 expertos de 12 países compartiendo su experiencia.",
              },
              {
                icon: Activity,
                title: "Formación aplicada",
                description: "Rotaciones prácticas en centros de referencia. Casos reales, entrenamiento hands-on, habilidades transferibles.",
              },
              {
                icon: Users2,
                title: "Red profesional",
                description: "Conecta con especialistas de toda Latinoamérica. Una comunidad que trasciende el programa.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <ClinicalCard className="h-full">
                  <ClinicalCardHeader>
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <ClinicalCardTitle>{item.title}</ClinicalCardTitle>
                    <ClinicalCardDescription className="mt-2">{item.description}</ClinicalCardDescription>
                  </ClinicalCardHeader>
                </ClinicalCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                <GraduationCap className="h-3 w-3 mr-1.5" />
                ¿Para quién es?
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5">
                Profesionales comprometidos con la excelencia
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                El programa está diseñado para médicos especialistas que buscan 
                convertirse en referentes en el manejo de la hipertensión pulmonar.
              </p>

              <div className="space-y-3">
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
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/40"
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
            >
              <ClinicalCard variant="success" className="p-8">
                <div className="space-y-6">
                  {[
                    { icon: Calendar, title: "Modalidad intensiva", desc: "3 al 15 de noviembre · Régimen MEET UP" },
                    { icon: Users2, title: "Presencial con expertos", desc: "Interacción directa con referentes de la región" },
                    { icon: MapPin, title: "Rotaciones prácticas", desc: "Entrenamiento hands-on en centros de referencia" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-background/50 border border-border/50">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ClinicalCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card/0 via-card/30 to-card/0" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Zap className="h-3 w-3 mr-1.5" />
              Metodología
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5">
              Una experiencia educativa{" "}
              <span className="gradient-text">diseñada para transformar</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Combinamos teoría de vanguardia con práctica directa
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-12">
            {[
              {
                icon: BookOpen,
                title: "28 Módulos especializados",
                description: "Desde fundamentos hasta tratamientos de vanguardia en hipertensión pulmonar.",
                variant: "default" as const,
              },
              {
                icon: Users2,
                title: "Expertos regionales",
                description: "Aprende de los referentes más destacados de Latinoamérica.",
                variant: "progress" as const,
              },
              {
                icon: Award,
                title: "Certificación profesional",
                description: "Certificado avalado por los líderes en manejo de hipertensión pulmonar.",
                variant: "success" as const,
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <ClinicalCard variant={item.variant} className="h-full" progress={idx === 1 ? 60 : undefined}>
                  <ClinicalCardHeader>
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <ClinicalCardTitle>{item.title}</ClinicalCardTitle>
                    <ClinicalCardDescription className="mt-2">{item.description}</ClinicalCardDescription>
                  </ClinicalCardHeader>
                </ClinicalCard>
              </motion.div>
            ))}
          </div>

          {/* Training areas - Diseño refinado */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <ClinicalCard className="p-6 md:p-8">
              <h3 className="text-lg font-semibold mb-6 text-center">Áreas de entrenamiento</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Ecocardiografía avanzada",
                  "Capilaroscopia",
                  "Cateterismo cardíaco derecho",
                  "Enfermedad intersticial pulmonar",
                  "Manejo farmacológico específico",
                  "Casos clínicos complejos",
                ].map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </ClinicalCard>
          </motion.div>
        </div>
      </section>

      {/* How it Works - Pasos con firma visual */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Target className="h-3 w-3 mr-1.5" />
              Tu recorrido
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              El camino hacia la especialización
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto relative">
            {/* Línea conectora */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
            
            {[
              { step: "01", title: "Registro", desc: "Crea tu cuenta en el campus virtual" },
              { step: "02", title: "Acceso", desc: "Explora los módulos y materiales" },
              { step: "03", title: "Formación", desc: "Avanza en tu ruta de aprendizaje" },
              { step: "04", title: "Certificación", desc: "Obtén tu acreditación profesional" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="text-center relative"
              >
                <div className="w-16 h-16 rounded-2xl bg-card border border-border/60 flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="text-xl font-bold gradient-text">{item.step}</span>
                </div>
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card/0 via-card/30 to-card/0" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Award className="h-3 w-3 mr-1.5" />
              Respaldo regional
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5">
              Avalado por expertos de toda la región
            </h2>
            <p className="text-muted-foreground mb-10 text-lg">
              Un programa respaldado por la comunidad médica especializada en 
              hipertensión pulmonar de Latinoamérica.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              {["Argentina", "Brasil", "Chile", "Colombia", "México", "Perú"].map((country, idx) => (
                <motion.div
                  key={country}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Badge 
                    variant="outline" 
                    className="px-4 py-2 border-border/60 hover:border-primary/40 transition-colors"
                  >
                    {country}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ClinicalCard className="p-8 md:p-14 max-w-4xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5">
                Comienza tu especialización
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
                Únete al programa que está formando a los especialistas en 
                circulación pulmonar de América Latina.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="btn-gradient-primary gap-2 h-12 px-8 text-base"
              >
                Acceder al Campus Virtual
                <ArrowRight className="h-4 w-4" />
              </Button>
            </ClinicalCard>
          </motion.div>
        </div>
      </section>

      {/* Footer - Refinado */}
      <footer className="border-t border-border/40 py-14">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <img 
                src={logoMlcp} 
                alt="MLCP" 
                className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20" 
              />
              <div>
                <p className="font-semibold">Campus MCP</p>
                <p className="text-xs text-muted-foreground">Circulación Pulmonar</p>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                <a 
                  href="mailto:magisterenhipertensionpulmonar@gmail.com" 
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  magisterenhipertensionpulmonar@gmail.com
                </a>
              </p>
              <p>
                <a
                  href="https://www.maestriacp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  www.maestriacp.com
                </a>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: "https://www.instagram.com/magisterencirculacionpulmonar" },
                { icon: Facebook, href: "https://www.facebook.com/share/1K5djkRfr8" },
                { icon: Linkedin, href: "https://www.linkedin.com/in/hipertension-pulmonar-655a43253" },
              ].map(({ icon: Icon, href }, idx) => (
                <motion.a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>

            <div className="border-t border-border/40 w-full pt-8">
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
