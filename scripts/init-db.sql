-- Service Desk Database Schema 
  
-- Users Table 
CREATE TABLE IF NOT EXISTS users ( 
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
  email VARCHAR(255) UNIQUE NOT NULL, 
  display_name VARCHAR(255) NOT NULL, 
  azure_ad_object_id VARCHAR(255), 
  role VARCHAR(50) DEFAULT 'user', 
  is_active BOOLEAN DEFAULT true, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 
  
-- Tickets Table 
CREATE TABLE IF NOT EXISTS tickets ( 
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
  ticket_number VARCHAR(50) UNIQUE NOT NULL, 
  title VARCHAR(255) NOT NULL, 
  description TEXT, 
  status VARCHAR(50) DEFAULT 'new', 
  priority VARCHAR(50) DEFAULT 'medium', 
  category VARCHAR(100), 
  requester_id UUID, 
  assigned_to_id UUID, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 
  
-- Agents Table 
CREATE TABLE IF NOT EXISTS agents ( 
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
  user_id UUID NOT NULL, 
  level INTEGER DEFAULT 1, 
  is_available BOOLEAN DEFAULT true, 
  skills VARCHAR(500), 
  ticket_capacity INTEGER DEFAULT 5, 
  current_tickets INTEGER DEFAULT 0, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 
  
-- Sample Data 
INSERT INTO users (email, display_name, role) VALUES 
('admin@servicedesk.com', 'Administrator', 'admin'), 
('agent1@servicedesk.com', 'Agent One', 'agent'), 
('user@servicedesk.com', 'Test User', 'user'); 
  
-- Insert sample agents 
INSERT INTO agents (user_id, level, is_available, skills, ticket_capacity, current_tickets) SELECT id, 1, true, 'redes,sistemas', 5, 0 FROM users WHERE email = 'agent1@servicedesk.com'; 
  
-- Insert sample ticket 
INSERT INTO tickets (ticket_number, title, description, status, priority, category) VALUES ('TKT-0001', 'Sample Ticket', 'This is a sample ticket for testing', 'new', 'medium', 'sistemas'); 
