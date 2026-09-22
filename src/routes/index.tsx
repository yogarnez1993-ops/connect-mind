import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useConfig, useSession } from "@/hooks/useAuth";
import { Logo, Marca } from "@/components/Marca";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Conectamente — ¿Qué estás sintiendo hoy?" },
      {
        name: "description",
        content:
          "Cuéntanos qué te pasa y te conectamos con un psicólogo colegiado en Perú. Sesiones online desde S/ 20.",
      },
      { property: "og:title", content: "Conectamente — ¿Qué estás sintiendo hoy?" },
      {
        property: "og:description",
        content: "Terapia psicológica online con psicólogos colegiados en Perú.",
      },
    ],
  }),
  component: Inicio,
});

const SLIDES = [
  {
    titulo: "Habla con un psicólogo colegiado",
    texto: "Profesionales verificados por su número de colegiatura (CNP).",
    icono: "ShieldCheck",
  },
  {
    titulo: "Desde donde estés",
    texto: "Sesiones de 50 minutos por videollamada, sin filas ni traslados.",
    icono: "Video",
  },
  {
    titulo: "A tu medida",
    texto: "Elige tu categoría y paga con Yape, Plin, transferencia o tarjeta.",
    icono: "HeartHandshake",
  },
];

function Icono({ nombre, className }: { nombre: string; className?: string }) {
  const Comp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
    nombre
  ];
  const Fallback = Icons.Heart;
  const C = Comp ?? Fallback;
  return <C className={className ?? ""} />;
}

function Inicio() {
  const [fase, setFase] = useState<"splash" | "onboarding" | "bienvenida">("splash");
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      const visto = typeof window !== "undefined" && localStorage.getItem("onboarding_visto");
      setFase(visto ? "bienvenida" : "onboarding");
    }, 1700);
    return () => clearTimeout(t);
  }, []);

  if (fase === "splash") {
    return (
      <main className="brand-gradient flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="animate-in fade-in zoom-in rounded-3xl bg-background/95 p-6 duration-700">
          <Logo size={96} />
        </div>
        <p className="animate-in fade-in font-display text-2xl font-semibold text-primary-foreground delay-300 duration-700">
          Conectamente
        </p>
        <p className="text-sm text-primary-foreground/80">Te escuchamos</p>
      </main>
    );
  }

  if (fase === "onboarding") {
    const s = SLIDES[slide]!;
    const ultimo = slide === SLIDES.length - 1;
    return (
      <main className="flex min-h-screen flex-col justify-between bg-background px-6 py-10">
        <div className="flex justify-end">
          <button
            className="text-sm text-muted-foreground"
            onClick={() => {
              localStorage.setItem("onboarding_visto", "1");
              setFase("bienvenida");
            }}
          >
            Saltar
          </button>
        </div>
        <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center text-center">
          <div className="mb-8 rounded-3xl bg-primary-soft p-8">
            <Icono nombre={s.icono} className="size-16 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{s.titulo}</h1>
          <p className="mt-3 text-muted-foreground">{s.texto}</p>
        </div>
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex justify-center gap-2">
            {SLIDES.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === slide ? "w-8 bg-primary" : "w-2 bg-border",
                )}
              />
            ))}
          </div>
          <Button
            className="h-14 w-full rounded-full text-base"
            onClick={() => {
              if (ultimo) {
                localStorage.setItem("onboarding_visto", "1");
                setFase("bienvenida");
              } else setSlide(slide + 1);
            }}
          >
            {ultimo ? "Empezar" : "Siguiente"}
          </Button>
        </div>
      </main>
    );
  }

  return <Bienvenida />;
}

function Bienvenida() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { data: config } = useConfig();
  const [busqueda, setBusqueda] = useState("");
  const [debounced, setDebounced] = useState("");
  const [elegidos, setElegidos] = useState<string[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(busqueda), 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => {
    const guardado = localStorage.getItem("problemas_elegidos");
    if (guardado) setElegidos(JSON.parse(guardado));
  }, []);

  const { data: problemas, isLoading } = useQuery({
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

  const filtrados = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return problemas ?? [];
    return (problemas ?? []).filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.descripcion_corta ?? "").toLowerCase().includes(q),
    );
  }, [problemas, debounced]);

  function alternar(nombre: string) {
    setElegidos((prev) => {
      const nuevo = prev.includes(nombre) ? prev.filter((n) => n !== nombre) : [...prev, nombre];
      localStorage.setItem("problemas_elegidos", JSON.stringify(nuevo));
      return nuevo;
    });
  }

  return (
    <main className="min-h-screen bg-background pb-32">
      <header className="flex items-center justify-between px-5 pt-6">
        <Marca />
        <Link
          to="/auth"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {session ? "Mi cuenta" : "Ingresar"}
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-5 pt-10">
        <h1 className="text-3xl leading-tight font-semibold text-foreground sm:text-4xl">
          {config?.["titulo_sentimiento"] ?? "¿Qué estás sintiendo hoy?"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Marca lo que te está pasando. Nadie más lo verá hasta que tú lo decidas.
        </p>

        <div className="relative mt-6">
          <Icons.Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={config?.["placeholder_buscador"] ?? "Escribe lo que te pasa"}
            className="h-14 rounded-2xl pl-12 text-base"
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))
            : filtrados.map((p) => {
                const activo = elegidos.includes(p.nombre);
                return (
                  <button
                    key={p.id}
                    onClick={() => alternar(p.nombre)}
                    className={cn(
                      "surface-card flex items-start gap-3 p-4 text-left transition-all",
                      activo && "border-primary ring-2 ring-primary/30",
                    )}
                  >
                    <span
                      className={cn(
                        "rounded-xl p-2",
                        activo ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary",
                      )}
                    >
                      <Icono nombre={p.icono} className="size-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-medium text-foreground">{p.nombre}</span>
                      <span className="block text-sm text-muted-foreground">
                        {p.descripcion_corta}
                      </span>
                    </span>
                    {activo && <Icons.CheckCircle2 className="size-5 text-primary" />}
                  </button>
                );
              })}
        </div>

        {!isLoading && filtrados.length === 0 && (
          <p className="mt-6 text-center text-muted-foreground">
            No encontramos eso. Puedes continuar igual y contarlo en tu sesión.
          </p>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3">
          {elegidos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {elegidos.map((e) => (
                <span
                  key={e}
                  className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary"
                >
                  {e}
                </span>
              ))}
            </div>
          )}
          <Button
            disabled={elegidos.length === 0}
            className="h-14 w-full rounded-full text-base"
            onClick={() => navigate({ to: session ? "/categoria" : "/auth" })}
          >
            Continuar
          </Button>
          <Link
            to="/reclamaciones"
            className="text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Libro de reclamaciones
          </Link>
        </div>
      </div>
    </main>
  );
}
