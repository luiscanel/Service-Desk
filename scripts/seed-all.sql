-- =============================================
-- SEED COMPLETO - SERVICE DESK TEKNAO
-- =============================================

-- 1. AGENTES (5 agentes)
INSERT INTO agents ("userId", level, "isAvailable", skills, "ticketCapacity", "currentTickets") VALUES 
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 1, true, 'soporte_basico,redes,hardware', 10, 0),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 1, true, 'soporte_basico,software,windows', 8, 0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 2, true, 'base_datos,sql,servidores', 5, 0),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 2, true, 'desarrollo,api,javascript', 6, 0),
('29fc8781-ca77-4ab3-8f76-62bb5b72a074', 3, true, 'seguridad,linux,cloud', 3, 0);

-- 2. MACROS
INSERT INTO macros (name, category, content, "isActive", "createdAt", "updatedAt") VALUES 
('Respuesta WiFi', 'Redes', 'Hemos verificado la configuración de su red. Por favor reinicie su router y conexion.', true, NOW(), NOW()),
('Ticket asignado', 'Sistema', 'Su ticket ha sido asignado a nuestro equipo técnico. Le notificaremos cuando sea resuelto.', true, NOW(), NOW()),
('Cierre de ticket', 'Sistema', 'Gracias por contactarnos. Su ticket ha sido cerrado. Si tiene alguna consulta, abra un nuevo ticket.', true, NOW(), NOW()),
('Solicitud de acceso', 'Accesos', 'Su solicitud de acceso ha sido procesada. Por favor intente acceder nuevamente.', true, NOW(), NOW()),
('Problema de hardware', 'Hardware', 'Se ha registrado su reporte de hardware. Un técnico le contactará para coordinar la revisión.', true, NOW(), NOW()),
('Restablecer password', 'Accesos', 'Para restablecer su contraseña, use la opción "Olvidé mi contraseña" en la página de login.', true, NOW(), NOW()),
('Actualizacion de software', 'Software', 'Su solicitud de actualización ha sido programada. Un técnico realizará la instalación.', true, NOW(), NOW()),
('Impresora', 'Hardware', 'Se ha registrado el reporte de la impresora. Por favor verifique la conexión de cables.', true, NOW(), NOW());

-- 3. SETTINGS
INSERT INTO settings (key, value, description, "isPublic", "createdAt", "updatedAt") VALUES 
('company_name', 'Teknao', 'Nombre de la empresa', true, NOW(), NOW()),
('company_logo', 'https://teknao.com/logo.png', 'URL del logo', true, NOW(), NOW()),
('support_email', 'soporte@teknao.com', 'Email de soporte', true, NOW(), NOW()),
('support_phone', '+52 55 1234 5678', 'Teléfono de soporte', true, NOW(), NOW()),
('timezone', 'America/Mexico_City', 'Zona horaria', true, NOW(), NOW()),
('language', 'es', 'Idioma por defecto', true, NOW(), NOW()),
('date_format', 'DD/MM/YYYY', 'Formato de fecha', true, NOW(), NOW()),
('currency', 'MXN', 'Moneda', true, NOW(), NOW()),
('smtp_host', 'smtp.gmail.com', 'Servidor SMTP', false, NOW(), NOW()),
('smtp_port', '587', 'Puerto SMTP', false, NOW(), NOW()),
('smtp_user', 'noreply@teknao.com', 'Usuario SMTP', false, NOW(), NOW()),
('email_from', 'Service Desk Teknao <noreply@teknao.com>', 'Emailremitente', true, NOW(), NOW()),
('auto_assign', 'true', 'Autoasignar tickets', true, NOW(), NOW()),
('default_sla', 'sla003', 'SLA por defecto', true, NOW(), NOW());

-- 4. KNOWLEDGE CATEGORIES
INSERT INTO knowledge_categories (name, description, "parentId", "createdAt", "updatedAt") VALUES 
('Hardware', 'Articulos sobre hardware', NULL, NOW(), NOW()),
('Software', 'Articulos sobre software', NULL, NOW(), NOW()),
('Redes', 'Articulos sobre redes', NULL, NOW(), NOW()),
('Seguridad', 'Articulos de seguridad', NULL, NOW(), NOW()),
('FAQ', 'Preguntas frecuentes', NULL, NOW(), NOW());

-- 5. TAGS
INSERT INTO tags (name, color, "createdAt", "updatedAt") VALUES 
('urgente', '#ef4444', NOW(), NOW()),
('bloqueante', '#dc2626', NOW(), NOW()),
('pendiente_cliente', '#f59e0b', NOW(), NOW()),
('en_proceso', '#3b82f6', NOW(), NOW()),
('resuelto', '#10b981', NOW(), NOW()),
('cerrado', '#6b7280', NOW(), NOW()),
('spam', '#9ca3af', NOW(), NOW()),
('mejora', '#8b5cf6', NOW(), NOW()),
('bug', '#ef4444', NOW(), NOW()),
('feature', '#3b82f6', NOW(), NOW());

