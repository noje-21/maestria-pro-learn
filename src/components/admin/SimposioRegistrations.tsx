import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type SimposioRegistro = {
  id: string;
  nombre: string;
  correo: string;
  pais: string;
  telefono: string | null;
  modalidad: string;
  documento: string;
  created_at: string;
};

const SimposioRegistrations = () => {
  const [registros, setRegistros] = useState<SimposioRegistro[]>([]);
  const [filteredRegistros, setFilteredRegistros] = useState<SimposioRegistro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistros();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRegistros(registros);
    } else {
      const filtered = registros.filter(
        (reg) =>
          reg.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.pais.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRegistros(filtered);
    }
  }, [searchTerm, registros]);

  const fetchRegistros = async () => {
    try {
      const { data, error } = await supabase
        .from("simposio_registros")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRegistros(data || []);
      setFilteredRegistros(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los registros del simposio.",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (filteredRegistros.length === 0) {
      toast({
        variant: "destructive",
        title: "Sin datos",
        description: "No hay registros para exportar.",
      });
      return;
    }

    const headers = ["Nombre", "Correo", "País", "Documento/DNI", "Teléfono", "Modalidad", "Fecha de Registro"];
    const csvContent = [
      headers.join(","),
      ...filteredRegistros.map((reg) =>
        [
          `"${reg.nombre}"`,
          `"${reg.correo}"`,
          `"${reg.pais}"`,
          `"${reg.documento}"`,
          `"${reg.telefono || "N/A"}"`,
          `"${reg.modalidad}"`,
          `"${new Date(reg.created_at).toLocaleString()}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `simposio_registros_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportación exitosa",
      description: "Los registros se han exportado correctamente.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-2xl text-primary">Registros del Simposio</CardTitle>
          <CardDescription>
            Vista de todos los registros al 4to Simposio Latinoamericano de Hipertensión Pulmonar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, correo o país..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando registros...</div>
          ) : filteredRegistros.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No se encontraron registros con ese criterio" : "No hay registros todavía"}
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold">Nombre</TableHead>
                      <TableHead className="font-semibold">Correo</TableHead>
                      <TableHead className="font-semibold">País</TableHead>
                      <TableHead className="font-semibold">Documento/DNI</TableHead>
                      <TableHead className="font-semibold">Teléfono</TableHead>
                      <TableHead className="font-semibold">Modalidad</TableHead>
                      <TableHead className="font-semibold">Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistros.map((registro, index) => (
                      <TableRow key={registro.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/10"}>
                        <TableCell className="font-medium">{registro.nombre}</TableCell>
                        <TableCell>{registro.correo}</TableCell>
                        <TableCell>{registro.pais}</TableCell>
                        <TableCell className="font-mono text-sm">{registro.documento}</TableCell>
                        <TableCell>{registro.telefono || "N/A"}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={registro.modalidad === "presencial" ? "default" : "secondary"}
                            className={registro.modalidad === "presencial" ? "bg-primary" : "bg-secondary"}
                          >
                            {registro.modalidad}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(registro.created_at).toLocaleDateString("es-AR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground flex items-center gap-2 pt-2 border-t border-border/50">
            <span>Total de registros:</span>
            <span className="font-bold text-primary text-lg">{filteredRegistros.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimposioRegistrations;
