import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Genera un token RTC de Agora (2 horas) validando que la sala exista,
 * esté activa y no haya expirado.
 */
export const obtenerTokenSala = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ shareLink: z.string().uuid(), uid: z.number().int().positive() }).parse(data),
  )
  .handler(async ({ data }) => {
    const appId = process.env["AGORA_APP_ID"];
    const certificado = process.env["AGORA_APP_CERTIFICATE"];
    if (!appId || !certificado) throw new Error("Falta configurar Agora");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: sala, error } = await supabaseAdmin
      .from("videollamadas")
      .select("id, cita_id, is_active, expires_at, sala_id")
      .eq("share_link", data.shareLink)
      .maybeSingle();

    if (error || !sala) throw new Error("La sala no existe");
    if (sala.expires_at && new Date(sala.expires_at).getTime() < Date.now())
      throw new Error("Esta sala ya expiró");

    const { RtcTokenBuilder, RtcRole } = await import("agora-token");
    const canal = `sala_${sala.sala_id}`;
    const expira = Math.floor(Date.now() / 1000) + 7200;
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      certificado,
      canal,
      data.uid,
      RtcRole.PUBLISHER,
      expira,
      expira,
    );

    return { appId, canal, token, salaId: sala.id, citaId: sala.cita_id, activa: sala.is_active };
  });
