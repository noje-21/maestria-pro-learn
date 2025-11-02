import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

const Certificate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [userName, setUserName] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [canDownload, setCanDownload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEligibility();
  }, [user]);

  const checkEligibility = async () => {
    if (!user) return;

    try {
      // Verificar si completó todas las lecciones
      const { data, error } = await supabase
        .rpc('user_completed_all_lessons', { _user_id: user.id });

      if (error) throw error;

      if (!data) {
        toast({
          title: "Certificado no disponible",
          description: "Debes completar todas las lecciones para obtener tu certificado",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setCanDownload(true);

      // Obtener nombre del usuario
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      setUserName(profile?.full_name || user.email || 'Estudiante');
      
      // Obtener fecha de la última lección completada
      const { data: lastProgress } = await supabase
        .from('user_progress')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (lastProgress?.completed_at) {
        const date = new Date(lastProgress.completed_at);
        setCompletionDate(date.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }));
      }

    } catch (error: any) {
      console.error('Error checking eligibility:', error);
      toast({
        title: "Error",
        description: "No se pudo verificar elegibilidad para certificado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Fondo
    doc.setFillColor(14, 14, 14);
    doc.rect(0, 0, 297, 210, 'F');

    // Borde decorativo
    doc.setDrawColor(33, 62, 204);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);

    // Título
    doc.setTextColor(33, 62, 204);
    doc.setFontSize(40);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICADO', 148.5, 50, { align: 'center' });

    // Subtítulo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('DE FINALIZACIÓN', 148.5, 63, { align: 'center' });

    // Texto principal
    doc.setFontSize(14);
    doc.text('Se certifica que', 148.5, 85, { align: 'center' });

    // Nombre del estudiante
    doc.setTextColor(33, 62, 204);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(userName, 148.5, 105, { align: 'center' });

    // Descripción
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('ha completado satisfactoriamente la', 148.5, 120, { align: 'center' });

    // Nombre del curso
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Maestría Latinoamericana en Circulación Pulmonar', 148.5, 132, { align: 'center' });

    // Fecha
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de finalización: ${completionDate}`, 148.5, 155, { align: 'center' });

    // Firma
    doc.setDrawColor(33, 62, 204);
    doc.line(60, 175, 120, 175);
    doc.text('Dr. Adrián Lescano', 90, 182, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Director MLCP', 90, 188, { align: 'center' });

    // Logo texto
    doc.setTextColor(206, 32, 32);
    doc.setFontSize(10);
    doc.text('MaestríaPro', 270, 200, { align: 'right' });

    // Guardar
    doc.save(`Certificado_MLCP_${userName.replace(/\s+/g, '_')}.pdf`);

    toast({
      title: "Certificado generado",
      description: "Tu certificado ha sido descargado exitosamente",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verificando elegibilidad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="glass-card p-12 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Award className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">¡Felicitaciones!</h1>
            <p className="text-xl text-muted-foreground mb-2">
              Has completado exitosamente la
            </p>
            <p className="text-2xl font-bold text-primary mb-8">
              Maestría Latinoamericana en Circulación Pulmonar
            </p>
          </div>

          <div className="bg-card p-8 rounded-lg border border-primary/20 mb-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estudiante</p>
                <p className="text-2xl font-bold">{userName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fecha de finalización</p>
                <p className="text-lg">{completionDate}</p>
              </div>
            </div>
          </div>

          <Button
            onClick={generatePDF}
            className="btn-gradient-primary gap-2"
            size="lg"
            disabled={!canDownload}
          >
            <Download className="h-5 w-5" />
            Descargar Certificado
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            Este certificado es generado automáticamente al completar todas las lecciones del programa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Certificate;