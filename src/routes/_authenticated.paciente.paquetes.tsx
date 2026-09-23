import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, usePerfil } from "@/hooks/useAuth";
import { Panel, NAV_PACIENTE } from "@/components/Panel";
import { Button } from "@/components/ui/button";
import { CATEGORIAS, CATEGORIA_INFO, soles, type Categoria } from "@/lib/conectamente";
import { calcularPaquete, MAX_SESIONES, MIN_SESIONES } from "@/lib/precios";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/paciente/paquetes")({
  head: () => ({
    meta: [
      { title: "Arma tu paquete — Conectamente" },
      {
        name: "description",
        content: "Elige tu motivo de consulta, tu categoría y cuántas sesiones quieres contratar.",
      },
      { property: "og:title", content: "Arma tu paquete — Conectamente" },
      { property: "og:description", content: "Paquetes de terapia online desde 2 hasta 15 sesiones." },
    ],
  }),
  component: PaquetesPage,
});

function PaquetesPage() {
  const navigate = useNavigate();
  const { userId } = useSession();
  const { data: perfil } = usePerfil();
  const [problema, setProblema] = useState<string | null>(null);
  const [categoria, setCategoria] = useState<Categoria>(
    (perfil?.categoria as Categoria) ?? "Social",
  );
  const [cantidad, setCantidad] = useState(4);
  const [creando, setCreando] = useState(false);

  const { data: problemas } = useQuery({
    queryKey: ["problemas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("problemas_psicologicos")
        .select("*")
        .eq("activo", true)
        .order("orden");
      if (error) throw error;
      return data;
    },
  });

  const resumen = calcularPaquete(categoria, cantidad);

  async function pagar() {
    if (!userId) return;
    if (!problema) {
      toast.error("Elige el motivo de tu consulta");
      return;
    }
    setCreando(true);
    const { data, error } = await supabase
      .from("pagos_paquetes")
      .insert({
        paciente_id: userId,
        problema,
        tipo_terapia: categoria,
        sesiones_totales: cantidad,
        monto_pagado: resumen.total,
        metodo_pago: "Yape",
        estado: "pendiente_aprobacion",
        estado_voucher: "pendiente",
      })
      .select("id")
      .single();
    setCreando(false);
    if (error || !data) {
      toast.error("No pudimos crear tu pedido. Intenta otra vez.");
      return;
    }
    navigate({ to: "/paciente/pagar/$pagoId", params: { pagoId: data.id } });
  }

  return (
    <Panel titulo="Arma tu paquete" descripcion="Elige motivo, categoría y número de sesiones." nav={NAV_PACIENTE}>
      <section className="space-y-8 pb-28">
        <div>
          <h2 className="font-medium text-foreground">1. ¿Qué quieres trabajar?</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(problemas ?? []).map((p) => (
              <button
                key={p.id}
                onClick={() => setProblema(p.nombre)}
                className={cn(
                  "rounded-full border border-border px-4 py-2 text-sm transition-colors",
                  problema === p.nombre
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground",
                )}
              >
                {p.nombre}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-medium text-foreground">2. Categoría</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {CATEGORIAS.map((c) => (
              <button
                key={c}
                onClick={() => setCategoria(c)}
                className={cn(
                  "surface-card p-4 text-left",
                  categoria === c && "border-primary ring-2 ring-primary/30",
                )}
              >
                <span className="block font-display text-lg font-semibold text-foreground">
                  {CATEGORIA_INFO[c].titulo}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {CATEGORIA_INFO[c].resumen}
                </span>
                <span className="mt-2 block font-semibold text-primary">
                  {soles(CATEGORIA_INFO[c].desde)} por sesión
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-medium text-foreground">3. ¿Cuántas sesiones?</h2>
          <div className="surface-card mt-3 flex items-center justify-between p-5">
            <Button
              variant="outline"
              size="icon"
              className="size-12 rounded-full"
              onClick={() => setCantidad((n) => Math.max(MIN_SESIONES, n - 1))}
            >
              <Minus className="size-5" />
            </Button>
            <div className="text-center">
              <p className="font-display text-4xl font-semibold text-foreground">{cantidad}</p>
              <p className="text-sm text-muted-foreground">sesiones</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="size-12 rounded-full"
              onClick={() => setCantidad((n) => Math.min(MAX_SESIONES, n + 1))}
            >
              <Plus className="size-5" />
            </Button>
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {cantidad} × {soles(resumen.precioSesion)}
            </span>
            <span>{soles(resumen.bruto)}</span>
          </div>
          {resumen.ahorro > 0 && (
            <div className="mt-1 flex justify-between text-sm font-medium text-secondary-foreground">
              <span>Ahorras {resumen.porcentaje}%</span>
              <span>− {soles(resumen.ahorro)}</span>
            </div>
          )}
          <div className="mt-3 flex items-end justify-between border-t border-border pt-3">
            <span className="font-medium text-foreground">Total</span>
            <span className="font-display text-2xl font-semibold text-primary">
              {soles(resumen.total)}
            </span>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto max-w-6xl">
          <Button
            disabled={creando}
            onClick={pagar}
            className="h-14 w-full rounded-full text-base"
          >
            {creando ? "Creando pedido…" : `Pagar ${soles(resumen.total)}`}
          </Button>
        </div>
      </div>
    </Panel>
  );
}
