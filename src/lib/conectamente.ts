export type Categoria = "Social" | "Medium" | "Premium";

export const CATEGORIAS: Categoria[] = ["Social", "Medium", "Premium"];

export const CATEGORIA_INFO: Record<
  Categoria,
  { titulo: string; resumen: string; desde: number; color: string }
> = {
  Social: {
    titulo: "Social",
    resumen: "Acompañamiento accesible con psicólogos colegiados.",
    desde: 40,
    color: "PLATA",
  },
  Medium: {
    titulo: "Medium",
    resumen: "Más disponibilidad de horarios y seguimiento cercano.",
    desde: 70,
    color: "ORO",
  },
  Premium: {
    titulo: "Premium",
    resumen: "Atención inmediata y soporte prioritario 24 h.",
    desde: 120,
    color: "DIAMANTE",
  },
};

export const METODOS_PAGO = ["Yape", "Plin", "Transferencia", "Efectivo"] as const;

export function soles(valor: number | string | null | undefined) {
  const n = Number(valor ?? 0);
  return `S/ ${n.toFixed(2)}`;
}

export function fechaLarga(iso: string) {
  return new Date(iso).toLocaleString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fechaCorta(iso: string) {
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function proximoSabado(desde = new Date()) {
  const d = new Date(desde);
  const dias = (6 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function colorPorCategoria(categoria: string | null | undefined) {
  if (categoria === "Premium") return "DIAMANTE";
  if (categoria === "Medium") return "ORO";
  return "PLATA";
}

export const COLOR_BADGE: Record<string, string> = {
  VERDE: "bg-success/15 text-success border-success/30",
  DIAMANTE: "bg-primary/10 text-primary border-primary/30",
  ORO: "bg-warning/20 text-warning-foreground border-warning/40",
  PLATA: "bg-muted text-muted-foreground border-border",
};

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
