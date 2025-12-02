import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, User, BookOpen, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseRecommendations } from "@/components/courses/CourseRecommendations";
import { motion } from "framer-motion";

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
      // Cargar cursos activos
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .eq('status', 'active');

      if (coursesError) throw coursesError;

      // Cargar inscripciones del usuario con progreso
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('user_courses')
        .select('course_id, progress')
        .eq('user_id', user.id)
        .eq('status', 'enrolled');

      if (enrollmentsError) throw enrollmentsError;

      const enrollmentMap = new Map(
        (enrollmentsData || []).map(e => [e.course_id, e.progress || 0])
      );

      // Contar módulos por curso
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

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        c => c.title.toLowerCase().includes(search) || 
             c.description?.toLowerCase().includes(search)
      );
    }

    // Level filter
    if (levelFilter && levelFilter !== "all") {
      result = result.filter(c => c.level?.toLowerCase() === levelFilter.toLowerCase());
    }

    // Sort
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground font-medium">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-xl sticky top-0 z-40 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">MCP</span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/dashboard/courses")} variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Mis Cursos</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
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
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3">Catálogo de Cursos</h1>
          <p className="text-muted-foreground text-lg">
            Explora y matricúlate en nuestros programas educativos
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
        {filteredCourses.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} encontrado{filteredCourses.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Courses Grid */}
        {paginatedCourses.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCourses.map((course, idx) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={idx}
                  onClick={() => navigate(`/course/${course.id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className={currentPage === i + 1 ? "btn-gradient-primary" : ""}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {hasActiveFilters ? "No se encontraron cursos" : "No hay cursos disponibles"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters 
                ? "Intenta ajustar los filtros de búsqueda"
                : "Pronto habrá nuevos cursos disponibles"
              }
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </motion.div>
        )}

        {/* Recommendations (only show if user has some enrollments) */}
        {user && (
          <div className="pt-8 border-t border-border">
            <CourseRecommendations userId={user.id} limit={4} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
