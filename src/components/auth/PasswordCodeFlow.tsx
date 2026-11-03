import { useEffect, useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { Mail, Lock, CheckCircle2, Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Step = "email" | "code" | "password" | "done";

interface Props {
  /** Pre-filled email (e.g. signed-in user in profile). */
  initialEmail?: string;
  /** When true the email can't be edited and the flow starts by sending the code. */
  lockEmail?: boolean;
  onDone?: () => void;
}

async function callFn<T = any>(name: string, body: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    let message = "Ocurrió un error. Intenta de nuevo.";
    let extra: any = {};
    if (error instanceof FunctionsHttpError) {
      try {
        extra = await error.context.json();
        if (extra?.error) message = extra.error;
      } catch {
        /* ignore */
      }
    }
    const err = new Error(message) as Error & { data?: any };
    err.data = extra;
    throw err;
  }
  return data as T;
}

export const PasswordCodeFlow = ({ initialEmail = "", lockEmail = false, onDone }: Props) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [changeToken, setChangeToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await callFn<{ expiresInSeconds: number }>("send-password-reset", { email });
      setCode("");
      setSecondsLeft(res?.expiresInSeconds ?? 60);
      setStep("code");
      toast({ title: "Código enviado", description: `Revisa ${email}. Vence en 1 minuto.` });
    } catch (err: any) {
      if (err.data?.retryAfterSeconds) {
        setSecondsLeft(err.data.retryAfterSeconds);
        setStep("code");
      }
      toast({ title: "No se pudo enviar", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (code.length !== 6) return;
    if (secondsLeft <= 0) {
      toast({ title: "Código vencido", description: "Pide un código nuevo.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await callFn<{ changeToken: string }>("verify-reset-code", {
        action: "verify",
        email,
        code,
      });
      setChangeToken(res.changeToken);
      setStep("password");
    } catch (err: any) {
      setCode("");
      if (err.data?.expired) setSecondsLeft(0);
      toast({ title: "Código no válido", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast({ title: "Contraseña muy corta", description: "Usa al menos 8 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "No coinciden", description: "Las contraseñas no son iguales.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await callFn("verify-reset-code", { action: "reset", email, changeToken, newPassword });
      setStep("done");
      toast({ title: "Contraseña actualizada", description: "Ya puedes usar tu nueva contraseña." });
    } catch (err: any) {
      if (err.data?.expired) {
        setStep("email");
        setSecondsLeft(0);
      }
      toast({ title: "No se pudo cambiar", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
        <p className="font-semibold">Tu contraseña se cambió correctamente.</p>
        {onDone && (
          <Button className="w-full btn-gradient-primary" onClick={onDone}>
            Continuar
          </Button>
        )}
      </div>
    );
  }

  if (step === "email") {
    return (
      <form onSubmit={sendCode} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resetEmail">Correo electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="resetEmail"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-background/50"
              readOnly={lockEmail}
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Te enviaremos un código de 6 dígitos. Es válido por 1 minuto.
          </p>
        </div>
        <Button type="submit" className="w-full btn-gradient-primary" disabled={loading}>
          {loading ? "Enviando..." : "Enviar código"}
        </Button>
      </form>
    );
  }

  if (step === "code") {
    const expired = secondsLeft <= 0;
    return (
      <form onSubmit={verifyCode} className="space-y-5">
        <p className="text-sm text-muted-foreground text-center">
          Escribe el código que enviamos a <span className="font-medium text-foreground">{email}</span>
        </p>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            inputMode="numeric"
            pattern="^[0-9]*$"
            disabled={loading || expired}
            autoFocus
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div
          className={`flex items-center justify-center gap-2 text-sm ${
            expired ? "text-destructive" : secondsLeft <= 15 ? "text-warning" : "text-muted-foreground"
          }`}
          aria-live="polite"
        >
          <Clock className="h-4 w-4" />
          {expired ? "El código venció" : `Vence en 0:${secondsLeft.toString().padStart(2, "0")}`}
        </div>

        <Button
          type="submit"
          className="w-full btn-gradient-primary"
          disabled={loading || expired || code.length !== 6}
        >
          {loading ? "Verificando..." : "Verificar código"}
        </Button>

        <div className="flex items-center justify-between text-sm">
          {!lockEmail ? (
            <Button type="button" variant="link" className="p-0 h-auto" onClick={() => setStep("email")}>
              Cambiar correo
            </Button>
          ) : (
            <span />
          )}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto gap-1"
            disabled={loading || !expired}
            onClick={() => sendCode()}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Enviar otro código
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={savePassword} className="space-y-4">
      <p className="text-sm text-success text-center flex items-center justify-center gap-2">
        <CheckCircle2 className="h-4 w-4" /> Código verificado. Escribe tu nueva contraseña.
      </p>
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nueva contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="newPassword"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pl-10 bg-background/50"
            minLength={8}
            autoComplete="new-password"
            required
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
            placeholder="Repite la contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 bg-background/50"
            minLength={8}
            autoComplete="new-password"
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full btn-gradient-primary" disabled={loading}>
        {loading ? "Guardando..." : "Cambiar contraseña"}
      </Button>
    </form>
  );
};

export default PasswordCodeFlow;
