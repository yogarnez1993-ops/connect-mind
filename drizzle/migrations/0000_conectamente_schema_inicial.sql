-- EXTENSIONES
create extension if not exists "pg_trgm";
create extension if not exists "pgcrypto";

-- ROLES
create type public.app_role as enum ('paciente','psicologo','admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy ur_self_read on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy ur_admin_all on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- PERFILES (PACIENTES)
create table public.profiles (
  id uuid primary key,
  nombre text not null,
  dni text unique,
  celular text,
  email text,
  categoria text check (categoria in ('Social','Medium','Premium')),
  estado text not null default 'prueba_pendiente' check (estado in ('prueba_pendiente','paquete_prueba_aprobado','activo','bloqueado','finalizado')),
  problemas_elegidos jsonb not null default '[]'::jsonb,
  acepto_politicas boolean not null default true,
  ip_registro text,
  user_agent text,
  fecha_registro timestamptz not null default now()
);
create index idx_profiles_dni on public.profiles(dni);
create index idx_profiles_estado on public.profiles(estado);
create index idx_profiles_categoria on public.profiles(categoria);
create index idx_profiles_nombre_trgm on public.profiles using gin (nombre gin_trgm_ops);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy prof_self on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'psicologo'));
create policy prof_self_ins on public.profiles for insert to authenticated with check (id = auth.uid());
create policy prof_self_upd on public.profiles for update to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'))
  with check (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy prof_admin_del on public.profiles for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nombre, dni, celular, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1)),
    nullif(new.raw_user_meta_data->>'dni',''),
    nullif(new.raw_user_meta_data->>'celular',''),
    new.email
  ) on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id,'paciente') on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- PSICOLOGOS
create table public.psicologos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  nombre text not null,
  dni text,
  cnp text unique not null,
  celular text,
  email text,
  foto_url text,
  especialidades jsonb not null default '[]'::jsonb,
  categoria text not null check (categoria in ('Social','Medium','Premium','Fundador')),
  tipo_pago text not null default 'normal_55' check (tipo_pago in ('normal_55','fundador_70')),
  ranking_cierres int not null default 0,
  estado text not null default 'activo' check (estado in ('activo','inactivo','bloqueado')),
  agenda_disponible jsonb not null default '[]'::jsonb,
  descripcion text,
  banco text,
  cuenta text,
  cci text,
  rating numeric(2,1) not null default 5.0 check (rating >= 0 and rating <= 5),
  created_at timestamptz not null default now()
);
create index idx_psi_cat_estado on public.psicologos(categoria, estado);
create index idx_psi_ranking on public.psicologos(ranking_cierres desc);
grant select on public.psicologos to anon;
grant select, insert, update, delete on public.psicologos to authenticated;
grant all on public.psicologos to service_role;
alter table public.psicologos enable row level security;
create policy psi_public_read on public.psicologos for select to anon, authenticated using (true);
create policy psi_self_upd on public.psicologos for update to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'))
  with check (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy psi_admin_ins on public.psicologos for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy psi_admin_del on public.psicologos for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- PROBLEMAS
create table public.problemas_psicologicos (
  id uuid primary key default gen_random_uuid(),
  nombre text unique not null,
  descripcion_corta text,
  icono text not null default 'Heart',
  activo boolean not null default true,
  orden int not null default 0
);
create index idx_prob_activo_orden on public.problemas_psicologicos(activo, orden);
create index idx_prob_trgm on public.problemas_psicologicos using gin (nombre gin_trgm_ops);
grant select on public.problemas_psicologicos to anon;
grant select, insert, update, delete on public.problemas_psicologicos to authenticated;
grant all on public.problemas_psicologicos to service_role;
alter table public.problemas_psicologicos enable row level security;
create policy prob_read on public.problemas_psicologicos for select to anon, authenticated using (true);
create policy prob_admin on public.problemas_psicologicos for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.problemas_psicologicos (nombre, descripcion_corta, icono, orden) values
('Ansiedad','Preocupación excesiva','Brain',1),
('Depresión','Tristeza profunda','HeartCrack',2),
('Pareja','Conflictos de pareja','Users',3),
('Familia','Problemas familiares','Home',4),
('No duermo','Insomnio','Moon',5),
('Estrés laboral','Burnout en el trabajo','Briefcase',6),
('Duelo','Pérdida de un ser querido','CloudRain',7),
('Autoestima','Inseguridad personal','Sparkles',8);

-- PAQUETES
create table public.paquetes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  sesiones int not null check (sesiones > 0),
  categoria text not null check (categoria in ('Social','Medium','Premium')),
  precio_por_sesion numeric(10,2) not null,
  precio_total numeric(10,2) not null,
  vacantes_social int not null default 100,
  activo boolean not null default true,
  descripcion text,
  beneficios jsonb not null default '[]'::jsonb,
  orden int not null default 0
);
create index idx_paq_cat_activo on public.paquetes(categoria, activo);
grant select on public.paquetes to anon;
grant select, insert, update, delete on public.paquetes to authenticated;
grant all on public.paquetes to service_role;
alter table public.paquetes enable row level security;
create policy paq_read on public.paquetes for select to anon, authenticated using (true);
create policy paq_admin on public.paquetes for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.paquetes (nombre, sesiones, categoria, precio_por_sesion, precio_total, descripcion, beneficios, orden) values
('Paquete 4 sesiones',4,'Social',40,160,'4 sesiones de 50 minutos','["Videollamada","Pizarra","Notas clínicas"]',1),
('Paquete 8 sesiones',8,'Social',38,304,'8 sesiones de 50 minutos','["Videollamada","Pizarra","Notas clínicas","Soporte"]',2),
('Paquete 4 sesiones',4,'Medium',70,280,'4 sesiones de 50 minutos','["Videollamada","Pizarra","Notas clínicas"]',3),
('Paquete 8 sesiones',8,'Medium',65,520,'8 sesiones de 50 minutos','["Videollamada","Pizarra","Notas clínicas","Soporte"]',4),
('Paquete 4 sesiones',4,'Premium',120,480,'4 sesiones con atención inmediata','["Videollamada","Pizarra","Notas clínicas","Atención inmediata"]',5),
('Paquete 8 sesiones',8,'Premium',110,880,'8 sesiones con atención inmediata','["Videollamada","Pizarra","Notas clínicas","Atención inmediata","Soporte 24h"]',6);

