import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, SlidersHorizontal, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CourseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  levelFilter: string;
  onLevelChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const levelOptions = [
  { value: "all", label: "Todos", icon: "📚" },
  { value: "básico", label: "Básico", icon: "🌱" },
  { value: "medio", label: "Medio", icon: "📖" },
  { value: "avanzado", label: "Avanzado", icon: "🚀" },
  { value: "maestría", label: "Maestría", icon: "👑" },
];

const sortOptions = [
  { value: "newest", label: "Más recientes", icon: <Sparkles className="h-3 w-3" /> },
  { value: "oldest", label: "Más antiguos", icon: null },
  { value: "title_asc", label: "A-Z", icon: null },
  { value: "title_desc", label: "Z-A", icon: null },
];

export const CourseFilters = ({
  searchTerm,
  onSearchChange,
  levelFilter,
  onLevelChange,
  sortBy,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}: CourseFiltersProps) => {
  const [showFilters, setShowFilters] = useState(true);

  return (
    <motion.div 
      className="space-y-5"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos por título o descripción..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-11 h-12 bg-card/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-sm transition-all duration-300"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={`h-12 px-4 rounded-xl border-border/50 transition-all duration-300 ${
            showFilters ? "bg-primary/10 border-primary text-primary" : "hover:bg-card"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && (
            <span className="ml-2 bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Filters Panel - Chips Style */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/30 space-y-5">
              {/* Level Chips */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nivel del curso
                </label>
                <div className="flex flex-wrap gap-2">
                  {levelOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => onLevelChange(option.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                        levelFilter === option.value
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                          : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                      whileHover={{ scale: levelFilter === option.value ? 1.05 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Sort Chips */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ordenar por
                </label>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => onSortChange(option.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                        sortBy === option.value
                          ? "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/25 scale-105"
                          : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                      whileHover={{ scale: sortBy === option.value ? 1.05 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearFilters}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpiar todos los filtros
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
