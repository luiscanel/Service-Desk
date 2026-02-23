import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ 
  cors: { 
    origin: '*',
    credentials: true
  },
  namespace: '/notifications'
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);
  
  @WebSocketServer()
  server: Server;

  // Map clientId -> { userId, email }
  private connectedClients = new Map<string, { userId: string; email: string }>();
  // Map userId -> Set of clientIds
  private userClients = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const clientData = this.connectedClients.get(client.id);
    if (clientData) {
      // Remove from userClients
      const userClientSet = this.userClients.get(clientData.userId);
      if (userClientSet) {
        userClientSet.delete(client.id);
        if (userClientSet.size === 0) {
          this.userClients.delete(clientData.userId);
        }
      }
      this.connectedClients.delete(client.id);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, payload: { userId: string; email: string }) {
    // Store client info
    this.connectedClients.set(client.id, payload);
    
    // Track user's clients
    if (!this.userClients.has(payload.userId)) {
      this.userClients.set(payload.userId, new Set());
    }
    this.userClients.get(payload.userId)!.add(client.id);
    
    this.logger.log(`User registered: ${payload.email} (${payload.userId})`);
    
    // Confirm registration
    client.emit('registered', { clientId: client.id, userId: payload.userId });
    
    return { event: 'registered', data: { clientId: client.id } };
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    return { event: 'pong', data: { timestamp: new Date().toISOString() } };
  }

  // Notify when new ticket is created
  emitNewTicket(ticket: any) {
    this.logger.log(`Emitting ticket:created for ${ticket.ticketNumber}`);
    this.server.emit('ticket:created', ticket);
  }

  // Notify when ticket is assigned
  emitTicketAssigned(ticket: any, agentEmail: string) {
    this.logger.log(`Emitting ticket:assigned for ${ticket.ticketNumber}`);
    this.server.emit('ticket:assigned', { ticket, agentEmail });
  }

  // Notify when ticket is updated
  emitTicketUpdated(ticket: any) {
    this.server.emit('ticket:updated', ticket);
  }

  // Notify when ticket is resolved
  emitTicketResolved(ticket: any) {
    this.logger.log(`Emitting ticket:resolved for ${ticket.ticketNumber}`);
    this.server.emit('ticket:resolved', ticket);
  }

  // Notify when SLA is about to breach
  emitSlaWarning(ticket: any) {
    this.logger.warn(`SLA warning for ticket ${ticket.ticketNumber}`);
    this.server.emit('sla:warning', ticket);
  }

  // Notify when SLA is breached
  emitSlaBreached(ticket: any) {
    this.logger.error(`SLA breached for ticket ${ticket.ticketNumber}`);
    this.server.emit('sla:breached', ticket);
  }

  // Send notification to specific user
  notifyUser(userId: string, event: string, data: any) {
    const clientIds = this.userClients.get(userId);
    if (clientIds && clientIds.size > 0) {
      this.logger.log(`Notifying user ${userId}: ${event}`);
      for (const clientId of clientIds) {
        this.server.to(clientId).emit(event, data);
      }
    } else {
      this.logger.debug(`User ${userId} not connected, skipping notification: ${event}`);
    }
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    this.logger.log(`Broadcasting: ${event}`);
    this.server.emit(event, data);
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.userClients.size;
  }

  // Check if user is connected
  isUserConnected(userId: string): boolean {
    return this.userClients.has(userId);
  }
}
