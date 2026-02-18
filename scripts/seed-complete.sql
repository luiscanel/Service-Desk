-- =============================================
-- SEED COMPLETO - SERVICE DESK TEKNAO (CORREGIDO)
-- =============================================

-- 1. AGENTES
INSERT INTO agents ("userId", level, "isAvailable", skills, "ticketCapacity", "currentTickets") VALUES 
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 1, true, 'soporte_basico,redes,hardware', 10, 0),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 1, true, 'soporte_basico,software,windows', 8, 0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 2, true, 'base_datos,sql,servidores', 5, 0),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 2, true, 'desarrollo,api,javascript', 6, 0),
('29fc8781-ca77-4ab3-8f76-62bb5b72a074', 3, true, 'seguridad,linux,cloud', 3, 0);

-- 2. MACROS
INSERT INTO macros (name, category, content, "isActive", "createdAt", "updatedAt") VALUES 
('Respuesta WiFi', 'Redes', 'Hemos verificado la configuracion de su red. Por favor reinicie su router y conexion.', true, NOW(), NOW()),
('Ticket asignado', 'Sistema', 'Su ticket ha sido asignado a nuestro equipo tecnico.', true, NOW(), NOW()),
('Cierre de ticket', 'Sistema', 'Gracias por contactarnos. Su ticket ha sido cerrado.', true, NOW(), NOW()),
('Solicitud de acceso', 'Accesos', 'Su solicitud de acceso ha sido procesada.', true, NOW(), NOW()),
('Problema de hardware', 'Hardware', 'Se ha registrado su reporte de hardware.', true, NOW(), NOW()),
('Restablecer password', 'Accesos', 'Use la opcion Olvide mi contrasena en el login.', true, NOW(), NOW()),
('Actualizacion de software', 'Software', 'Su solicitud de actualizacion ha sido programada.', true, NOW(), NOW()),
('Impresora', 'Hardware', 'Se ha registrado el reporte de la impresora.', true, NOW(), NOW());

-- 3. SETTINGS
INSERT INTO settings (key, value, category) VALUES 
('company_name', 'Teknao', 'general'),
('company_logo', 'https://teknao.com/logo.png', 'general'),
('support_email', 'soporte@teknao.com', 'support'),
('support_phone', '+52 55 1234 5678', 'support'),
('timezone', 'America/Mexico_City', 'general'),
('language', 'es', 'general'),
('date_format', 'DD/MM/YYYY', 'general'),
('currency', 'MXN', 'general'),
('smtp_host', 'smtp.gmail.com', 'email'),
('smtp_port', '587', 'email'),
('smtp_user', 'noreply@teknao.com', 'email'),
('email_from', 'Service Desk Teknao <noreply@teknao.com>', 'email'),
('auto_assign', 'true', 'tickets'),
('default_sla', 'sla003', 'tickets');

-- 4. KNOWLEDGE CATEGORIES
INSERT INTO knowledge_categories (name, description, icon, "order", "isActive") VALUES 
('Hardware', 'Articulos sobre hardware', 'cpu', 1, true),
('Software', 'Articulos sobre software', 'package', 2, true),
('Redes', 'Articulos sobre redes', 'wifi', 3, true),
('Seguridad', 'Articulos de seguridad', 'shield', 4, true),
('FAQ', 'Preguntas frecuentes', 'help-circle', 5, true);

-- 5. TAGS
INSERT INTO tags (name, color) VALUES 
('urgente', '#ef4444'),
('bloqueante', '#dc2626'),
('pendiente_cliente', '#f59e0b'),
('en_proceso', '#3b82f6'),
('resuelto', '#10b981'),
('cerrado', '#6b7280'),
('spam', '#9ca3af'),
('mejora', '#8b5cf6'),
('bug', '#ef4444'),
('feature', '#3b82f6');

-- 6. TIME ENTRIES
INSERT INTO time_entries ("ticketId", "userId", minutes, description, billable) 
SELECT t.id, a."userId", (random() * 120 + 30)::int, 'Trabajo en ticket ' || t."ticketNumber", false
FROM tickets t
CROSS JOIN (SELECT id, "userId" FROM agents LIMIT 1) a
WHERE t.id IS NOT NULL 
LIMIT 15;

-- 7. PORTAL CLIENTS
INSERT INTO portal_clients (email, name, company, phone, "accessToken", "isActive") VALUES 
('contacto@acme.com', 'Acme Corp', 'Acme Corporation', '+52 55 1111 1111', 'token_acme_123', true),
('soporte@techsolutions.com', 'Tech Solutions', 'Tech Solutions SA', '+52 55 2222 2222', 'token_tech_456', true),
('admin@globalservices.com', 'Global Services', 'Global Services', '+52 55 3333 3333', 'token_global_789', true),
('it@miempresa.com', 'Mi Empresa', 'Mi Empresa SA', '+52 55 4444 4444', 'token_miempresa_101', true),
('sistemas@datacenterpro.com', 'DataCenter Pro', 'DataCenter Pro', '+52 55 5555 5555', 'token_datacenter_202', true);

-- 8. SCHEDULED REPORTS
INSERT INTO scheduled_reports (name, "reportType", frequency, recipients, "isActive", "lastRunAt", "nextRunAt") VALUES 
('Reporte semanal de tickets', 'tickets', 'weekly', 'manager@teknao.com', true, NOW() - INTERVAL '7 days', NOW() + INTERVAL '7 days'),
('Resumen mensual', 'summary', 'monthly', 'admin@teknao.com', true, NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days'),
('Tickets por agente', 'agents', 'daily', 'jefe.tickets@teknao.com', true, NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day'),
('SLA cumplimiento', 'sla', 'weekly', 'manager@teknao.com', true, NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days');

-- 9. DASHBOARD WIDGETS
INSERT INTO dashboard_widgets ("userId", "widgetType", title, position, "isVisible") VALUES 
('9828b602-ac5a-4ab6-89a6-2de4fefbdde2', 'stats', 'Estadisticas', 0, true),
('9828b602-ac5a-4ab6-89a6-2de4fefbdde2', 'ticketsChart', 'Tickets por Estado', 1, true),
('9828b602-ac5a-4ab6-89a6-2de4fefbdde2', 'ticketsTrend', 'Tendencia de Tickets', 2, true),
('9828b602-ac5a-4ab6-89a6-2de4fefbdde2', 'recentTickets', 'Tickets Recientes', 3, true),
('9828b602-ac5a-4ab6-89a6-2de4fefbdde2', 'topAgents', 'Mejores Agentes', 4, true),
('9828b602-ac5a-4ab6-89a6-2de4fefbdde2', 'priorityBreakdown', 'Por Prioridad', 5, true),
('9828b602-ac5a-4ab6-89a6-2de4fefbdde2', 'slaCompliance', 'Cumplimiento SLA', 6, true),
('9828b602-ac5a-4ab6-89a6-2de4fefbdde2', 'categoryBreakdown', 'Por Categoria', 7, true);

-- 10. AUDIT LOGS
INSERT INTO audit_logs (action, entity, "entityId", "userId", "userEmail", "oldValue", "newValue", "ipAddress") 
SELECT 
  (ARRAY['create', 'update', 'delete', 'login', 'logout'])[floor(random()*5)+1],
  (ARRAY['ticket', 'user', 'agent', 'setting', 'macro'])[floor(random()*5)+1],
  gen_random_uuid()::text,
  '9828b602-ac5a-4ab6-89a6-2de4fefbdde2',
  'admin@test.com',
  '{"status": "old"}',
  '{"status": "new"}',
  '192.168.1.' || (random()*254+1)::int
FROM generate_series(1, 30);

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
