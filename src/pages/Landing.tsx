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
  AlertTriangle,
  Brain,
  Shield,
  TrendingUp,
  MessageCircle,
  Play,
  Clock,
  Microscope,
  HeartPulse,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logoMlcp from "@/assets/logo-mlcp.jpg";
import EventCarousel from "@/components/EventCarousel";
import { ClinicalCard, ClinicalCardHeader, ClinicalCardTitle, ClinicalCardDescription, ClinicalCardContent } from "@/components/ui/clinical-card";

const Landing = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Módulos con enfoque clínico transformativo
  const clinicalModules = [
    {
      number: 1,
      title: "Reconocer al paciente en riesgo",
      impact: "El diagnóstico temprano cambia el pronóstico.",
      bullets: [
        "Identifica señales de alarma antes de que sea tarde",
        "Decide cuándo sospechar HP en cuadros inespecíficos",
        "Evita la demora diagnóstica que afecta supervivencia",
      ],
      icon: AlertTriangle,
    },
    {
      number: 2,
      title: "Interpretar estudios con criterio clínico",
      impact: "Del ecocardiograma al cateterismo: cada dato cuenta.",
      bullets: [
        "Lee imágenes con ojo de especialista",
        "Decide cuándo avanzar a estudios invasivos",
        "Evita sobreinterpretaciones que llevan a tratamientos innecesarios",
      ],
      icon: Microscope,
    },
    {
      number: 3,
      title: "Estratificar riesgo y definir pronóstico",
      impact: "Saber qué paciente necesita qué, y cuándo.",
      bullets: [
        "Aplica escalas de riesgo en la práctica real",
        "Personaliza el enfoque según el perfil del paciente",
        "Evita subestimar la gravedad clínica",
      ],
      icon: TrendingUp,
    },
    {
      number: 4,
      title: "Tomar decisiones terapéuticas críticas",
      impact: "Farmacología avanzada con impacto medible.",
      bullets: [
        "Selecciona el tratamiento óptimo según evidencia",
        "Combina terapias cuando el paciente lo requiere",
        "Evita demoras en la escalación terapéutica",
      ],
      icon: HeartPulse,
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Clinical Line Pattern - Firma visual sutil */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-8 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
        <div className="absolute top-0 right-8 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/3 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl">
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
              onClick={() => scrollToSection("problema")}
              className="hidden md:inline-flex text-muted-foreground hover:text-foreground"
            >
              El problema
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("formacion")}
              className="hidden md:inline-flex text-muted-foreground hover:text-foreground"
            >
              Formación
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

      {/* ═══════════════════════════════════════════════════════════════════
          ACTO 1 — CONTEXTO: El problema crítico
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-24 md:pt-28 min-h-[90vh] flex items-center">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left - Contexto y problema */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              <Badge 
                variant="secondary" 
                className="mb-5 bg-destructive/10 text-destructive border-destructive/20 px-4 py-1.5"
              >
                <AlertTriangle className="h-3 w-3 mr-1.5" />
                Problema crítico en la región
              </Badge>
              
              {/* Headline con contexto */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black leading-[1.1] mb-6">
                La hipertensión pulmonar{" "}
                <span className="relative">
                  <span className="gradient-text">no espera.</span>
                </span>
                <br />
                <span className="text-muted-foreground text-2xl sm:text-3xl md:text-4xl font-semibold">
                  Tu formación tampoco debería.
                </span>
              </h1>
              
              {/* El problema real - médico, directo */}
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                En Latinoamérica, el diagnóstico tardío sigue siendo la norma. 
                Los pacientes llegan años después de los primeros síntomas. 
                <strong className="text-foreground"> Esta maestría existe para cambiar eso.</strong>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                <Button
                  size="lg"
                  onClick={() => scrollToSection("formacion")}
                  className="btn-gradient-primary gap-2 h-12 px-6 text-base"
                >
                  Conocer la formación
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection("contacto")}
                  className="gap-2 h-12 border-border/60 hover:bg-muted/30"
                >
                  <MessageCircle className="h-4 w-4" />
                  Hablar con el equipo
                </Button>
              </div>

              {/* Trust indicators compactos */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-6 border-t border-border/40">
                {[
                  { value: "28", label: "Hitos clínicos" },
                  { value: "15+", label: "Referentes" },
                  { value: "12", label: "Países" },
                ].map((stat, idx) => (
                  <motion.div 
                    key={idx} 
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                  >
                    <p className="text-2xl font-bold gradient-text">{stat.value}</p>
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
          <span className="text-xs text-muted-foreground">Conoce más</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Problema contextualizado */}
      <section id="problema" className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card/0 via-card/40 to-card/0" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Stethoscope className="h-3 w-3 mr-1.5" />
              El contexto clínico
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5">
              Por qué la HP requiere{" "}
              <span className="gradient-text">formación especializada</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              La hipertensión pulmonar afecta el pronóstico de forma silenciosa. 
              Cuando los síntomas son evidentes, la enfermedad ya ha progresado.
            </p>
          </motion.div>

          {/* Stats de impacto - sobrios */}
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                stat: "2-3 años",
                label: "Demora diagnóstica promedio en la región",
                icon: Clock,
              },
              {
                stat: "70%",
                label: "Pacientes llegan en clase funcional III-IV",
                icon: AlertTriangle,
              },
              {
                stat: "< 50",
                label: "Centros de referencia en toda Latinoamérica",
                icon: MapPin,
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <ClinicalCard className="h-full text-center p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold gradient-text mb-2">{item.stat}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </ClinicalCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ACTO 2 — AUTORIDAD: Los que lideran el campo
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Award className="h-3 w-3 mr-1.5" />
                Quiénes enseñan
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5">
                Aprende de quienes tratan pacientes,{" "}
                <span className="gradient-text">no solo de quienes escriben sobre ellos</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                15 especialistas de 12 países. Jefes de unidades de HP, 
                investigadores con publicaciones de alto impacto, 
                médicos que ven pacientes cada día.
              </p>

              <div className="space-y-3">
                {[
                  "Directores de programas de HP en centros de referencia",
                  "Autores de guías latinoamericanas de HP",
                  "Investigadores con trials multicéntricos",
                  "Clínicos con décadas de experiencia en casos complejos",
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/40"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
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
                    { icon: Calendar, title: "Formato intensivo", desc: "3 al 15 de noviembre · 12 días de inmersión total" },
                    { icon: Users2, title: "Modalidad MEET UP", desc: "Presencial con los expertos, grabaciones disponibles después" },
                    { icon: MapPin, title: "Rotaciones prácticas", desc: "Entrenamiento hands-on en ecocardiografía y cateterismo" },
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

      {/* ═══════════════════════════════════════════════════════════════════
          ACTO 3 — TRANSFORMACIÓN: Lo que dominarás
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="formacion" className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card/0 via-card/40 to-card/0" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Brain className="h-3 w-3 mr-1.5" />
              Tu transformación clínica
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5">
              Al terminar, podrás{" "}
              <span className="gradient-text">tomar decisiones que antes no podías</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              No es una lista de temas. Es una progresión clínica que te lleva 
              del reconocimiento al manejo avanzado.
            </p>
          </motion.div>

          {/* Módulos clínicos - transformados */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {clinicalModules.map((module, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <ClinicalCard className="h-full">
                  <ClinicalCardHeader step={module.number}>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <module.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <ClinicalCardTitle className="text-base">
                          {module.title}
                        </ClinicalCardTitle>
                        <p className="text-sm text-primary/80 font-medium mt-1">
                          {module.impact}
                        </p>
                      </div>
                    </div>
                  </ClinicalCardHeader>
                  <ClinicalCardContent className="pl-14 space-y-2">
                    {module.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                        <span className="text-sm text-muted-foreground">{bullet}</span>
                      </div>
                    ))}
                  </ClinicalCardContent>
                </ClinicalCard>
              </motion.div>
            ))}
          </div>

          {/* Áreas de entrenamiento práctico */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-4xl mx-auto mt-10"
          >
            <ClinicalCard className="p-6 md:p-8">
              <h3 className="text-lg font-semibold mb-6 text-center">
                Entrenamiento práctico incluido
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  "Ecocardiografía avanzada en HP",
                  "Cateterismo cardíaco derecho",
                  "Capilaroscopia e intersticio pulmonar",
                  "Estratificación con escalas pronósticas",
                  "Selección farmacológica según perfil",
                  "Manejo del paciente en deterioro",
                ].map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </ClinicalCard>
          </motion.div>
        </div>
      </section>

      {/* Perfil del participante */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <GraduationCap className="h-3 w-3 mr-1.5" />
              ¿Es para ti?
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5">
              Para médicos que quieren{" "}
              <span className="gradient-text">marcar la diferencia</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <ClinicalCard className="h-full">
                <ClinicalCardHeader>
                  <ClinicalCardTitle className="text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Este programa es para ti si...
                  </ClinicalCardTitle>
                </ClinicalCardHeader>
                <ClinicalCardContent className="space-y-3">
                  {[
                    "Eres cardiólogo, neumólogo, internista o intensivista",
                    "Quieres especializarte en HP con enfoque práctico",
                    "Buscas formación con referentes de la región",
                    "Puedes dedicar 12 días intensivos a tu formación",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </ClinicalCardContent>
              </ClinicalCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <ClinicalCard className="h-full" variant="locked">
                <ClinicalCardHeader>
                  <ClinicalCardTitle className="text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Probablemente no es para ti si...
                  </ClinicalCardTitle>
                </ClinicalCardHeader>
                <ClinicalCardContent className="space-y-3">
                  {[
                    "Buscas un curso corto o introductorio",
                    "No puedes comprometerte con la carga intensiva",
                    "Prefieres formación 100% asincrónica",
                    "No tienes base previa en cardiología o neumología",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full border border-muted-foreground/30 mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </ClinicalCardContent>
              </ClinicalCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Respaldo regional */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card/0 via-card/40 to-card/0" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Shield className="h-3 w-3 mr-1.5" />
              Respaldo regional
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5">
              Avalado por la comunidad médica de{" "}
              <span className="gradient-text">toda la región</span>
            </h2>
            <p className="text-muted-foreground mb-10 text-lg">
              Expertos de 12 países respaldando una formación de excelencia.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              {["Argentina", "Brasil", "Chile", "Colombia", "Ecuador", "México", "Paraguay", "Perú", "Uruguay", "Venezuela", "Panamá", "Costa Rica"].map((country, idx) => (
                <motion.div
                  key={country}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.03 }}
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

      {/* ═══════════════════════════════════════════════════════════════════
          ACTO 4 — ACCIÓN: CTA claro y humano
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="contacto" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ClinicalCard className="p-8 md:p-14 max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20">
                <MessageCircle className="h-3 w-3 mr-1.5" />
                Da el primer paso
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5">
                ¿Quieres saber si este programa es para ti?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
                Habla con nuestro equipo académico. Sin compromiso, 
                sin presión. Solo una conversación para resolver tus dudas.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")}
                  className="btn-gradient-primary gap-2 h-12 px-8 text-base"
                >
                  Acceder al Campus Virtual
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 h-12 px-8 border-border/60"
                  onClick={() => window.open("mailto:magisterenhipertensionpulmonar@gmail.com", "_blank")}
                >
                  <MessageCircle className="h-4 w-4" />
                  Escribir al equipo
                </Button>
              </div>

              {/* Preguntas frecuentes rápidas */}
              <div className="mt-10 pt-8 border-t border-border/40">
                <p className="text-sm text-muted-foreground mb-4">Preguntas frecuentes:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "¿Solo es presencial?",
                    "¿Quedan grabadas las clases?",
                    "¿Qué pasa después de los 12 días?",
                  ].map((q, idx) => (
                    <Badge 
                      key={idx}
                      variant="outline" 
                      className="px-3 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => window.open("mailto:magisterenhipertensionpulmonar@gmail.com?subject=" + encodeURIComponent(q), "_blank")}
                    >
                      {q}
                    </Badge>
                  ))}
                </div>
              </div>
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
                <p className="text-xs text-muted-foreground">Maestría en Circulación Pulmonar</p>
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
