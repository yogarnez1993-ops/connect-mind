import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useAuth";
import { Marca } from "@/components/Marca";
import { Button } from "@/components/ui/button";
import { CATEGORIAS, CATEGORIA_INFO, soles } from "@/lib/conectamente";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/categoria")({
  head: () => ({
    meta: [
      { title: "Elige tu categoría — Conectamente" },
      {
        name: "description",
        content:
          "Elige la categoría de acompañamiento que mejor se ajusta a ti: Social, Medium o Premium.",
      },
      { property: "og:title", content: "Elige tu categoría — Conectamente" },
      {
        property: "og:description",
        content: "Social, Medium o Premium: elige cómo quieres iniciar tu terapia online.",
      },
    ],
  }),
  component: CategoriaPage,
});

function CategoriaPage() {
  const navigate = useNavigate();
  const { userId } = useSession();
  const [elegida, setElegida] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function continuar() {
    if (!elegida || !userId) return;
    setGuardando(true);
    const { error } = await supabase
      .from("profiles")
      .update({ categoria: elegida })
      .eq("id", userId);
    setGuardando(false);
    if (error) {
      toast.error("No pudimos guardar tu elección. Intenta otra vez.");
      return;
    }
    toast.success(`Elegiste la categoría ${elegida}`);
    navigate({ to: "/" });
  }

  return (
    <main className="min-h-screen bg-background pb-32">
      <header className="flex items-center justify-between px-5 pt-6">
        <Marca />
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="size-4" /> Inicio
        </Link>
      </header>

      <section className="mx-auto max-w-4xl px-5 pt-10">
        <h1 className="text-3xl leading-tight font-semibold text-foreground sm:text-4xl">
          Elige tu categoría
        </h1>
        <p className="mt-2 text-muted-foreground">
          Todas incluyen psicólogos colegiados. Puedes cambiarla más adelante.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIAS.map((c) => {
            const info = CATEGORIA_INFO[c];
            const activo = elegida === c;
            return (
              <button
                key={c}
                onClick={() => setElegida(c)}
                className={cn(
                  "surface-card flex flex-col gap-2 p-5 text-left transition-all",
                  activo && "border-primary ring-2 ring-primary/30",
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="font-display text-xl font-semibold text-foreground">
                    {info.titulo}
                  </span>
                  {activo && <Check className="size-5 text-primary" />}
                </span>
                <span className="text-sm text-muted-foreground">{info.resumen}</span>
                <span className="mt-2 text-lg font-semibold text-primary">
                  Desde {soles(info.desde)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto max-w-4xl">
          <Button
            disabled={!elegida || guardando}
            onClick={continuar}
            className="h-14 w-full rounded-full text-base"
          >
            {guardando ? "Guardando…" : "Continuar"}
          </Button>
        </div>
      </div>
    </main>
  );
}
