-- Time entries (con usuarios existentes)
INSERT INTO time_entries (description, minutes, "ticketId", "userId", billable) VALUES 
('Trabajo en ticket TKT-001', 45, '6e2e73f0-91d9-4769-850b-5dbf8a4b26bf', '9828b602-ac5a-4ab6-89a6-2de4fefbdde2', false),
('Revision de sistema', 30, '1732783a-cb73-4b9c-82de-265515d1492b', '9828b602-ac5a-4ab6-89a6-2de4fefbdde2', false),
('Soporte tecnico', 60, '2a17af48-7497-4b05-9c78-a6949178d9a1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true),
('Configuracion', 25, '0782b3a9-2ba5-47d7-a5ea-7d7d6bf1c453', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', false),
('Mantenimiento', 90, 'bc5e2d42-ea8d-4afa-9a6b-9f56767f8120', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true);