-- SESIONES DE PRUEBA
create table public.sesiones_prueba (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.profiles(id) on delete cascade,
  categoria text not null,
  precio numeric(10,2) not null,
  metodo_pago text not null check (metodo_pago in ('Yape','Plin','Transferencia','Efectivo','Tarjeta')),
  voucher_url text,
  estado_voucher text not null default 'pendiente' check (estado_voucher in ('pendiente','aprobado','rechazado')),
  fecha_pago timestamptz not null default now(),
  notas_admin text
);
create index idx_sp_estado_fecha on public.sesiones_prueba(estado_voucher, fecha_pago desc);
create index idx_sp_paciente on public.sesiones_prueba(paciente_id);
grant select, insert, update, delete on public.sesiones_prueba to authenticated;
grant all on public.sesiones_prueba to service_role;
alter table public.sesiones_prueba enable row level security;
create policy sp_self on public.sesiones_prueba for select to authenticated
  using (paciente_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy sp_ins on public.sesiones_prueba for insert to authenticated with check (paciente_id = auth.uid());
create policy sp_admin_upd on public.sesiones_prueba for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- PAGOS DE PAQUETES
create table public.pagos_paquetes (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.profiles(id) on delete cascade,
  paquete_id uuid not null references public.paquetes(id),
  psicologo_asignado_id uuid references public.psicologos(id),
  monto_pagado numeric(10,2) not null,
  metodo_pago text not null default 'Yape',
  voucher_url text,
  estado_voucher text not null default 'pendiente' check (estado_voucher in ('pendiente','aprobado','rechazado')),
  estado text not null default 'pendiente_aprobacion' check (estado in ('pendiente_aprobacion','activo','finalizado','cancelado')),
  sesiones_totales int not null,
  sesiones_hechas int not null default 0 check (sesiones_hechas >= 0),
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  tipo_terapia text not null default 'Individual' check (tipo_terapia in ('Individual','Pareja','Familiar')),
  notas_admin text,
  created_at timestamptz not null default now()
);
create index idx_pp_paciente on public.pagos_paquetes(paciente_id);
create index idx_pp_psicologo on public.pagos_paquetes(psicologo_asignado_id);
create index idx_pp_estado on public.pagos_paquetes(estado);
grant select, insert, update, delete on public.pagos_paquetes to authenticated;
grant all on public.pagos_paquetes to service_role;
alter table public.pagos_paquetes enable row level security;
create policy pp_read on public.pagos_paquetes for select to authenticated
  using (paciente_id = auth.uid() or public.has_role(auth.uid(),'admin')
    or psicologo_asignado_id in (select id from public.psicologos where user_id = auth.uid()));
create policy pp_ins on public.pagos_paquetes for insert to authenticated with check (paciente_id = auth.uid());
create policy pp_admin_upd on public.pagos_paquetes for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- AGENDA
create table public.agenda_citas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.profiles(id) on delete cascade,
  psicologo_id uuid not null references public.psicologos(id) on delete cascade,
  pago_id uuid references public.pagos_paquetes(id),
  fecha_hora timestamptz not null,
  estado text not null default 'agendada' check (estado in ('agendada','realizada','cancelada','pendiente_agendar_siguiente')),
  tipo text not null default 'Individual' check (tipo in ('Individual','Pareja','Familiar')),
  color text not null default 'PLATA' check (color in ('VERDE','DIAMANTE','ORO','PLATA')),
  duracion int not null default 50,
  link_video text,
  recordatorio_enviado boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_ag_psi_fecha on public.agenda_citas(psicologo_id, fecha_hora, estado);
create index idx_ag_pac_fecha on public.agenda_citas(paciente_id, fecha_hora desc);
create index idx_ag_fecha_estado on public.agenda_citas(fecha_hora, estado);
grant select, insert, update, delete on public.agenda_citas to authenticated;
grant all on public.agenda_citas to service_role;
alter table public.agenda_citas enable row level security;
create policy ag_read on public.agenda_citas for select to authenticated
  using (paciente_id = auth.uid() or public.has_role(auth.uid(),'admin')
    or psicologo_id in (select id from public.psicologos where user_id = auth.uid()));
create policy ag_ins on public.agenda_citas for insert to authenticated
  with check (paciente_id = auth.uid() or public.has_role(auth.uid(),'admin')
    or psicologo_id in (select id from public.psicologos where user_id = auth.uid()));
create policy ag_upd on public.agenda_citas for update to authenticated
  using (paciente_id = auth.uid() or public.has_role(auth.uid(),'admin')
    or psicologo_id in (select id from public.psicologos where user_id = auth.uid()))
  with check (true);

-- BILLETERA
create table public.billetera_psicologo (
  id uuid primary key default gen_random_uuid(),
  psicologo_id uuid not null references public.psicologos(id) on delete cascade,
  tipo text not null check (tipo in ('adelanto_20','pago_sesion','bono_fundador')),
  monto numeric(10,2) not null,
  descripcion text,
  cita_id uuid references public.agenda_citas(id),
  fecha_generacion timestamptz not null default now(),
  estado text not null default 'pendiente' check (estado in ('pendiente','pagado')),
  fecha_pago_sabado date not null
);
create index idx_bil_psi on public.billetera_psicologo(psicologo_id, fecha_generacion desc);
create index idx_bil_estado on public.billetera_psicologo(estado, fecha_pago_sabado);
grant select, insert, update, delete on public.billetera_psicologo to authenticated;
grant all on public.billetera_psicologo to service_role;
alter table public.billetera_psicologo enable row level security;
create policy bil_read on public.billetera_psicologo for select to authenticated
  using (public.has_role(auth.uid(),'admin') or psicologo_id in (select id from public.psicologos where user_id = auth.uid()));
create policy bil_admin on public.billetera_psicologo for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- CORTES SEMANALES
create table public.cortes_semanales (
  id uuid primary key default gen_random_uuid(),
  fecha_corte_viernes date not null,
  fecha_pago_sabado date not null,
  total_recaudado numeric(12,2) not null default 0,
  ganancia_empresa_45 numeric(12,2) not null default 0,
  total_pagar_psicologos numeric(12,2) not null default 0,
  estado text not null default 'abierto' check (estado in ('abierto','cerrado','pagado'))
);
grant select, insert, update, delete on public.cortes_semanales to authenticated;
grant all on public.cortes_semanales to service_role;
alter table public.cortes_semanales enable row level security;
create policy cs_admin on public.cortes_semanales for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- NOTAS CLINICAS
create table public.notas_clinicas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.profiles(id) on delete cascade,
  psicologo_id uuid not null references public.psicologos(id),
  cita_id uuid unique references public.agenda_citas(id),
  contenido_encriptado text not null,
  iv text not null,
  cie10 text,
  version int not null default 1,
  fecha_creacion timestamptz not null default now(),
  para_susalud boolean not null default false,
  visible_paciente boolean not null default false
);
create index idx_nc_paciente on public.notas_clinicas(paciente_id, fecha_creacion desc);
grant select, insert, update on public.notas_clinicas to authenticated;
grant all on public.notas_clinicas to service_role;
alter table public.notas_clinicas enable row level security;
create policy nc_read on public.notas_clinicas for select to authenticated
  using (psicologo_id in (select id from public.psicologos where user_id = auth.uid())
    or public.has_role(auth.uid(),'admin')
    or (visible_paciente and paciente_id = auth.uid()));
