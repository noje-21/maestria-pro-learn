import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, Column } from "@/components/common/DataTable";
import BulkEmailSender from "./BulkEmailSender";
import { Download, Mail, Users, Globe, Calendar } from "lucide-react";
import { motion } from "framer-motion";

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
  const [loading, setLoading] = useState(true);
  const [filterModalidad, setFilterModalidad] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistros();
  }, []);

  const fetchRegistros = async () => {
    try {
      const { data, error } = await supabase
        .from("simposio_registros")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistros(data || []);
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

  const filteredRegistros = useMemo(() => {
    if (filterModalidad === "all") return registros;
    return registros.filter((r) => r.modalidad === filterModalidad);
  }, [registros, filterModalidad]);

  const stats = useMemo(() => {
    const total = registros.length;
    const presencial = registros.filter((r) => r.modalidad === "presencial").length;
    const virtual = registros.filter((r) => r.modalidad === "virtual").length;
    const paises = new Set(registros.map((r) => r.pais)).size;

    return { total, presencial, virtual, paises };
  }, [registros]);

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
    link.href = URL.createObjectURL(blob);
    link.download = `simposio_registros_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({
      title: "Exportación exitosa",
      description: `Se exportaron ${filteredRegistros.length} registros.`,
    });
  };

  const columns: Column<SimposioRegistro>[] = useMemo(
    () => [
      {
        key: "nombre",
        header: "Participante",
        cell: (row) => (
          <div className="min-w-0">
            <p className="font-medium truncate">{row.nombre}</p>
            <p className="text-xs text-muted-foreground truncate">{row.correo}</p>
          </div>
        ),
      },
      {
        key: "pais",
        header: "País",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm">{row.pais}</span>
          </div>
        ),
      },
      {
        key: "modalidad",
        header: "Modalidad",
        cell: (row) => (
          <Badge
            variant={row.modalidad === "presencial" ? "default" : "secondary"}
            className={row.modalidad === "presencial" ? "bg-primary/20 text-primary" : ""}
          >
            {row.modalidad === "presencial" ? "Presencial" : "Virtual"}
          </Badge>
        ),
      },
      {
        key: "documento",
        header: "Documento",
        cell: (row) => <span className="text-sm font-mono">{row.documento}</span>,
      },
      {
        key: "telefono",
        header: "Teléfono",
        cell: (row) => (
          <span className="text-sm text-muted-foreground">{row.telefono || "-"}</span>
        ),
      },
      {
        key: "created_at",
        header: "Registro",
        cell: (row) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.created_at).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        ),
      },
    ],
    []
  );

  const statsCards = [
    { label: "Total Registros", value: stats.total, icon: Users, color: "text-primary", bgColor: "bg-primary/10" },
    { label: "Presencial", value: stats.presencial, icon: Calendar, color: "text-success", bgColor: "bg-success/10" },
    { label: "Virtual", value: stats.virtual, icon: Globe, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { label: "Países", value: stats.paises, icon: Globe, color: "text-secondary", bgColor: "bg-secondary/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Registros del Simposio</h2>
          <p className="text-muted-foreground">Gestiona los participantes del simposio</p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="registros">
        <TabsList>
          <TabsTrigger value="registros" className="gap-2">
            <Users className="h-4 w-4" />
            Registros
          </TabsTrigger>
          <TabsTrigger value="emails" className="gap-2">
            <Mail className="h-4 w-4" />
            Enviar Correos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registros" className="mt-4">
          <Card className="p-4 lg:p-6">
            {/* Filter */}
            <div className="mb-4">
              <Select value={filterModalidad} onValueChange={setFilterModalidad}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por modalidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las modalidades</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DataTable
              data={filteredRegistros}
              columns={columns}
              loading={loading}
              searchable
              searchPlaceholder="Buscar por nombre, correo o país..."
              searchKeys={["nombre", "correo", "pais"]}
              emptyMessage="No hay registros disponibles"
              pageSize={15}
            />
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="mt-4">
          <BulkEmailSender registros={filteredRegistros} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimposioRegistrations;
