// Seed script to create sample tickets for the dashboard
import { DataSource } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority } from '../src/modules/tickets/entities/ticket.entity';
import { User } from '../src/modules/users/entities/user.entity';
import { Agent } from '../src/modules/agents/entities/agent.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'servicedesk',
  password: 'servicedesk123',
  database: 'servicedesk',
  entities: [Ticket, User, Agent],
});

async function seed() {
  await dataSource.initialize();
  
  console.log('🔄 Creating sample users...');
  const users = await dataSource.getRepository(User).save([
    { email: 'admin@servicedesk.com', displayName: 'Administrator', role: 'admin', isActive: true },
    { email: 'juan.perez@empresa.com', displayName: 'Juan Pérez', role: 'user', isActive: true },
    { email: 'maria.garcia@empresa.com', displayName: 'María García', role: 'user', isActive: true },
    { email: 'carlos.lopez@empresa.com', displayName: 'Carlos López', role: 'user', isActive: true },
    { email: 'ana.martinez@empresa.com', displayName: 'Ana Martínez', role: 'user', isActive: true },
  ]);

  console.log('🔄 Creating sample agents...');
  const agents = await dataSource.getRepository(Agent).save([
    { userId: users[0].id, level: 3, isAvailable: true, skills: 'redes,sistemas,base de datos', ticketCapacity: 10, currentTickets: 3 },
  ]);

  console.log('🔄 Creating sample tickets...');
  const now = new Date();
  const tickets = [];
  
  // Create tickets over the past 30 days
  const ticketData = [
    { title: 'Servidor no responde', description: 'El servidor principal no está respondiendo', status: TicketStatus.IN_PROGRESS, priority: TicketPriority.CRITICAL, category: 'Infraestructura', daysAgo: 0 },
    { title: 'Solicitud de acceso a sistema', description: 'Necesito acceso al ERP', status: TicketStatus.NEW, priority: TicketPriority.HIGH, category: 'Acceso', daysAgo: 1 },
    { title: 'Error en aplicación', description: 'La aplicación de facturación muestra error', status: TicketStatus.PENDING, priority: TicketPriority.MEDIUM, category: 'Aplicaciones', daysAgo: 2 },
    { title: 'Problema de red WiFi', description: 'No hay conexión a internet en oficina', status: TicketStatus.RESOLVED, priority: TicketPriority.HIGH, category: 'Redes', daysAgo: 3 },
    { title: 'Instalación de software', description: 'Necesito instalar Visual Studio Code', status: TicketStatus.CLOSED, priority: TicketPriority.LOW, category: 'Software', daysAgo: 5 },
    { title: 'Password olvidado', description: 'No puedo acceder a mi cuenta', status: TicketStatus.NEW, priority: TicketPriority.HIGH, category: 'Acceso', daysAgo: 1 },
    { title: 'Upgrade de memoria RAM', description: 'Mi computador está lento', status: TicketStatus.ASSIGNED, priority: TicketPriority.MEDIUM, category: 'Hardware', daysAgo: 4 },
    { title: 'Consulta sobre factura', description: 'Tengo duda con la última factura', status: TicketStatus.PENDING, priority: TicketPriority.LOW, category: 'Facturación', daysAgo: 6 },
    { title: 'Backup de archivos', description: 'Necesito recuperar archivos eliminados', status: TicketStatus.RESOLVED, priority: TicketPriority.MEDIUM, category: 'Datos', daysAgo: 8 },
    { title: 'Problema con impresora', description: 'La impresora no funciona', status: TicketStatus.CLOSED, priority: TicketPriority.LOW, category: 'Hardware', daysAgo: 10 },
    { title: 'Creación de usuario nuevo', description: 'Nuevo empleado necesita acceso', status: TicketStatus.NEW, priority: TicketPriority.MEDIUM, category: 'Acceso', daysAgo: 2 },
    { title: 'Error de base de datos', description: 'La base de datos está muy lenta', status: TicketStatus.IN_PROGRESS, priority: TicketPriority.CRITICAL, category: 'Base de datos', daysAgo: 1 },
    { title: 'Configuración de email', description: 'No puedo recibir correos', status: TicketStatus.RESOLVED, priority: TicketPriority.HIGH, category: 'Email', daysAgo: 7 },
    { title: 'Solicitud de vacaciones', description: 'Quiero solicitar mis vacaciones', status: TicketStatus.CLOSED, priority: TicketPriority.LOW, category: 'RRHH', daysAgo: 12 },
    { title: 'Instalación de VPN', description: 'Necesito configurar VPN para trabajar desde casa', status: TicketStatus.ASSIGNED, priority: TicketPriority.MEDIUM, category: 'Redes', daysAgo: 3 },
    { title: 'Pantalla azul', description: 'Mi PC muestra pantalla azul', status: TicketStatus.NEW, priority: TicketPriority.HIGH, category: 'Hardware', daysAgo: 0 },
    { title: 'Licencia de software', description: 'Necesito licencia de Photoshop', status: TicketStatus.PENDING, priority: TicketPriority.LOW, category: 'Software', daysAgo: 5 },
    { title: 'Problema con micrófono', description: 'El micrófono no funciona en reuniones', status: TicketStatus.RESOLVED, priority: TicketPriority.MEDIUM, category: 'Audio', daysAgo: 9 },
    { title: 'Error en reporte', description: 'El reporte de ventas no genera', status: TicketStatus.IN_PROGRESS, priority: TicketPriority.HIGH, category: 'Aplicaciones', daysAgo: 2 },
    { title: 'Solicitud de monitor', description: 'Necesito un segundo monitor', status: TicketStatus.CLOSED, priority: TicketPriority.LOW, category: 'Hardware', daysAgo: 15 },
  ];

  let ticketNumber = 1;
  for (const t of ticketData) {
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - t.daysAgo);
    
    let resolvedAt = null;
    let closedAt = null;
    if (t.status === TicketStatus.RESOLVED) {
      resolvedAt = new Date(createdAt);
      resolvedAt.setHours(resolvedAt.getHours() + Math.floor(Math.random() * 24) + 1);
    }
    if (t.status === TicketStatus.CLOSED) {
      closedAt = new Date(createdAt);
      closedAt.setDate(closedAt.getDate() + Math.floor(Math.random() * 5) + 1);
    }

    tickets.push({
      ticketNumber: `TKT-${String(ticketNumber++).padStart(4, '0')}`,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      category: t.category,
      requesterId: users[Math.floor(Math.random() * (users.length - 1)) + 1].id,
      assignedToId: agents[0].id,
      createdAt,
      updatedAt: now,
      resolvedAt,
      closedAt,
    });
  }

  await dataSource.getRepository(Ticket).save(tickets);
  
  console.log(`✅ Created ${tickets.length} sample tickets!`);
  
  await dataSource.destroy();
}

seed().catch(console.error);
