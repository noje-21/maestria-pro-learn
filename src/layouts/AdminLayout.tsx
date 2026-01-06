import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Video,
  FileText,
  Image,
  FileQuestion,
  Eye,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "General" },
  { id: "courses", label: "Cursos", icon: BookOpen, section: "General" },
  { id: "users", label: "Usuarios", icon: Users, section: "General" },
  { id: "modules", label: "Módulos", icon: GraduationCap, section: "Contenido" },
  { id: "videos", label: "Videos", icon: Video, section: "Contenido" },
  { id: "materials", label: "Materiales", icon: FileText, section: "Contenido" },
  { id: "images", label: "Imágenes", icon: Image, section: "Contenido" },
  { id: "exams", label: "Exámenes", icon: FileQuestion, section: "Contenido" },
  { id: "progress", label: "Progreso", icon: TrendingUp, section: "Estadísticas" },
  { id: "analytics", label: "Analytics", icon: TrendingUp, section: "Estadísticas" },
  { id: "visibility", label: "Visibilidad", icon: Eye, section: "Configuración" },
  { id: "simposio", label: "Simposio", icon: Calendar, section: "Eventos" },
];

const sectionOrder = ["General", "Contenido", "Estadísticas", "Configuración", "Eventos"];

export const AdminLayout = ({ children, activeTab, onTabChange }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleNavClick = (tab: string) => {
    onTabChange(tab);
    setMobileOpen(false);
  };

  // Group items by section
  const groupedItems = sectionOrder.reduce((acc, section) => {
    acc[section] = navItems.filter(item => item.section === section);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const currentItem = navItems.find(item => item.id === activeTab);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => navigate('/dashboard')}
        >
          <div className="p-2 rounded-lg bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="font-bold text-lg whitespace-nowrap">MCP Admin</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {sectionOrder.map(section => {
          const items = groupedItems[section];
          if (!items || items.length === 0) return null;

          return (
            <div key={section}>
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2"
                  >
                    {section}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-1">
                {items.map(item => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;

                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary-foreground")} />
                      <AnimatePresence mode="wait">
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-2">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className={cn(
            "w-full justify-start gap-3",
            collapsed && "justify-center px-2"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
          {!collapsed && <span>Volver al Dashboard</span>}
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col border-r border-border bg-card shrink-0"
      >
        <SidebarContent />
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-[calc(var(--sidebar-width)-12px)] top-6 z-50 p-1.5 rounded-full bg-background border border-border shadow-sm hover:bg-muted transition-colors"
          style={{ "--sidebar-width": collapsed ? "80px" : "260px" } as React.CSSProperties}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </motion.aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Breadcrumb */}
            <Breadcrumb className="hidden sm:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin" onClick={(e) => { e.preventDefault(); onTabChange('dashboard'); }}>
                    Admin
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentItem?.label || 'Dashboard'}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Page Title (Mobile) */}
            <h1 className="sm:hidden text-lg font-semibold">{currentItem?.label || 'Dashboard'}</h1>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/courses')}
                className="hidden sm:flex gap-2"
              >
                <Eye className="h-4 w-4" />
                Ver Catálogo
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
