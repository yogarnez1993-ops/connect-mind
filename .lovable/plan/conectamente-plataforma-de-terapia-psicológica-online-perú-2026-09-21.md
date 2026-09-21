# Conectamente — plataforma de terapia psicológica online (Perú)

App web instalable en el celular, con tres experiencias: paciente, psicólogo y administrador. Todo en español, adaptada a celular, tablet y laptop.

## Identidad

- Nombre: Conectamente. Azul #0D47A1 y verde #81C784.
- Logo: dos cabezas unidas por una red neuronal (lo genero).
- Se puede instalar desde el navegador como app.

## Lo que verá el paciente

1. Pantalla de inicio con el logo animado.
2. Tres pantallas de bienvenida (solo la primera vez).
3. "¿Qué estás sintiendo hoy?" con buscador y lista de problemas (ansiedad, depresión, pareja, familia, insomnio, estrés laboral). Puede elegir varios.
4. Registro: nombre, DNI, celular, correo y contraseña, con aceptación de políticas, consentimiento y términos (textos editables desde el panel admin).
5. Ingreso con correo y contraseña.
6. Elección de categoría: Social, Medium o Premium, con precios y beneficios.
7. Sesión de prueba: elige cómo pagar.
   - Pago manual: Yape, Plin, transferencia o efectivo, con los datos y QR configurados por el admin, y subida de la foto del voucher.
   - Pago automático con tarjeta: queda listo como opción visible; se activa cuando conectes la cuenta de cobros.
8. Pantalla de espera mientras el admin revisa el pago, con estado pendiente / aprobado / rechazado.
9. Agenda: si hay psicólogos disponibles ahora, botón "Empezar ahora"; si no, calendario semanal por horas.
10. Confirmación de la cita con los datos del psicólogo y opción de compartir por WhatsApp.
11. "Mis sesiones": próximas y pasadas, reprogramar, agendar la siguiente y entrar a la sesión.
12. Sala de sesión: por ahora una sala de espera y la pantalla de la sesión preparadas; el video en vivo se activa cuando tengas la cuenta de Daily.co.
13. Paquetes de 4, 6, 8, 12 y 15 sesiones con precio por sesión y ahorro, y el mismo flujo de pago.

## Lo que verá el psicólogo

- Tablero con sesiones de hoy, ganancias de la semana, cierres del mes y pacientes activos.
- Agenda semanal con marcado de horarios libres/ocupados y colores por categoría.
- Lista de pacientes con buscador, progreso del paquete e historial.
- Pagos: adelantos, pagos por sesión y bonos, con corte los viernes y pago los sábados.
- Subida de recibo por honorarios.
- Perfil editable: foto, CNP, especialidades, disponibilidad y datos bancarios.

## Lo que verá el administrador

- Tablero con recaudación del mes, ganancia de la empresa, monto por pagar y vouchers pendientes, con gráficos.
- Configuración: todos los textos, precios, números de Yape/Plin, cuentas, horarios, RUC y series de comprobantes, editables sin tocar código.
- Problemas y paquetes: crear, editar, activar y ordenar.
- Vouchers: revisar la imagen, aprobar o rechazar con motivo. Al aprobar se activa al paciente, se genera el comprobante en PDF y el adelanto al psicólogo.
- Asignación de psicólogo (manual o automática por ranking) y alertas de pacientes sin agendar.
- Agenda global, finanzas (cortes y billetera, exportable), historias clínicas con registro de quién las consulta, recibos, usuarios, psicólogos, notificaciones y bitácora.

## Cumplimiento legal

- Comprobantes con numeración propia: boletas B001, facturas F001, recibos E001, con IGV y PDF descargable.
- Libro de reclamaciones y consentimiento informado.
- Notas clínicas guardadas cifradas, visibles solo para su psicólogo y con registro de accesos.
- Aceptación de políticas guardada con fecha e IP (Ley 29733).

## Detalles técnicos

- Construido sobre la tecnología de Lovable (TanStack Start + React) en lugar de Next.js; mismo resultado funcional.
- Base de datos Lovable Cloud (PostgreSQL): tablas de pacientes, psicólogos, problemas, paquetes, sesiones de prueba, pagos, agenda, billetera, cortes semanales, notas clínicas, videollamadas, comprobantes, recibos, configuración, notificaciones, bitácoras y reclamaciones.
- Cuentas de usuario con el sistema de autenticación de Lovable Cloud (correo + contraseña) y una tabla de perfiles enlazada; los roles (paciente, psicólogo, admin) van en una tabla de roles aparte por seguridad.
- Seguridad a nivel de fila en todas las tablas; el paciente solo ve lo suyo, el psicólogo solo sus pacientes, el admin todo.
- Notas clínicas cifradas AES-256-GCM con clave guardada como secreto del servidor.
- Vouchers, fotos y PDFs en el almacenamiento de archivos de Lovable Cloud.
- Índices en las columnas de búsqueda y listados paginados para soportar volumen alto. Particionado mensual y caché externa (Redis) se pueden añadir después si el tráfico lo exige.
- Comprobantes PDF generados con jsPDF; correlativo tomado del último emitido por serie.
- Cada página con su propio título y descripción para buscadores.

## Fuera de esta etapa

- Video en vivo (falta la cuenta de Daily.co) — la pantalla queda lista.
- Cobro automático con tarjeta: se muestra como opción y se conecta el proveedor de pagos cuando lo autorices.
- Envío real de WhatsApp/push: las notificaciones se registran en el sistema y se conectan al proveedor cuando tengas las credenciales.

## Orden de construcción

1. Base de datos, roles y diseño visual.
2. Registro, ingreso, selección de problemas y categorías.
3. Pago de prueba con voucher, espera y aprobación.
4. Agenda y panel del paciente.
5. Paquetes y comprobantes.
6. Panel del psicólogo.
7. Panel del administrador completo.
