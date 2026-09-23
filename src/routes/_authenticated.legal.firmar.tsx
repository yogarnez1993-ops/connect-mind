import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession, usePerfil } from "@/hooks/useAuth";
import { Marca } from "@/components/Marca";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_authenticated/legal/firmar")({
  head: () => ({
    meta: [
      { title: "Firmar consentimiento — Conectamente" },
      {
        name: "description",
        content: "Firma el consentimiento informado de telepsicología y la Ley 29733.",
      },
      { property: "og:title", content: "Firmar consentimiento — Conectamente" },
      { property: "og:description", content: "Consentimiento informado de telepsicología." },
    ],
  }),
  component: FirmarPage,
});

function FirmarPage() {
  const navigate = useNavigate();
  const { userId } = useSession();
  const { data: perfil } = usePerfil();
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [ley, setLey] = useState(false);
  const [tele, setTele] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const { data: docs } = useQuery({
    queryKey: ["legal-firmar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_docs")
        .select("*")
        .in("tipo", ["consentimiento", "privacidad"]);
      if (error) throw error;
      return data;
    },
  });

  async function firmar() {
    if (!userId) return;
    if ((dni || perfil?.dni || "").length !== 8) {
      toast.error("El DNI debe tener 8 dígitos");
      return;
    }
    if (!nombre.trim() || !ley || !tele) {
      toast.error("Completa tu nombre y acepta ambas casillas");
      return;
    }
    setGuardando(true);
    const { error } = await supabase.from("consents").upsert({
      user_id: userId,
      dni: dni || perfil?.dni || "",
      firma_nombre: nombre.trim(),
      user_agent: navigator.userAgent,
    });
    setGuardando(false);
    if (error) {
      toast.error("No pudimos guardar tu firma. Intenta otra vez.");
      return;
    }
    toast.success("Consentimiento firmado");
    navigate({ to: "/paciente/mis-citas" });
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="px-5 pt-6">
        <Marca />
      </header>
      <section className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Consentimiento informado
        </h1>
        <p className="mt-2 text-muted-foreground">
          Antes de tu primera sesión necesitamos tu firma digital.
        </p>

        <div className="mt-6 space-y-4">
          {(docs ?? []).map((d) => (
            <div key={d.id} className="surface-card max-h-48 overflow-y-auto p-5">
              <h2 className="font-medium text-foreground">{d.titulo}</h2>
              <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">{d.contenido}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              inputMode="numeric"
              maxLength={8}
              value={dni || (perfil?.dni ?? "")}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
              className="mt-1 h-12"
            />
          </div>
          <div>
            <Label htmlFor="nombre">Nombre completo (firma)</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Escribe tu nombre tal como figura en tu DNI"
              className="mt-1 h-12"
            />
          </div>
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <Checkbox checked={ley} onCheckedChange={(v) => setLey(v === true)} />
            Autorizo el tratamiento de mis datos de salud conforme a la Ley N° 29733.
          </label>
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <Checkbox checked={tele} onCheckedChange={(v) => setTele(v === true)} />
            Acepto recibir atención por telepsicología y sé que no reemplaza una emergencia (113).
          </label>
          <Button
            disabled={guardando}
            onClick={firmar}
            className="h-14 w-full rounded-full text-base"
          >
            {guardando ? "Guardando…" : "Firmar y continuar"}
          </Button>
        </div>
      </section>
    </main>
  );
}
