ALTER TABLE public.pagos_paquetes ALTER COLUMN paquete_id DROP NOT NULL;
ALTER TABLE public.agenda_citas ALTER COLUMN psicologo_id DROP NOT NULL;
ALTER TABLE public.notas_clinicas ALTER COLUMN contenido_encriptado SET DEFAULT '';
ALTER TABLE public.notas_clinicas ALTER COLUMN iv SET DEFAULT '';
ALTER TABLE public.videollamadas ALTER COLUMN sala_id SET DEFAULT gen_random_uuid()::text;

DROP POLICY IF EXISTS "vl_part_upd" ON public.videollamadas;
CREATE POLICY "vl_part_upd" ON public.videollamadas FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.agenda_citas c WHERE c.id = videollamadas.cita_id
  AND (c.paciente_id = auth.uid() OR c.psicologo_id IN (SELECT p.id FROM public.psicologos p WHERE p.user_id = auth.uid()))))
WITH CHECK (true);

DROP POLICY IF EXISTS "vl_part_ins" ON public.videollamadas;
CREATE POLICY "vl_part_ins" ON public.videollamadas FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.agenda_citas c WHERE c.id = videollamadas.cita_id
  AND (c.paciente_id = auth.uid() OR c.psicologo_id IN (SELECT p.id FROM public.psicologos p WHERE p.user_id = auth.uid()))));

-- Los pacientes pueden ver a los psicologos verificados y los admin todo (ya existe psi_public_read)
-- Permitir que un usuario cree su propia ficha de psicologo (postulacion)
DROP POLICY IF EXISTS "psi_self_ins" ON public.psicologos;
CREATE POLICY "psi_self_ins" ON public.psicologos FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));