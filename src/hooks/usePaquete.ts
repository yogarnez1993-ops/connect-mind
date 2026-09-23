import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useAuth";

export function usePaqueteActivo() {
  const { userId } = useSession();
  return useQuery({
    queryKey: ["paquete-activo", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pagos_paquetes")
        .select("*")
        .eq("paciente_id", userId!)
        .eq("estado", "activo")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useMisPagos() {
  const { userId } = useSession();
  return useQuery({
    queryKey: ["mis-pagos", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pagos_paquetes")
        .select("*")
        .eq("paciente_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
