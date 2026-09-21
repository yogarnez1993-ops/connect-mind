import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setCargando(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCargando(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, cargando, userId: session?.user.id ?? null };
}

export function usePerfil() {
  const { userId } = useSession();
  return useQuery({
    queryKey: ["perfil", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useRoles() {
  const { userId } = useSession();
  return useQuery({
    queryKey: ["roles", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as string);
    },
  });
}

export function useMiPsicologo() {
  const { userId } = useSession();
  return useQuery({
    queryKey: ["mi-psicologo", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("psicologos")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useConfig() {
  return useQuery({
    queryKey: ["configuracion"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.from("configuracion_app").select("*");
      if (error) throw error;
      const mapa: Record<string, string> = {};
      for (const fila of data ?? []) mapa[fila.clave] = fila.valor;
      return mapa;
    },
  });
}
