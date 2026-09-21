import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useConfig, useSession } from "@/hooks/useAuth";
import { Marca } from "@/components/Marca";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Crear cuenta o ingresar — Conectamente" },
      {
        name: "description",
        content: "Crea tu cuenta en Conectamente y agenda tu primera sesión psicológica online.",
      },
      { property: "og:title", content: "Crear cuenta o ingresar — Conectamente" },
      {
        property: "og:description",
        content: "Accede a tu espacio en Conectamente para agendar y ver tus sesiones.",
      },
    ],
  }),
  component: Auth,
});

function TextoLegal({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="text-primary underline underline-offset-2">
          {titulo}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <p className="text-sm whitespace-pre-line text-muted-foreground">{texto}</p>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function Auth() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { data: config } = useConfig();
  const [modo, setModo] = useState<"registro" | "login">("registro");
  const [ver, setVer] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    dni: "",
    celular: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (session) navigate({ to: "/categoria" });
  }, [session, navigate]);

  function set(campo: keyof typeof form, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[0-9]{8}$/.test(form.dni)) return toast.error("El DNI debe tener 8 dígitos");
    if (!/^9[0-9]{8}$/.test(form.celular))
      return toast.error("El celular debe tener 9 dígitos y empezar con 9");
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password))
      return toast.error("La contraseña necesita 8 caracteres, una mayúscula y un número");
    if (!acepta) return toast.error("Debes aceptar las políticas y el consentimiento");

    setCargando(true);
    const problemas = JSON.parse(localStorage.getItem("problemas_elegidos") ?? "[]");
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nombre: form.nombre, dni: form.dni, celular: form.celular },
      },
    });
    if (error) {
      setCargando(false);
      return toast.error(error.message);
    }
    const { data: s } = await supabase.auth.getSession();
    if (s.session) {
      await supabase
        .from("profiles")
        .update({ problemas_elegidos: problemas, acepto_politicas: true })
        .eq("id", s.session.user.id);
      toast.success("¡Cuenta creada!");
      navigate({ to: "/categoria" });
    } else {
      toast.success("Revisa tu correo para confirmar tu cuenta.");
    }
    setCargando(false);
  }

  async function ingresar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setCargando(false);
    if (error) return toast.error("Correo o contraseña incorrectos");
    toast.success("Bienvenido de vuelta");
    navigate({ to: "/categoria" });
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) return toast.error("No pudimos iniciar sesión con Google");
    if (result.redirected) return;
    navigate({ to: "/categoria" });
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-5 py-8">
      <Link to="/">
        <Marca />
      </Link>
      <div className="surface-card mt-8 w-full max-w-md p-6">
        <div className="mb-6 flex rounded-full bg-muted p-1">
          {(["registro", "login"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
                modo === m ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              {m === "registro" ? "Crear cuenta" : "Ingresar"}
            </button>
          ))}
        </div>

        <form onSubmit={modo === "registro" ? registrar : ingresar} className="space-y-4">
          {modo === "registro" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  required
                  value={form.nombre}
                  onChange={(e) => set("nombre", e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dni">DNI</Label>
                  <Input
                    id="dni"
                    required
                    inputMode="numeric"
                    maxLength={8}
                    value={form.dni}
                    onChange={(e) => set("dni", e.target.value.replace(/\D/g, ""))}
                    className="h-12"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    required
                    inputMode="numeric"
                    maxLength={9}
                    value={form.celular}
                    onChange={(e) => set("celular", e.target.value.replace(/\D/g, ""))}
                    className="h-12"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={ver ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="h-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setVer(!ver)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                aria-label="Mostrar contraseña"
              >
                {ver ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

          {modo === "registro" && (
            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <Checkbox
                checked={acepta}
                onCheckedChange={(v) => setAcepta(v === true)}
                className="mt-0.5"
              />
              <span>
                Acepto las{" "}
                <TextoLegal
                  titulo="Políticas de privacidad"
                  texto={config?.["texto_politicas"] ?? ""}
                />
                , el{" "}
                <TextoLegal
                  titulo="Consentimiento informado"
                  texto={config?.["texto_consentimiento"] ?? ""}
                />{" "}
                y los{" "}
                <TextoLegal
                  titulo="Términos y condiciones"
                  texto={config?.["texto_terminos"] ?? ""}
                />{" "}
                (Ley 29733).
              </span>
            </label>
          )}

          <Button type="submit" disabled={cargando} className="h-12 w-full rounded-full text-base">
            {cargando && <Loader2 className="mr-2 size-4 animate-spin" />}
            {modo === "registro" ? "Crear cuenta" : "Ingresar"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="h-12 w-full rounded-full" onClick={google}>
          Continuar con Google
        </Button>
      </div>
    </main>
  );
}
