import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, Column, Action } from "@/components/common/DataTable";
import { UserPlus, Trash2, Shield, User as UserIcon, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface UserWithRole {
  id: string;
  full_name: string | null;
  email: string | null;
  status: string;
  created_at: string;
  role: string;
}

export const UserManagementView = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const [profilesResult, rolesResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, status, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (rolesResult.error) throw rolesResult.error;

      const usersWithRoles: UserWithRole[] = (profilesResult.data || []).map((profile) => {
        const userRole = rolesResult.data?.find((r) => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || "student",
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setDeletingUser(true);
      const { data: session } = await supabase.auth.getSession();

      if (!session.session) {
        throw new Error("No hay sesión activa");
      }

      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { userId },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: data?.warning ? "Usuario eliminado con advertencia" : "Usuario eliminado",
        description: data?.warning || "El usuario ha sido eliminado completamente",
      });

      loadUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    } finally {
      setDeletingUser(false);
      setDeleteUserId(null);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.fullName) {
      toast({
        title: "Error",
        description: "Completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      setAddingUser(true);
      const { data: session } = await supabase.auth.getSession();

      if (!session.session) {
        throw new Error("No hay sesión activa");
      }

      // Check if email exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", newUser.email)
        .maybeSingle();

      if (existingProfile) {
        toast({
          title: "Correo ya registrado",
          description: "Este correo ya existe en el sistema.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: newUser.email,
          password: newUser.password,
          fullName: newUser.fullName,
          country: "",
          role: newUser.role,
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || "No se pudo crear el usuario");
      }

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado correctamente",
      });

      setShowAddDialog(false);
      setNewUser({ fullName: "", email: "", password: "", role: "student" });
      loadUsers();
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive",
      });
    } finally {
      setAddingUser(false);
    }
  };

  const columns: Column<UserWithRole>[] = useMemo(() => [
    {
      key: "full_name",
      header: "Nombre",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {row.role === "admin" ? (
              <Shield className="h-4 w-4 text-primary" />
            ) : (
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{row.full_name || "Sin nombre"}</p>
            <p className="text-xs text-muted-foreground truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rol",
      cell: (row) => (
        <Badge variant={row.role === "admin" ? "default" : "secondary"} className="capitalize">
          {row.role === "admin" ? "Administrador" : "Estudiante"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (row) => {
        const statusConfig = {
          approved: { label: "Aprobado", icon: CheckCircle, className: "text-success bg-success/10" },
          pending: { label: "Pendiente", icon: null, className: "text-yellow-500 bg-yellow-500/10" },
          rejected: { label: "Rechazado", icon: XCircle, className: "text-destructive bg-destructive/10" },
        };
        const config = statusConfig[row.status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;
        
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
            {Icon && <Icon className="h-3 w-3" />}
            {config.label}
          </span>
        );
      },
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
  ], []);

  const actions: Action<UserWithRole>[] = useMemo(() => [
    {
      icon: Trash2,
      label: "Eliminar usuario",
      variant: "ghost" as const,
      onClick: (row) => setDeleteUserId(row.id),
    },
  ], []);

  // Stats
  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    approved: users.filter(u => u.status === "approved").length,
    pending: users.filter(u => u.status === "pending").length,
  }), [users]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Administra los usuarios del sistema</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Agregar Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Administradores", value: stats.admins, color: "text-primary" },
          { label: "Aprobados", value: stats.approved, color: "text-success" },
          { label: "Pendientes", value: stats.pending, color: "text-yellow-500" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <Card className="p-4 lg:p-6">
        <DataTable
          data={users}
          columns={columns}
          actions={actions}
          loading={loading}
          searchable
          searchPlaceholder="Buscar por nombre o email..."
          searchKeys={["full_name", "email"]}
          emptyMessage="No hay usuarios registrados"
          pageSize={10}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el usuario y todos sus datos asociados.
              No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingUser}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingUser}
            >
              {deletingUser ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Crea un nuevo usuario con acceso al sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo *</Label>
              <Input
                id="fullName"
                value={newUser.fullName}
                onChange={(e) => setNewUser((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Juan Pérez"
                disabled={addingUser}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="usuario@ejemplo.com"
                disabled={addingUser}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                disabled={addingUser}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser((prev) => ({ ...prev, role: value }))}
                disabled={addingUser}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Estudiante</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={addingUser}>
              Cancelar
            </Button>
            <Button onClick={handleAddUser} disabled={addingUser}>
              {addingUser ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                "Crear Usuario"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
