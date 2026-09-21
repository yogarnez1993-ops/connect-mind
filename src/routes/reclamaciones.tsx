import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Marca } from "@/components/Marca";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/reclamaciones")({
  head: () => ({
    meta: [
      { title: "Libro de reclamaciones — Conectamente" },
      {
        name: "description",
        content:
          "Registra tu queja o reclamo en el libro de reclamaciones virtual de Conectamente.",
      },
      { property: "og:title", content: "Libro de reclamaciones — Conectamente" },
      {
        property: "og:description",
        content: "Libro de reclamaciones virtual de Conectamente, conforme a la normativa peruana.",
      },
    ],
  }),
  component: Reclamaciones,
});

function Reclamaciones() {
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    documento: "",
    email: "",
    celular: "",
    tipo: "reclamo",
    reclamo: "",
    detalle: "",
  });

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("reclamaciones").insert(form);
    if (error) return toast.error("No pudimos registrar tu reclamo");
    setEnviado(true);
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8">
      <Link to="/">
        <Marca />
      </Link>
      <div className="surface-card mx-auto mt-8 max-w-xl p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="rounded-xl bg-primary-soft p-2 text-primary">
            <BookOpen className="size-6" />
          </span>
          <h1 className="text-xl font-semibold">Libro de reclamaciones</h1>
        </div>

        {enviado ? (
          <div className="py-8 text-center">
            <p className="font-medium text-foreground">Tu reclamo quedó registrado.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Te responderemos en un plazo máximo de 30 días calendario.
            </p>
            <Link to="/" className="mt-6 inline-block text-primary underline-offset-4 hover:underline">
              Volver al inicio
            </Link>
          </div>
        ) : (
          <form onSubmit={enviar} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre completo</Label>
              <Input
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="h-12"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>DNI / documento</Label>
                <Input
                  value={form.documento}
                  onChange={(e) => setForm({ ...form, documento: e.target.value })}
                  className="h-12"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Celular</Label>
                <Input
                  value={form.celular}
                  onChange={(e) => setForm({ ...form, celular: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Correo</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-12"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reclamo">Reclamo (servicio contratado)</SelectItem>
                  <SelectItem value="queja">Queja (atención recibida)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Resumen</Label>
              <Input
                required
                value={form.reclamo}
                onChange={(e) => setForm({ ...form, reclamo: e.target.value })}
                className="h-12"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Detalle</Label>
              <Textarea
                rows={5}
                value={form.detalle}
                onChange={(e) => setForm({ ...form, detalle: e.target.value })}
              />
            </div>
            <Button type="submit" className="h-12 w-full rounded-full">
              Enviar reclamo
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
