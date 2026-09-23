import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Marca } from "@/components/Marca";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Información legal — Conectamente" },
      {
        name: "description",
        content:
          "Política de privacidad (Ley 29733), términos, consentimiento de telepsicología, libro de reclamaciones y código de ética CPSP.",
      },
      { property: "og:title", content: "Información legal — Conectamente" },
      {
        property: "og:description",
        content: "Documentos legales de Conectamente para pacientes y psicólogos en Perú.",
      },
    ],
  }),
  component: LegalPage,
});

function LegalPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["legal-docs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("legal_docs").select("*").order("tipo");
      if (error) throw error;
      return data;
    },
  });

  return (
    <main className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-5 pt-6">
        <Marca />
        <Link to="/" className="text-sm text-muted-foreground">
          Inicio
        </Link>
      </header>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-display text-3xl font-semibold text-foreground">Información legal</h1>
        <p className="mt-2 text-muted-foreground">
          Psicólogos colegiados y habilitados (CPSP) · Telepsicología según guía CPSP · No reemplaza
          una emergencia: llama al 113.
        </p>
        <div className="mt-8 space-y-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
            : (data ?? []).map((d) => (
                <article key={d.id} className="surface-card p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground">{d.titulo}</h2>
                  <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                    {d.contenido}
                  </p>
                </article>
              ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link to="/legal/firmar" className="text-primary underline-offset-4 hover:underline">
            Firmar consentimiento
          </Link>
          <Link to="/reclamaciones" className="text-primary underline-offset-4 hover:underline">
            Libro de reclamaciones
          </Link>
        </div>
      </section>
    </main>
  );
}
