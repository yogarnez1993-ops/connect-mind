import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useConfig } from "@/hooks/useAuth";
import { Panel, NAV_PACIENTE } from "@/components/Panel";
import { Button } from "@/components/ui/button";
import { soles, METODOS_PAGO } from "@/lib/conectamente";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/paciente/pagar/$pagoId")({
  head: () => ({
    meta: [
      { title: "Pagar tu paquete — Conectamente" },
      { name: "description", content: "Paga con Yape, Plin o transferencia y sube tu comprobante." },
      { property: "og:title", content: "Pagar tu paquete — Conectamente" },
      { property: "og:description", content: "Métodos de pago para tu paquete de terapia online." },
    ],
  }),
  component: PagarPage,
});

function PagarPage() {
  const { pagoId } = Route.useParams();
  const navigate = useNavigate();
  const { userId } = useSession();
  const { data: config } = useConfig();
  const [metodo, setMetodo] = useState<string>("Yape");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  const modoAutomatico = config?.["modo_pagos"] === "automatico";

  const { data: pago } = useQuery({
    queryKey: ["pago", pagoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pagos_paquetes")
        .select("*")
        .eq("id", pagoId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  async function yaPague() {
    if (!userId) return;
    if (!archivo) {
      toast.error("Sube la foto de tu comprobante");
      return;
    }
    setEnviando(true);
    const ruta = `${userId}/${pagoId}-${Date.now()}`;
    const { error: errSubida } = await supabase.storage.from("vouchers").upload(ruta, archivo, {
      upsert: true,
    });
    if (errSubida) {
      setEnviando(false);
      toast.error("No pudimos subir tu comprobante");
      return;
    }
    const { error } = await supabase
      .from("pagos_paquetes")
      .update({ voucher_url: ruta, metodo_pago: metodo, estado_voucher: "pendiente" })
      .eq("id", pagoId);
    setEnviando(false);
    if (error) {
      toast.error("No pudimos registrar tu pago");
      return;
    }
    toast.success("Comprobante enviado. Lo revisaremos muy pronto.");
    navigate({ to: "/paciente/espera" });
  }

  return (
    <Panel titulo="Completa tu pago" descripcion="Tu paquete se activa cuando validemos el pago." nav={NAV_PACIENTE}>
      <div className="grid gap-6 pb-10 lg:grid-cols-2">
        <section className="surface-card p-6">
          <h2 className="font-medium text-foreground">Resumen</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {pago?.sesiones_totales} sesiones · categoría {pago?.tipo_terapia}
            {pago?.problema ? ` · ${pago.problema}` : ""}
          </p>
          <p className="mt-4 font-display text-3xl font-semibold text-primary">
            {soles(pago?.monto_pagado ?? 0)}
          </p>
        </section>

        {modoAutomatico ? (
          <section className="surface-card p-6">
            <h2 className="font-medium text-foreground">Pago con tarjeta</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              El cobro con tarjeta está activado. Se abrirá la pasarela configurada por el
              administrador.
            </p>
            <Button className="mt-4 h-12 w-full rounded-full" disabled>
              Pagar con tarjeta (pendiente de credenciales)
            </Button>
          </section>
        ) : (
          <section className="surface-card p-6">
            <h2 className="font-medium text-foreground">Paga y sube tu comprobante</h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {METODOS_PAGO.map((m) => (
                <button
                  key={m}
                  onClick={() => setMetodo(m)}
                  className={cn(
                    "rounded-full border border-border px-4 py-2 text-sm",
                    metodo === m ? "border-primary bg-primary text-primary-foreground" : "bg-card",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-2 rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
              {config?.["yape_qr_url"] ? (
                <img
                  src={config["yape_qr_url"]}
                  alt="QR de Yape de Conectamente"
                  className="mx-auto size-48 rounded-xl object-contain"
                />
              ) : null}
              <p>Yape: {config?.["yape_numero"] || "por configurar"}</p>
              <p>Plin: {config?.["plin_numero"] || "por configurar"}</p>
              <p>BCP: {config?.["bcp_cuenta"] || "por configurar"}</p>
              <p>CCI: {config?.["bcp_cci"] || "por configurar"}</p>
            </div>

            <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              <Upload className="size-5" />
              {archivo ? archivo.name : "Subir foto del comprobante"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              />
            </label>

            <Button
              onClick={yaPague}
              disabled={enviando}
              className="mt-4 h-14 w-full rounded-full text-base"
            >
              <CheckCircle2 className="mr-2 size-5" />
              {enviando ? "Enviando…" : "Ya pagué"}
            </Button>
          </section>
        )}
      </div>
    </Panel>
  );
}
