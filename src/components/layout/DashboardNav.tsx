import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  LogOut, 
  User, 
  Users, 
  Award,
  BookOpen,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardNavProps {
  isAdmin: boolean;
  canDownloadCertificate?: boolean;
  onLogout: () => void;
}

export const DashboardNav = ({ 
  isAdmin, 
  canDownloadCertificate,
  onLogout 
}: DashboardNavProps) => {
  const navigate = useNavigate();

  return (
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
          {isAdmin && (
            <Button 
              onClick={() => navigate("/admin")} 
              className="btn-gradient-primary gap-2"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Panel Admin</span>
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={() => navigate("/courses")}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Catálogo</span>
          </Button>

          {canDownloadCertificate && (
            <Button 
              variant="outline" 
              onClick={() => navigate("/certificate")} 
              className="gap-2"
            >
              <Award className="h-5 w-5" />
              <span className="hidden sm:inline">Certificado</span>
            </Button>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/profile")}
          >
            <User className="h-5 w-5" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};
