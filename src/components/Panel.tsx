import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Marca } from "@/components/Marca";
import { cn } from "@/lib/utils";

export type ItemNav = { a: string; texto: string };

export const NAV_PACIENTE: ItemNav[] = [
  { a: "/paciente/mis-citas", texto: "Mis citas" },
  { a: "/paciente/paquetes", texto: "Paquetes" },
  { a: "/paciente/mis-pagos", texto: "Mis pagos" },
  { a: "/paciente/mi-historia", texto: "Mi historia" },
];

export const NAV_PSICOLOGO: ItemNav[] = [
  { a: "/psicologo/agenda", texto: "Agenda" },
  { a: "/psicologo/pacientes", texto: "Pacientes" },
  { a: "/psicologo/historial", texto: "Historial" },
];

export const NAV_ADMIN: ItemNav[] = [
  { a: "/admin/control-pagos", texto: "Pagos" },
  { a: "/admin/psicologos", texto: "Psicólogos" },
  { a: "/admin/pacientes", texto: "Pacientes" },
  { a: "/admin/configuracion", texto: "Configuración" },
  { a: "/admin/legal", texto: "Legal" },
];

export function Panel({
  titulo,
  descripcion,
  nav,
  extra,
  children,
}: {
  titulo: string;
  descripcion?: string;
  nav: ItemNav[];
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Marca />
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" /> Salir
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-3">
          {nav.map((i) => (
            <Link
              key={i.a}
              to={i.a}
              className="rounded-full px-4 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted"
              activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
            >
              {i.texto}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {titulo}
            </h1>
            {descripcion && <p className="mt-1 text-muted-foreground">{descripcion}</p>}
          </div>
          {extra}
        </div>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}

export function Estado({ valor }: { valor: string | null | undefined }) {
  const v = (valor ?? "").toLowerCase();
  const tono =
    v.includes("aprob") || v.includes("activo") || v.includes("complet")
      ? "bg-secondary/20 text-secondary-foreground border-secondary/40"
      : v.includes("rechaz") || v.includes("cancel")
        ? "bg-destructive/10 text-destructive border-destructive/30"
        : "bg-muted text-muted-foreground border-border";
  return (
    <span className={cn("rounded-full border px-3 py-1 text-xs font-medium capitalize", tono)}>
      {valor ?? "—"}
    </span>
  );
}

export function Vacio({ texto }: { texto: string }) {
  return (
    <div className="surface-card p-10 text-center text-muted-foreground">{texto}</div>
  );
}
