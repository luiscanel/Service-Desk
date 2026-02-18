export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: 'new' | 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  requesterId?: string;
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  userId: string;
  level: number;
  isAvailable: boolean;
  skills: string[];
  ticketCapacity: number;
  currentTickets: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'agent' | 'user';
  isActive: boolean;
}

export interface CreateTicketDto {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedToId?: string;
}
