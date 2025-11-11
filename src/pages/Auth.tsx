import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Mail, Lock, ArrowLeft, User, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { signUpSchema, signInSchema } from "@/lib/validations";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const { signIn, signUp } = useAuth();

  // Password reset states
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStep, setResetStep] = useState<"email" | "code">("email");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Validate sign in
        const validation = signInSchema.safeParse({ email, password });
        if (!validation.success) {
          toast({
            title: "Error de validación",
            description: validation.error.issues[0].message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        await signIn(email, password);
      } else {
        // Validate sign up
        const validation = signUpSchema.safeParse({ email, password, fullName, country });
        if (!validation.success) {
          toast({
            title: "Error de validación",
            description: validation.error.issues[0].message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        await signUp(email, password, fullName, country);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke("send-password-reset", {
        body: { email: resetEmail },
      });

      if (error) throw error;

      toast({
        title: "Código enviado",
        description: "Revisa tu correo para obtener el código de verificación",
      });

      setResetStep("code");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el código de recuperación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke("verify-reset-code", {
        body: {
          email: resetEmail,
          code: resetCode,
          newPassword: newPassword,
        },
      });

      if (error) throw error;

      toast({
        title: "Contraseña actualizada",
        description:
          "Tu contraseña ha sido actualizada correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.",
      });

      // Reset form and go back to login
      setShowPasswordReset(false);
      setResetStep("email");
      setResetEmail("");
      setResetCode("");
      setNewPassword("");
      setConfirmPassword("");
      setIsLogin(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo verificar el código",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showPasswordReset) {
    return (
      <div className="min-h-screen bg-gradient-dark relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

        <div className="relative z-10 w-full max-w-md mx-4">
          <Button
            variant="ghost"
            onClick={() => {
              setShowPasswordReset(false);
              setResetStep("email");
            }}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio de sesión
          </Button>

          <div className="glass-card p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold">
                {resetStep === "email" ? "Recuperar contraseña" : "Verificar código"}
              </h1>
              <p className="text-muted-foreground">
                {resetStep === "email"
                  ? "Ingresa tu correo electrónico registrado"
                  : "Ingresa el código enviado a tu correo"}
              </p>
            </div>

            {resetStep === "email" ? (
              <form onSubmit={handlePasswordResetRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="tu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-10 bg-background/50"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full btn-gradient-primary" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar código"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordResetVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetCode">Código de verificación</Label>
                  <Input
                    id="resetCode"
                    type="text"
                    placeholder="123456"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="bg-background/50 text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 bg-background/50"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-background/50"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full btn-gradient-primary" disabled={loading}>
                  {loading ? "Verificando..." : "Actualizar contraseña"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div className="glass-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">{isLogin ? "Bienvenido de nuevo" : "Crear cuenta"}</h1>
            <p className="text-muted-foreground">
              {isLogin ? "Ingresa tus credenciales para continuar" : "Regístrate para comenzar tu aprendizaje"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Dr. Juan Pérez"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 bg-background/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="country"
                      type="text"
                      placeholder="Argentina, Colombia, México..."
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="pl-10 bg-background/50"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background/50"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <Button
                  type="button"
                  variant="link"
                  className="text-primary text-sm p-0 h-auto"
                  onClick={() => setShowPasswordReset(true)}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>
            )}

            <Button type="submit" className="w-full btn-gradient-primary" disabled={loading}>
              {loading ? "Procesando..." : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
            </Button>
          </form>

          {/*<div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
            </span>{" "}
            <Button
              type="button"
              variant="link"
              className="text-primary p-0 h-auto"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Regístrate" : "Inicia sesión"}
            </Button>
          </div>*/}
        </div>
      </div>
    </div>
  );
};

export default Auth;
