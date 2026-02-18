import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, { userId: string; email: string }>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, payload: { userId: string; email: string }) {
    this.connectedClients.set(client.id, payload);
    console.log(`User registered: ${payload.email}`);
    return { event: 'registered', data: { clientId: client.id } };
  }

  // Notify when new ticket is created
  emitNewTicket(ticket: any) {
    this.server.emit('ticket:created', ticket);
  }

  // Notify when ticket is assigned
  emitTicketAssigned(ticket: any, agentEmail: string) {
    this.server.emit('ticket:assigned', { ticket, agentEmail });
  }

  // Notify when ticket is updated
  emitTicketUpdated(ticket: any) {
    this.server.emit('ticket:updated', ticket);
  }

  // Notify when ticket is resolved
  emitTicketResolved(ticket: any) {
    this.server.emit('ticket:resolved', ticket);
  }

  // Notify when SLA is about to breach
  emitSlaWarning(ticket: any) {
    this.server.emit('sla:warning', ticket);
  }

  // Notify when SLA is breached
  emitSlaBreached(ticket: any) {
    this.server.emit('sla:breached', ticket);
  }

  // Send notification to specific user
  notifyUser(userId: string, event: string, data: any) {
    for (const [clientId, client] of this.connectedClients.entries()) {
      if (client.userId === userId) {
        this.server.to(clientId).emit(event, data);
      }
    }
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
