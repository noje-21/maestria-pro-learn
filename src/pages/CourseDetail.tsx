import { useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  LayoutGrid, 
  BookOpen, 
  TrendingUp, 
  Pencil,
  GraduationCap,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useCourseHub } from "@/hooks/useCourseHub";
import { CourseOverview } from "@/components/course/CourseOverview";
import { CourseModuleCard } from "@/components/course/CourseModuleCard";
import { CourseNotes } from "@/components/course/CourseNotes";
import ChatBot from "@/components/ChatBot";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const {
    course,
    modules,
    stats,
    instructors,
    lastLessonId,
    lastLessonTitle,
    isEnrolled,
    loading,
  } = useCourseHub(id, user?.id);

  const handleLessonClick = useCallback((lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  }, [navigate]);

  const handleContinue = useCallback(() => {
    if (lastLessonId) {
      navigate(`/lesson/${lastLessonId}`);
    }
  }, [navigate, lastLessonId]);

  // Determine which module should be expanded by default
  const expandedModuleId = useMemo(() => {
    for (const module of modules) {
      const hasIncomplete = module.lessons.some(l => !l.completed);
      if (hasIncomplete) return module.id;
    }
    return modules[0]?.id;
  }, [modules]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation Skeleton */}
        <nav className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-40 bg-background/80">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-10 w-40" />
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-[320px] w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Curso no encontrado</h2>
          <Button onClick={() => navigate('/courses')}>
            Ver todos los cursos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-40 bg-background/80">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/courses")}
            className="gap-2 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver a Cursos</span>
          </Button>
          
          {isEnrolled && stats.progress > 0 && (
            <Button
              onClick={handleContinue}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
            >
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Continuar</span>
            </Button>
          )}
        </div>
      </nav>

      {/* Main Content with Tabs */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tabs Navigation */}
          <div className="sticky top-[65px] z-30 bg-background/95 backdrop-blur-xl -mx-4 px-4 py-3 border-b border-border/30">
            <TabsList className="w-full grid grid-cols-4 max-w-xl mx-auto h-12 bg-muted/50">
              <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-background">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Resumen</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2 data-[state=active]:bg-background">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Contenido</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="gap-2 data-[state=active]:bg-background">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Progreso</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2 data-[state=active]:bg-background">
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Notas</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <CourseOverview
                  course={course}
                  stats={stats}
                  instructors={instructors}
                  onContinue={handleContinue}
                  lastLessonTitle={lastLessonTitle || undefined}
                />
              </TabsContent>

              {/* Content Tab - Modules */}
              <TabsContent value="content" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">Contenido del Curso</h2>
                      <p className="text-sm text-muted-foreground">
                        {stats.totalModules} módulos • {stats.totalLessons} lecciones
                      </p>
                    </div>
                    {isEnrolled && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {Math.round(stats.progress)}% completado
                      </Badge>
                    )}
                  </div>

                  {modules.length === 0 ? (
                    <div className="text-center py-16">
                      <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Sin contenido aún</h3>
                      <p className="text-sm text-muted-foreground">
                        Este curso no tiene módulos disponibles
                      </p>
                    </div>
                  ) : (
                    <motion.div 
                      className="space-y-4"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: { transition: { staggerChildren: 0.05 } }
                      }}
                    >
                      {modules.map((module, idx) => (
                        <motion.div
                          key={module.id}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                          }}
                        >
                          <CourseModuleCard
                            moduleNumber={module.module_number}
                            title={module.title}
                            description={module.description}
                            instructor={module.instructor}
                            lessons={module.lessons}
                            onLessonClick={handleLessonClick}
                            defaultExpanded={module.id === expandedModuleId}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value="progress" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Tu Progreso</h2>
                    <p className="text-sm text-muted-foreground">
                      Visualiza tu avance en el curso
                    </p>
                  </div>

                  {/* Overall Progress Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8 text-center"
                  >
                    <div className="relative z-10">
                      <div className="w-32 h-32 mx-auto mb-6 relative">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="12"
                          />
                          <motion.circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={351.86}
                            initial={{ strokeDashoffset: 351.86 }}
                            animate={{ strokeDashoffset: 351.86 - (351.86 * stats.progress / 100) }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold">{Math.round(stats.progress)}%</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">
                        {stats.progress >= 100 
                          ? '¡Curso completado!' 
                          : stats.progress > 0 
                            ? '¡Sigue así!' 
                            : 'Comienza ahora'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {stats.completedLessons} de {stats.totalLessons} lecciones completadas
                      </p>
                    </div>
                  </motion.div>

                  {/* Module Progress */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">Progreso por Módulo</h3>
                    {modules.map((module, idx) => {
                      const completed = module.lessons.filter(l => l.completed).length;
                      const total = module.lessons.length;
                      const pct = total > 0 ? (completed / total) * 100 : 0;

                      return (
                        <motion.div
                          key={module.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                            {module.module_number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-sm">{module.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-primary rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground min-w-[3rem] text-right">
                                {completed}/{total}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <CourseNotes 
                  courseId={id!} 
                  modules={modules.map(m => ({
                    id: m.id,
                    title: m.title,
                    lessons: m.lessons.map(l => ({
                      id: l.id,
                      title: l.title
                    }))
                  }))}
                />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>

      <ChatBot />
    </div>
  );
};

export default CourseDetail;
