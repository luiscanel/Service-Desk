-- Seed: Create sample tickets for dashboard
-- Run: docker exec -i servicedesk-db psql -U servicedesk -d servicedesk < seed-tickets.sql

-- Clean existing data
DELETE FROM tickets;
DELETE FROM agents;
DELETE FROM users;

-- Create users (need password for auth)
INSERT INTO users (id, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt") VALUES 
(gen_random_uuid(), 'admin@servicedesk.com', '$2b$10$dummy', 'Admin', 'User', 'admin', true, NOW(), NOW()),
(gen_random_uuid(), 'juan.perez@empresa.com', '$2b$10$dummy', 'Juan', 'Pérez', 'user', true, NOW(), NOW()),
(gen_random_uuid(), 'maria.garcia@empresa.com', '$2b$10$dummy', 'María', 'García', 'user', true, NOW(), NOW()),
(gen_random_uuid(), 'carlos.lopez@empresa.com', '$2b$10$dummy', 'Carlos', 'López', 'user', true, NOW(), NOW()),
(gen_random_uuid(), 'ana.martinez@empresa.com', '$2b$10$dummy', 'Ana', 'Martínez', 'user', true, NOW(), NOW());

-- Create agent
INSERT INTO agents (id, "userId", level, "isAvailable", skills, "ticketCapacity", "currentTickets", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 3, true, 'redes,sistemas,base de datos', 10, 3, NOW(), NOW() 
FROM users WHERE email = 'admin@servicedesk.com';

-- Create tickets
INSERT INTO tickets (id, "ticketNumber", title, description, status, priority, category, "requesterId", "assignedToId", "createdAt", "updatedAt")
SELECT * FROM (
  SELECT gen_random_uuid(), 'TKT-0001', 'Servidor no responde', 'El servidor principal no está respondiendo', 'in_progress', 'critical', 'Infraestructura', u.id, a.id, NOW(), NOW()
  FROM users u, agents a WHERE u.email = 'juan.perez@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0002', 'Solicitud de acceso a sistema', 'Necesito acceso al ERP', 'new', 'high', 'Acceso', u.id, a.id, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
  FROM users u, agents a WHERE u.email = 'maria.garcia@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0003', 'Error en aplicación', 'La aplicación de facturación muestra error', 'pending', 'medium', 'Aplicaciones', u.id, a.id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  FROM users u, agents a WHERE u.email = 'carlos.lopez@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0004', 'Problema de red WiFi', 'No hay conexión a internet en oficina', 'resolved', 'high', 'Redes', u.id, a.id, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'
  FROM users u, agents a WHERE u.email = 'ana.martinez@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0005', 'Instalación de software', 'Necesito instalar Visual Studio Code', 'closed', 'low', 'Software', u.id, a.id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'
  FROM users u, agents a WHERE u.email = 'juan.perez@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0006', 'Password olvidado', 'No puedo acceder a mi cuenta', 'new', 'high', 'Acceso', u.id, a.id, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
  FROM users u, agents a WHERE u.email = 'maria.garcia@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0007', 'Upgrade de memoria RAM', 'Mi computador está lento', 'assigned', 'medium', 'Hardware', u.id, a.id, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'
  FROM users u, agents a WHERE u.email = 'carlos.lopez@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0008', 'Consulta sobre factura', 'Tengo duda con la última factura', 'pending', 'low', 'Facturación', u.id, a.id, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'
  FROM users u, agents a WHERE u.email = 'ana.martinez@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0009', 'Backup de archivos', 'Necesito recuperar archivos eliminados', 'resolved', 'medium', 'Datos', u.id, a.id, NOW() - INTERVAL '8 days', NOW() - INTERVAL '3 days'
  FROM users u, agents a WHERE u.email = 'juan.perez@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0010', 'Problema con impresora', 'La impresora no funciona', 'closed', 'low', 'Hardware', u.id, a.id, NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days'
  FROM users u, agents a WHERE u.email = 'maria.garcia@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0011', 'Creación de usuario nuevo', 'Nuevo empleado necesita acceso', 'new', 'medium', 'Acceso', u.id, a.id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  FROM users u, agents a WHERE u.email = 'carlos.lopez@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0012', 'Error de base de datos', 'La base de datos está muy lenta', 'in_progress', 'critical', 'Base de datos', u.id, a.id, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
  FROM users u, agents a WHERE u.email = 'ana.martinez@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0013', 'Configuración de email', 'No puedo recibir correos', 'resolved', 'high', 'Email', u.id, a.id, NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 days'
  FROM users u, agents a WHERE u.email = 'juan.perez@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0014', 'Solicitud de vacaciones', 'Quiero solicitar mis vacaciones', 'closed', 'low', 'RRHH', u.id, a.id, NOW() - INTERVAL '12 days', NOW() - INTERVAL '7 days'
  FROM users u, agents a WHERE u.email = 'maria.garcia@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0015', 'Instalación de VPN', 'Necesito configurar VPN para trabajar desde casa', 'assigned', 'medium', 'Redes', u.id, a.id, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
  FROM users u, agents a WHERE u.email = 'carlos.lopez@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0016', 'Pantalla azul', 'Mi PC muestra pantalla azul', 'new', 'high', 'Hardware', u.id, a.id, NOW(), NOW()
  FROM users u, agents a WHERE u.email = 'ana.martinez@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0017', 'Licencia de software', 'Necesito licencia de Photoshop', 'pending', 'low', 'Software', u.id, a.id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
  FROM users u, agents a WHERE u.email = 'juan.perez@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0018', 'Problema con micrófono', 'El micrófono no funciona en reuniones', 'resolved', 'medium', 'Audio', u.id, a.id, NOW() - INTERVAL '9 days', NOW() - INTERVAL '4 days'
  FROM users u, agents a WHERE u.email = 'maria.garcia@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0019', 'Error en reporte', 'El reporte de ventas no genera', 'in_progress', 'high', 'Aplicaciones', u.id, a.id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  FROM users u, agents a WHERE u.email = 'carlos.lopez@empresa.com'
  UNION ALL
  SELECT gen_random_uuid(), 'TKT-0020', 'Solicitud de monitor', 'Necesito un segundo monitor', 'closed', 'low', 'Hardware', u.id, a.id, NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days'
  FROM users u, agents a WHERE u.email = 'ana.martinez@empresa.com'
) AS tickets;

-- Show results
SELECT status, COUNT(*) as total FROM tickets GROUP BY status ORDER BY status;
SELECT 'Total tickets:' as info, COUNT(*) as total FROM tickets;
