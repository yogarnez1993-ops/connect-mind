import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useAuth";
import { Panel, NAV_PACIENTE, Estado } from "@/components/Panel";

export const Route = createFileRoute("/_authenticated/paciente/espera")({
  head: () => ({
    meta: [
      { title: "Estamos asignando tu psicólogo — Conectamente" },
      {
        name: "description",
        content: "Validamos tu pago y te asignamos un psicólogo colegiado verificado.",
      },
      { property: "og:title", content: "Estamos asignando tu psicólogo — Conectamente" },
      { property: "og:description", content: "Tu pago está en revisión, te avisamos apenas terminemos." },
    ],
  }),
  component: EsperaPage,
});

function EsperaPage() {
  const { userId } = useSession();
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: pago } = useQuery({
    queryKey: ["pago-en-espera", userId],
    enabled: !!userId,
    refetchInterval: 15000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pagos_paquetes")
        .select("*")
        .eq("paciente_id", userId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const mm = String(Math.floor(segundos / 60)).padStart(2, "0");
  const ss = String(segundos % 60).padStart(2, "0");
  const aprobado = pago?.estado === "activo";

  return (
    <Panel titulo="Esperando asignación" descripcion="Tu pago está siendo verificado." nav={NAV_PACIENTE}>
      <div className="surface-card mx-auto max-w-lg p-8 text-center">
        {aprobado ? (
          <>
            <ShieldCheck className="mx-auto size-14 text-secondary" />
            <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
              ¡Pago aprobado!
            </h2>
            <p className="mt-2 text-muted-foreground">
              Ya puedes agendar tus sesiones desde Mis citas.
            </p>
            <Link
              to="/paciente/mis-citas"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-primary-foreground"
            >
              Ir a mis citas
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto size-14 animate-spin text-primary" />
            <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
              Esperando la asignación de tu psicólogo verificado
            </h2>
            <p className="mt-2 text-muted-foreground">
              Revisamos tu comprobante y te asignamos un profesional colegiado y habilitado.
            </p>
            <p className="mt-6 font-display text-4xl font-semibold text-primary">
              {mm}:{ss}
            </p>
            <div className="mt-4">
              <Estado valor={pago?.estado_voucher ?? "pendiente"} />
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}