create policy nc_ins on public.notas_clinicas for insert to authenticated
  with check (psicologo_id in (select id from public.psicologos where user_id = auth.uid()));
create policy nc_upd on public.notas_clinicas for update to authenticated
  using (psicologo_id in (select id from public.psicologos where user_id = auth.uid()))
  with check (psicologo_id in (select id from public.psicologos where user_id = auth.uid()));

-- VIDEOLLAMADAS
create table public.videollamadas (
  id uuid primary key default gen_random_uuid(),
  cita_id uuid unique not null references public.agenda_citas(id) on delete cascade,
  sala_id text unique not null,
  estado text not null default 'sala_espera' check (estado in ('sala_espera','en_curso','finalizada')),
  inicio timestamptz,
  fin timestamptz,
  grabacion_permitida boolean not null default false,
  consentimiento_grabacion boolean not null default false
);
grant select, insert, update on public.videollamadas to authenticated;
grant all on public.videollamadas to service_role;
alter table public.videollamadas enable row level security;
create policy vl_read on public.videollamadas for select to authenticated
  using (exists (select 1 from public.agenda_citas c where c.id = cita_id
    and (c.paciente_id = auth.uid() or c.psicologo_id in (select id from public.psicologos where user_id = auth.uid())
      or public.has_role(auth.uid(),'admin'))));
