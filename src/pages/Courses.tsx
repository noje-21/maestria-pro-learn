import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, User, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseSkeleton } from "@/components/courses/CourseSkeleton";
import { CourseRecommendations } from "@/components/courses/CourseRecommendations";
import { motion, AnimatePresence } from "framer-motion";

interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  level: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  is_enrolled: boolean;
  modules_count: number;
  progress?: number;
}

const ITEMS_PER_PAGE = 9;

const Courses = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadCourses();
  }, [user]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, levelFilter, sortBy]);

  const loadCourses = async () => {
    if (!user) return;

    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .eq('status', 'active');

      if (coursesError) throw coursesError;

      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('user_courses')
        .select('course_id, progress')
        .eq('user_id', user.id)
        .eq('status', 'enrolled');

      if (enrollmentsError) throw enrollmentsError;

      const enrollmentMap = new Map(
        (enrollmentsData || []).map(e => [e.course_id, e.progress || 0])
      );

      const coursesWithData = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { count } = await supabase
            .from('modules')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)
            .eq('is_active', true);

          const isEnrolled = enrollmentMap.has(course.id);
          
          return {
            ...course,
            is_enrolled: isEnrolled,
            modules_count: count || 0,
            progress: isEnrolled ? enrollmentMap.get(course.id) : undefined,
          };
        })
      );

      setCourses(coursesWithData);
    } catch (error: any) {
      console.error('Error loading courses:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los cursos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted courses
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        c => c.title.toLowerCase().includes(search) || 
             c.description?.toLowerCase().includes(search)
      );
    }

    if (levelFilter && levelFilter !== "all") {
      result = result.filter(c => c.level?.toLowerCase() === levelFilter.toLowerCase());
    }

    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.start_date || 0).getTime() - new Date(b.start_date || 0).getTime());
        break;
      case "title_asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title_desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return result;
  }, [courses, searchTerm, levelFilter, sortBy]);

  // Paginated courses
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCourses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCourses, currentPage]);

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);

  const handleLogout = async () => {
    await signOut();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLevelFilter("all");
    setSortBy("newest");
  };

  const hasActiveFilters = searchTerm !== "" || levelFilter !== "all" || sortBy !== "newest";

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-40 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold gradient-text">MCP</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => navigate("/dashboard/courses")} 
              variant="outline"
              className="border-border/50 hover:bg-primary/10 hover:border-primary transition-all"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Mis Cursos</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/profile")}
              className="hover:bg-primary/10"
            >
              <User className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text">
            Catálogo de Cursos
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explora y matricúlate en nuestros programas educativos especializados
          </p>
        </motion.div>

        {/* Filters */}
        <CourseFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          levelFilter={levelFilter}
          onLevelChange={setLevelFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Results count */}
        <AnimatePresence mode="wait">
          {!loading && filteredCourses.length > 0 && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground"
            >
              <span className="font-semibold text-foreground">{filteredCourses.length}</span> curso{filteredCourses.length !== 1 ? 's' : ''} encontrado{filteredCourses.length !== 1 ? 's' : ''}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CourseSkeleton count={6} />
          </div>
        ) : paginatedCourses.length > 0 ? (
          <>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              layout
            >
              <AnimatePresence mode="popLayout">
                {paginatedCourses.map((course, idx) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    index={idx}
                    onClick={() => navigate(`/course/${course.id}`)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 pt-8"
              >
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-10 w-10 rounded-full border-border/50 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className={`h-10 w-10 rounded-full transition-all ${
                        currentPage === i + 1 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                          : "hover:bg-muted/50"
                      }`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-10 w-10 rounded-full border-border/50 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/30 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {hasActiveFilters ? "No se encontraron cursos" : "No hay cursos disponibles"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {hasActiveFilters 
                ? "Intenta ajustar los filtros de búsqueda para encontrar más resultados"
                : "Pronto habrá nuevos cursos disponibles"
              }
            </p>
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                Limpiar filtros
              </Button>
            )}
          </motion.div>
        )}

        {/* Recommendations */}
        {user && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-12 border-t border-border/30"
          >
            <CourseRecommendations userId={user.id} limit={6} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Courses;
