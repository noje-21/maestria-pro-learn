import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { UserPlus, Trash2, Shield, User as UserIcon } from "lucide-react";

interface UserWithRole {
  id: string;
  full_name: string | null;
  email: string | null;
  status: string;
  created_at: string;
  role: string;
}

export const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
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

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, status, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
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
      // Call edge function to delete user from both profiles and auth
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

      if (data?.warning) {
        toast({
          title: "Usuario eliminado con advertencia",
          description: data.warning,
        });
      } else {
        toast({
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado completamente",
        });
      }

      loadUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    } finally {
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
      // Get current session
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        throw new Error("No hay sesión activa");
      }

      // Pre-chequeo: evitar 409 si ya existe en profiles
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", newUser.email)
        .maybeSingle();

      if (profileCheckError) throw profileCheckError;

      if (existingProfile) {
        toast({
          title: "Correo ya registrado",
          description: "Este correo ya existe en el sistema. Elimina primero al usuario o usa Recuperar contraseña.",
          variant: "destructive",
        });
        return;
      }

      // Call edge function to create user
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
      setNewUser({
        fullName: "",
        email: "",
        password: "",
        role: "student",
      });
      loadUsers();
    } catch (error: any) {
      console.error("Error adding user:", error);
      const rawMsg = String(error?.message || "");
      const isEmailExists =
        rawMsg.includes("El usuario ya existe") ||
        rawMsg.includes("already been registered") ||
        rawMsg.includes("User already registered");

      toast({
        title: isEmailExists ? "Correo ya registrado" : "Error",
        description: isEmailExists
          ? "Este correo ya está registrado. Si es un reingreso, elimina primero al usuario desde el panel o usa Recuperar contraseña."
          : rawMsg || "No se pudo crear el usuario",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-background/50 rounded-lg border border-border">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground font-medium">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h2>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Agregar Usuario
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground truncate">
                    {user.full_name || "Sin nombre"}
                  </h3>
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                      user.role === "admin"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {user.role === "admin" ? (
                      <Shield className="h-3 w-3" />
                    ) : (
                      <UserIcon className="h-3 w-3" />
                    )}
                    {user.role === "admin" ? "Administrador" : "Estudiante"}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      user.status === "approved"
                        ? "bg-success/20 text-success"
                        : user.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {user.status === "approved"
                      ? "Aprobado"
                      : user.status === "pending"
                      ? "Pendiente"
                      : "Rechazado"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Registrado: {new Date(user.created_at).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteUserId(user.id)}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

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
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
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
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                value={newUser.fullName}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, fullName: e.target.value }))
                }
                placeholder="Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="usuario@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña Temporal</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser((prev) => ({ ...prev, role: value }))}
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
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddUser}>Crear Usuario</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
