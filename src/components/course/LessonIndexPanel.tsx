import { useState, useMemo, memo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModuleAccordion, ModuleData } from "./ModuleAccordion";

interface LessonIndexPanelProps {
  modules: ModuleData[];
  currentLessonId: string;
  onLessonSelect: (lessonId: string) => void;
}

const LessonIndexPanelComponent = ({
  modules,
  currentLessonId,
  onLessonSelect,
}: LessonIndexPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(modules.map(m => m.id))
  );

  // Filter modules and lessons based on search
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;

    const query = searchQuery.toLowerCase();
    return modules
      .map(module => ({
        ...module,
        lessons: module.lessons.filter(lesson =>
          lesson.title.toLowerCase().includes(query)
        ),
      }))
      .filter(module => module.lessons.length > 0);
  }, [modules, searchQuery]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  // Check if a module contains the current lesson
  const hasCurrentLesson = (module: ModuleData) =>
    module.lessons.some(l => l.id === currentLessonId);

  return (
    <div className="h-full flex flex-col bg-card/30">
      {/* Search Header */}
      <div className="p-4 border-b border-border/50 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar lección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {modules.reduce((acc, m) => acc + m.lessons.length, 0)} lecciones en {modules.length} módulos
        </p>
      </div>

      {/* Modules List */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {filteredModules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No se encontraron lecciones</p>
            </div>
          ) : (
            filteredModules.map((module) => (
              <ModuleAccordion
                key={module.id}
                module={module}
                isExpanded={expandedModules.has(module.id)}
                hasCurrentLesson={hasCurrentLesson(module)}
                currentLessonId={currentLessonId}
                onToggle={() => toggleModule(module.id)}
                onLessonSelect={onLessonSelect}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export const LessonIndexPanel = memo(LessonIndexPanelComponent);