create policy vl_write on public.videollamadas for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- COMPROBANTES SUNAT
create table public.comprobantes_sunat (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.profiles(id),
  pago_id uuid,
  tipo text not null check (tipo in ('boleta','factura')),
  serie text not null default 'B001',
  correlativo int not null,
  monto numeric(10,2) not null,
  igv numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  pdf_url text,
  fecha_emision timestamptz not null default now(),
  estado text not null default 'emitido',
  unique (serie, correlativo)
);
create index idx_cs_paciente on public.comprobantes_sunat(paciente_id);
grant select, insert on public.comprobantes_sunat to authenticated;
grant all on public.comprobantes_sunat to service_role;
alter table public.comprobantes_sunat enable row level security;
create policy cs_read on public.comprobantes_sunat for select to authenticated
  using (paciente_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy cs_admin_ins on public.comprobantes_sunat for insert to authenticated
  with check (public.has_role(auth.uid(),'admin'));

-- RECIBOS HONORARIOS
create table public.recibos_honorarios (
  id uuid primary key default gen_random_uuid(),
  psicologo_id uuid not null references public.psicologos(id) on delete cascade,
  monto numeric(10,2) not null,
  mes text not null,
  archivo_url text,
  estado text not null default 'pendiente' check (estado in ('pendiente','aprobado','rechazado')),
  fecha_subida timestamptz not null default now(),
  numero_recibo text,
  serie text not null default 'E001',
  notas_admin text
);
grant select, insert, update on public.recibos_honorarios to authenticated;
grant all on public.recibos_honorarios to service_role;
alter table public.recibos_honorarios enable row level security;
create policy rh_read on public.recibos_honorarios for select to authenticated
  using (public.has_role(auth.uid(),'admin') or psicologo_id in (select id from public.psicologos where user_id = auth.uid()));
create policy rh_ins on public.recibos_honorarios for insert to authenticated
  with check (psicologo_id in (select id from public.psicologos where user_id = auth.uid()));
create policy rh_admin_upd on public.recibos_honorarios for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- CONFIGURACION
create table public.configuracion_app (
  clave text primary key,
  valor text not null,
  descripcion text,
  editable boolean not null default true,
  version int not null default 1
);
grant select on public.configuracion_app to anon;
grant select, insert, update, delete on public.configuracion_app to authenticated;
grant all on public.configuracion_app to service_role;
alter table public.configuracion_app enable row level security;
create policy cfg_read on public.configuracion_app for select to anon, authenticated using (true);
create policy cfg_admin on public.configuracion_app for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.configuracion_app (clave, valor, descripcion) values
('titulo_sentimiento','¿Qué estás sintiendo hoy?','Título de bienvenida'),
('placeholder_buscador','Escribe lo que te pasa, ej: no duermo, peleo con mi pareja','Texto del buscador'),
('precios_prueba_json','{"Social":20,"Medium":30,"Premium":50}','Precios de la sesión de prueba'),
('porcentaje_empresa','45','Porcentaje de la empresa'),
('pago_sesion','31.5','Pago por sesión al psicólogo'),
('porcentaje_adelanto','20','Porcentaje de adelanto'),
('numero_yape','999999999','Número de Yape'),
('qr_yape_url','','QR de Yape'),
('titular_yape','Conectamente SAC','Titular de Yape'),
('numero_plin','999999999','Número de Plin'),
('qr_plin_url','','QR de Plin'),
('titular_plin','Conectamente SAC','Titular de Plin'),
('cuenta_bcp','19412345678901','Cuenta bancaria'),
('cci_bcp','002194112345678901','CCI'),
('titular_transferencia','Conectamente SAC','Titular de la cuenta'),
('direccion_efectivo','Av. Arequipa 123, Lima. Lun-Vie 9am-6pm','Dirección para pago en efectivo'),
('horarios_atencion','{"inicio":"08:00","fin":"22:00"}','Horario de atención'),
('max_participantes_familia','6','Máximo de participantes en terapia familiar'),
('ruc_empresa','20123456789','RUC'),
('razon_social','Conectamente Psicología SAC','Razón social'),
('serie_boleta','B001','Serie de boleta'),
('serie_factura','F001','Serie de factura'),
('serie_recibo','E001','Serie de recibo'),
('igv_porcentaje','18','IGV'),
('pago_tarjeta_activo','false','Habilitar pago con tarjeta'),
('texto_politicas','Políticas de privacidad (Ley 29733): Conectamente protege tus datos personales y los usa únicamente para brindarte atención psicológica.','Políticas de privacidad'),
('texto_consentimiento','Consentimiento informado (SUSALUD): Autorizo la atención psicológica en modalidad virtual y el registro de mi historia clínica.','Consentimiento informado'),
('texto_terminos','Términos y condiciones de Conectamente.','Términos y condiciones'),
('color_primary','#0D47A1','Color primario'),
('color_secondary','#81C784','Color secundario')
on conflict (clave) do nothing;

-- NOTIFICACIONES
create table public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid,
  psicologo_id uuid,
  tipo text not null,
  mensaje text,
  canal text not null check (canal in ('push','whatsapp','email')),
  enviada boolean not null default false,
  fecha timestamptz not null default now(),
  intentos int not null default 0,
  provider_response jsonb
);
create index idx_notif_enviada on public.notificaciones(enviada, fecha desc);
grant select, insert, update on public.notificaciones to authenticated;
grant all on public.notificaciones to service_role;
alter table public.notificaciones enable row level security;
create policy notif_read on public.notificaciones for select to authenticated
  using (usuario_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy notif_admin on public.notificaciones for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- LOGS
create table public.logs_admin (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid,
  accion text not null,
  tabla_afectada text,
  registro_id uuid,
  fecha timestamptz not null default now(),
  ip text,
  detalles jsonb
);
create index idx_la_fecha on public.logs_admin(fecha desc);
grant select, insert on public.logs_admin to authenticated;
grant all on public.logs_admin to service_role;
alter table public.logs_admin enable row level security;
create policy la_admin on public.logs_admin for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.logs_acceso_clinico (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  nota_id uuid references public.notas_clinicas(id) on delete set null,
  fecha timestamptz not null default now(),
  ip text,
  motivo text not null
);
grant select, insert on public.logs_acceso_clinico to authenticated;
grant all on public.logs_acceso_clinico to service_role;
alter table public.logs_acceso_clinico enable row level security;
create policy lac_admin on public.logs_acceso_clinico for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- RECLAMACIONES
create table public.reclamaciones (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid references public.profiles(id) on delete set null,
  nombre text not null,
  documento text,
  email text,
  celular text,
  tipo text not null default 'reclamo' check (tipo in ('reclamo','queja')),
  reclamo text not null,
  detalle text,
  fecha timestamptz not null default now(),
  estado text not null default 'pendiente' check (estado in ('pendiente','atendido')),
  respuesta text
);
grant insert on public.reclamaciones to anon;
grant select, insert, update on public.reclamaciones to authenticated;
grant all on public.reclamaciones to service_role;
alter table public.reclamaciones enable row level security;
create policy rec_ins on public.reclamaciones for insert to anon, authenticated with check (true);
create policy rec_read on public.reclamaciones for select to authenticated
  using (paciente_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy rec_admin_upd on public.reclamaciones for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));