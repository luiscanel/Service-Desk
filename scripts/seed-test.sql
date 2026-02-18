-- Script de seed para Service Desk
-- Ejemplo de inserción

INSERT INTO tickets (title, description, status, priority, category, "requesterEmail", "requesterId", "ticketNumber") 
VALUES ('Test ticket', 'Desc test', 'new', 'high', 'Software', 'test@test.com', '9828b602-ac5a-4ab6-89a6-2de4fefbdde2', 'TKT-TEST-001');
