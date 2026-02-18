-- =============================================
-- DATOS DE PRUEBA - SERVICE DESK TEKNAO
-- =============================================

-- Tickets existentes (no eliminar)
-- TKT-001 - WiFi issue
-- TKT-2026-0001 - Sistema de facturacion

-- Agregar más tickets
INSERT INTO tickets (title, description, status, priority, category, "requesterEmail", "requesterId", "ticketNumber") VALUES 
('Caida de servidor', 'Servidor caido', 'assigned', 'critical', 'Infraestructura', 'juan.perez@teknao.com', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'TKT-2026-0002'),
('Base de datos corrupta', 'Tablas corruptas', 'new', 'critical', 'Base de Datos', 'laura.martinez@teknao.com', '29fc8781-ca77-4ab3-8f76-62bb5b72a074', 'TKT-2026-0003'),
('Ataque de seguridad', 'Intentos de intrusion', 'in_progress', 'critical', 'Seguridad', 'rodrigo.sanchez@teknao.com', '51fbf9ba-ad95-43ae-bdb9-c07351b1ab99', 'TKT-2026-0004'),
('Error nomina', 'Nomina no se ejecuta', 'in_progress', 'high', 'Sistema', 'elena.diaz@teknao.com', 'd7efaa5e-a9ad-4c00-a18c-e9d0a13639cd', 'TKT-2026-0005'),
('VPN no conecta', 'No puedo conectar VPN', 'assigned', 'high', 'Red', 'maria.gonzalez@teknao.com', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'TKT-2026-0006'),
('Correo no funciona', 'No puedo enviar correos', 'assigned', 'high', 'Email', 'juan.perez@teknao.com', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'TKT-2026-0007'),
('App movil no carga', 'Pantalla en blanco', 'new', 'high', 'Aplicacion', 'laura.martinez@teknao.com', '29fc8781-ca77-4ab3-8f76-62bb5b72a074', 'TKT-2026-0008'),
('Impresora no funciona', 'Impresora no responde', 'pending', 'high', 'Hardware', 'rodrigo.sanchez@teknao.com', '51fbf9ba-ad95-43ae-bdb9-c07351b1ab99', 'TKT-2026-0009'),
('Dashboard incorrecto', 'Datos incorrectos', 'in_progress', 'high', 'Sistema', 'sofia.hernandez@teknao.com', '6d2f018b-a556-433c-b9a8-115ca12c038b', 'TKT-2026-0010'),
('Backup incompleto', 'Backup no exitoso', 'assigned', 'high', 'Infraestructura', 'david.ramirez@teknao.com', '4660cfb0-e834-44e3-858b-aa29dc003125', 'TKT-2026-0011'),
('Licencia vencida', 'Licencia vence', 'new', 'high', 'Licencias', 'elena.diaz@teknao.com', 'd7efaa5e-a9ad-4c00-a18c-e9d0a13639cd', 'TKT-2026-0012'),
('Solicitud acceso', 'Necesito acceso', 'new', 'medium', 'Accesos', 'maria.gonzalez@teknao.com', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'TKT-2026-0013'),
('Actualizacion Windows', 'Necesita actualizaciones', 'assigned', 'medium', 'Software', 'juan.perez@teknao.com', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'TKT-2026-0014'),
('Monitor parpadea', 'El monitor parpadea', 'new', 'medium', 'Hardware', 'rodrigo.sanchez@teknao.com', '51fbf9ba-ad95-43ae-bdb9-c07351b1ab99', 'TKT-2026-0015'),
('Instalar software', 'Necesito Photoshop', 'assigned', 'medium', 'Software', 'sofia.hernandez@teknao.com', '6d2f018b-a556-433c-b9a8-115ca12c038b', 'TKT-2026-0016'),
('Teclado no funciona', 'Teclas no responden', 'new', 'medium', 'Hardware', 'david.ramirez@teknao.com', '4660cfb0-e834-44e3-858b-aa29dc003125', 'TKT-2026-0017'),
('Mouse no responde', 'El mouse no se mueve', 'pending', 'medium', 'Hardware', 'elena.diaz@teknao.com', 'd7efaa5e-a9ad-4c00-a18c-e9d0a13639cd', 'TKT-2026-0018'),
('Cambio password', 'Cambiar contrasena', 'new', 'low', 'Accesos', 'laura.martinez@teknao.com', '29fc8781-ca77-4ab3-8f76-62bb5b72a074', 'TKT-2026-0019'),
('Firma digital', 'Ayuda con firma', 'assigned', 'low', 'Sistema', 'rodrigo.sanchez@teknao.com', '51fbf9ba-ad95-43ae-bdb9-c07351b1ab99', 'TKT-2026-0020'),
('Consulta reporte', 'Como genero reporte', 'new', 'low', 'Sistema', 'sofia.hernandez@teknao.com', '6d2f018b-a556-433c-b9a8-115ca12c038b', 'TKT-2026-0021'),
('Cable de red', 'Necesito cable', 'new', 'low', 'Hardware', 'maria.gonzalez@teknao.com', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'TKT-2026-0022'),
('Acceso carpeta', 'Permiso carpeta', 'assigned', 'low', 'Accesos', 'juan.perez@teknao.com', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'TKT-2026-0023'),
('Manual usuario', 'Donde esta el manual', 'new', 'low', 'Documentacion', 'laura.martinez@teknao.com', '29fc8781-ca77-4ab3-8f76-62bb5b72a074', 'TKT-2026-0024'),
('No puedo entrar Drive', 'Error al acceder', 'assigned', 'medium', 'Aplicacion', 'david.ramirez@teknao.com', '4660cfb0-e834-44e3-858b-aa29dc003125', 'TKT-2026-0025'),
('Pantalla lenta', 'La pantalla lenta', 'new', 'medium', 'Hardware', 'elena.diaz@teknao.com', 'd7efaa5e-a9ad-4c00-a18c-e9d0a13639cd', 'TKT-2026-0026'),
('Configurar firma', 'Configurar mi firma', 'resolved', 'low', 'Email', 'maria.gonzalez@teknao.com', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'TKT-2026-0027'),
('Crear usuario nuevo', 'Usuario nuevo empleado', 'resolved', 'medium', 'Accesos', 'laura.martinez@teknao.com', '29fc8781-ca77-4ab3-8f76-62bb5b72a074', 'TKT-2026-0028');

-- Verificar
SELECT COUNT(*) as total_tickets FROM tickets;
SELECT status, COUNT(*) as cantidad FROM tickets GROUP BY status;
SELECT priority, COUNT(*) as cantidad FROM tickets GROUP BY priority;
