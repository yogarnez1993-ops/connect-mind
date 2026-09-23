import { CATEGORIA_INFO, type Categoria } from "@/lib/conectamente";

export const MIN_SESIONES = 2;
export const MAX_SESIONES = 15;

/** Descuento por volumen: más sesiones, menor precio por sesión. */
export function descuento(cantidad: number) {
  if (cantidad >= 12) return 0.15;
  if (cantidad >= 8) return 0.1;
  if (cantidad >= 4) return 0.05;
  return 0;
}

export function calcularPaquete(categoria: Categoria, cantidad: number) {
  const base = CATEGORIA_INFO[categoria].desde;
  const bruto = base * cantidad;
  const pct = descuento(cantidad);
  const total = Math.round(bruto * (1 - pct) * 100) / 100;
  return {
    precioSesion: base,
    bruto,
    ahorro: Math.round((bruto - total) * 100) / 100,
    porcentaje: Math.round(pct * 100),
    total,
  };
}
