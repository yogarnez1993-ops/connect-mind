-- Sala de video
ALTER TABLE public.videollamadas
  ADD COLUMN IF NOT EXISTS pago_id uuid,
  ADD COLUMN IF NOT EXISTS share_link uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS reconexiones integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duracion_real integer NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS videollamadas_share_link_key ON public.videollamadas(share_link);
CREATE UNIQUE INDEX IF NOT EXISTS videollamadas_cita_key ON public.videollamadas(cita_id);

-- Notas clinicas: texto simple, tareas y pizarra
ALTER TABLE public.notas_clinicas
  ADD COLUMN IF NOT EXISTS nota text,
  ADD COLUMN IF NOT EXISTS tareas text,
  ADD COLUMN IF NOT EXISTS pizarra_url text;

-- Verificacion de psicologos
ALTER TABLE public.psicologos
  ADD COLUMN IF NOT EXISTS verificado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS colegiado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS docs_url text,
  ADD COLUMN IF NOT EXISTS entrevista_fecha timestamptz,
  ADD COLUMN IF NOT EXISTS entrevista_link text,
  ADD COLUMN IF NOT EXISTS motivo_rechazo text;

-- Problema elegido en el paquete comprado
ALTER TABLE public.pagos_paquetes
  ADD COLUMN IF NOT EXISTS problema text;

-- Documentos legales
CREATE TABLE IF NOT EXISTS public.legal_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL UNIQUE,
  titulo text NOT NULL,
  contenido text NOT NULL,
  actualizado_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.legal_docs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legal_docs TO authenticated;
GRANT ALL ON public.legal_docs TO service_role;
ALTER TABLE public.legal_docs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "legal publico" ON public.legal_docs;
CREATE POLICY "legal publico" ON public.legal_docs FOR SELECT USING (true);
DROP POLICY IF EXISTS "legal admin" ON public.legal_docs;
CREATE POLICY "legal admin" ON public.legal_docs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Consentimientos firmados
CREATE TABLE IF NOT EXISTS public.consents (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dni text NOT NULL,
  firma_nombre text NOT NULL,
  ip text,
  user_agent text,
  accepted_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.consents TO authenticated;
GRANT ALL ON public.consents TO service_role;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "consent propio" ON public.consents;
CREATE POLICY "consent propio" ON public.consents FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id);

-- Configuracion de pagos
INSERT INTO public.configuracion_app (clave, valor, descripcion, editable) VALUES
  ('modo_pagos','manual','Modo de cobro: manual o automatico',true),
  ('yape_qr_url','','URL del QR de Yape',true),
  ('yape_numero','','Numero Yape',true),
  ('plin_numero','','Numero Plin',true),
  ('bcp_cuenta','','Cuenta BCP',true),
  ('bcp_cci','','CCI BCP',true),
  ('culqi_public_key','','Llave publica Culqi',true),
  ('mercadopago_public_key','','Llave publica MercadoPago',true)
ON CONFLICT (clave) DO NOTHING;

-- Semillas legales
INSERT INTO public.legal_docs (tipo, titulo, contenido) VALUES
  ('privacidad','Politica de Privacidad (Ley 29733)','Conectamente trata tus datos personales conforme a la Ley N° 29733 de Proteccion de Datos Personales y su reglamento (D.S. 003-2013-JUS). Tus datos de salud son datos sensibles y se almacenan cifrados. Puedes ejercer tus derechos ARCO (acceso, rectificacion, cancelacion y oposicion) escribiendo a privacidad@conectamente.pe. Conservamos la historia clinica el plazo legal exigido y los comprobantes 5 anios segun SUNAT.'),
  ('terminos','Terminos y Condiciones','Conectamente es una plataforma de telepsicologia que conecta pacientes con psicologos colegiados y habilitados ante el Colegio de Psicologos del Peru (CPSP), conforme a la Ley N° 28369 del Trabajo del Psicologo y la Ley N° 30947 de Salud Mental. El servicio no reemplaza la atencion de emergencia: en crisis llama a la Linea 113 opcion 5.'),
  ('consentimiento','Consentimiento Informado de Telepsicologia','Declaro que acepto recibir atencion psicologica a distancia por videollamada. Conozco los limites de la modalidad remota, la posibilidad de fallas tecnicas y que las sesiones NO son grabadas salvo consentimiento expreso. Autorizo el tratamiento de mis datos de salud conforme a la Ley N° 29733 y comprendo que el servicio no atiende emergencias (Linea 113).'),
  ('reclamaciones','Libro de Reclamaciones Virtual (INDECOPI)','Conforme al Codigo de Proteccion y Defensa del Consumidor (Ley N° 29571) y al D.S. 011-2011-PCM, Conectamente pone a disposicion su Libro de Reclamaciones Virtual. El proveedor respondera en un plazo maximo de 15 dias habiles.'),
  ('etica','Codigo de Etica y Deontologia CPSP','Los profesionales de Conectamente se rigen por el Codigo de Etica y Deontologia del Colegio de Psicologos del Peru: confidencialidad, consentimiento informado, competencia profesional y respeto a la dignidad de la persona. Todo psicologo esta colegiado y habilitado, y se verifica su numero de colegiatura.')
ON CONFLICT (tipo) DO NOTHING;