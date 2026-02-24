// Plantillas de email para el sistema

export const EMAIL_TEMPLATES = {
  ticketCreated: (ticket: any) => `
    <div style="font-family: Arial, max-width: 600px;">
      <h2>✅ Ticket Creado</h2>
      <p>Tu ticket ha sido creado exitosamente.</p>
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Ticket:</strong> ${ticket.ticketNumber}</p>
        <p><strong>Título:</strong> ${ticket.title}</p>
        <p><strong>Estado:</strong> Nuevo</p>
      </div>
      <p>Nuestro equipo revisará tu solicitud pronto.</p>
    </div>
  `,

  satisfactionSurvey: (ticket: { ticketNumber: string; title: string; category?: string }) => `
    <div style="font-family: Arial, max-width: 600px;">
      <h2>¡Gracias por contactarnos!</h2>
      <p>Tu ticket <strong>${ticket.ticketNumber}</strong> ha sido cerrado.</p>
      <p>Nos gustaría saber tu opinión sobre el servicio recibido.</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Ticket: ${ticket.ticketNumber}</h3>
        <p><strong>Título:</strong> ${ticket.title}</p>
        <p><strong>Categoría:</strong> ${ticket.category || 'Sin categoría'}</p>
      </div>

      <h3>Por favor, evalúa tu experiencia:</h3>
      
      <div style="margin: 20px 0;">
        <p><strong>1. ¿Qué tan satisfecho estás con la solución?</strong></p>
        <p>Del 1 (muy insatisfecho) al 5 (muy satisfecho)</p>
      </div>

      <div style="margin: 20px 0;">
        <p><strong>2. ¿Qué tan bien resolvió el agente tu problema?</strong></p>
        <p>Del 1 al 5</p>
      </div>

      <div style="margin: 20px 0;">
        <p><strong>3. ¿Qué tan satisfecho estás con el tiempo de respuesta?</strong></p>
        <p>Del 1 al 5</p>
      </div>

      <p>Responde a este email con tus respuestas del 1 al 5.</p>
      <p>También puedes escribirnos tus comentarios adicionales.</p>
    </div>
  `,

  approvalRequest: (ticket: { ticketNumber: string; title: string; description: string }, requestedBy: string) => `
    <div style="font-family: Arial, max-width: 600px;">
      <h2>Solicitud de Aprobación</h2>
      <p>Se ha solicitado tu aprobación para el ticket:</p>
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Ticket:</strong> ${ticket.ticketNumber}</p>
        <p><strong>Título:</strong> ${ticket.title}</p>
        <p><strong>Solicitado por:</strong> ${requestedBy}</p>
        <p><strong>Descripción:</strong> ${ticket.description}</p>
      </div>
      <p>Para aprobar o rechazar, responde a este email o accede al sistema.</p>
    </div>
  `,

  approvalResponse: (ticketNumber: string, approved: boolean, comment?: string) => `
    <div style="font-family: Arial, max-width: 600px;">
      <h2>${approved ? '✅ Aprobado' : '❌ Rechazado'}</h2>
      <p>Tu solicitud de aprobación para el ticket ${ticketNumber} ha sido ${approved ? 'aprobada' : 'rechazada'}.</p>
      ${comment ? `<p><strong>Comentario:</strong> ${comment}</p>` : ''}
    </div>
  `,
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
};

export const TICKET_STATUS = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;