-- 6. TIME ENTRIES (entradas de tiempo en tickets)
INSERT INTO time_entries (description, duration, "ticketId", "agentId", "createdAt") 
SELECT 
  'Trabajo en ticket ' || "ticketNumber",
  (random() * 120 + 30)::int,
  id,
  (SELECT id FROM agents LIMIT 1),
  NOW() - (random() * 7)::int * INTERVAL '1 day'
FROM tickets WHERE id IS NOT NULL LIMIT 20;

-- 7. PORTAL CLIENTS
INSERT INTO portal_clients (name, email, "companyName", "isActive", "createdAt", "updatedAt") VALUES 
('Acme Corp', 'contacto@acme.com', 'Acme Corporation', true, NOW(), NOW()),
('Tech Solutions', 'soporte@techsolutions.com', 'Tech Solutions SA', true, NOW(), NOW()),
('Global Services', 'admin@globalservices.com', 'Global Services', true, NOW(), NOW()),
('Mi Empresa', 'it@miempresa.com', 'Mi Empresa SA', true, NOW(), NOW()),
('DataCenter Pro', 'sistemas@datacenterpro.com', 'DataCenter Pro', true, NOW(), NOW());

-- 8. SCHEDULED REPORTS
INSERT INTO scheduled_reports (name, type, frequency, "lastRun", "nextRun", "isActive", "createdAt", "updatedAt") VALUES 
('Reporte semanal de tickets', 'tickets', 'weekly', NOW() - INTERVAL '7 days', NOW() + INTERVAL '7 days', true, NOW(), NOW()),
('Resumen mensual', 'summary', 'monthly', NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days', true, NOW(), NOW()),
('Tickets por agente', 'agents', 'daily', NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day', true, NOW(), NOW()),
('SLA cumplimiento', 'sla', 'weekly', NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days', true, NOW(), NOW());

-- 9. DASHBOARD WIDGETS
INSERT INTO dashboard_widgets ("widgetType", title, position, "isVisible", "createdAt", "updatedAt") VALUES 
('stats', 'Estadisticas', 0, true, NOW(), NOW()),
('ticketsChart', 'Tickets por Estado', 1, true, NOW(), NOW()),
('ticketsTrend', 'Tendencia de Tickets', 2, true, NOW(), NOW()),
('recentTickets', 'Tickets Recientes', 3, true, NOW(), NOW()),
('topAgents', 'Mejores Agentes', 4, true, NOW(), NOW()),
('priorityBreakdown', 'Por Prioridad', 5, true, NOW(), NOW()),
('slaCompliance', 'Cumplimiento SLA', 6, true, NOW(), NOW()),
('categoryBreakdown', 'Por Categoria', 7, true, NOW(), NOW());

-- 10. AUDIT LOGS
INSERT INTO audit_logs (action, entity, "entityId", "userId", "userEmail", details, "ipAddress", "createdAt")
SELECT 
  (ARRAY['create', 'update', 'delete', 'login', 'logout'])[floor(random()*5)+1],
  (ARRAY['ticket', 'user', 'agent', 'setting', 'macro'])[floor(random()*5)+1],
  gen_random_uuid()::text,
  '9828b602-ac5a-4ab6-89a6-2de4fefbdde2',
  'admin@test.com',
  '{"action": "test"}',
  '192.168.1.' || (random()*254+1)::int,
  NOW() - (random()*30)::int * INTERVAL '1 day'
FROM generate_series(1, 50);

-- Verificar
SELECT 'agents' as table_name, COUNT(*) as total FROM agents
UNION ALL SELECT 'macros', COUNT(*) FROM macros
UNION ALL SELECT 'settings', COUNT(*) FROM settings
UNION ALL SELECT 'knowledge_categories', COUNT(*) FROM knowledge_categories
UNION ALL SELECT 'tags', COUNT(*) FROM tags
UNION ALL SELECT 'time_entries', COUNT(*) FROM time_entries
UNION ALL SELECT 'portal_clients', COUNT(*) FROM portal_clients
UNION ALL SELECT 'scheduled_reports', COUNT(*) FROM scheduled_reports
UNION ALL SELECT 'dashboard_widgets', COUNT(*) FROM dashboard_widgets
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL SELECT 'tickets', COUNT(*) FROM tickets
UNION ALL SELECT 'users', COUNT(*) FROM users;
