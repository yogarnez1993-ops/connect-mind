import logo from "@/assets/logo-conectamente.png";
import { cn } from "@/lib/utils";

export function Logo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <img
      src={logo}
      alt="Conectamente"
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
  );
}

export function Marca({ size = 36, claro = false }: { size?: number; claro?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <Logo size={size} />
      <span
        className={cn(
          "font-display text-lg font-700 font-semibold tracking-tight",
          claro ? "text-primary-foreground" : "text-primary",
        )}
      >
        Conectamente
      </span>
    </span>
  );
}
