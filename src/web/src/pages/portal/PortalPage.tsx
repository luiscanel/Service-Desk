import { useState } from 'react';
import axios from 'axios';
import './Portal.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function PortalPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'search'>('create');
  const [ticketNumber, setTicketNumber] = useState('');
  const [email, setEmail] = useState('');
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    requesterEmail: '',
    requesterName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await axios.post(`${API_URL}/public/tickets`, formData);
      setMessage(`Ticket creado: ${response.data.ticketNumber}`);
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        requesterEmail: '',
        requesterName: '',
      });
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error al crear ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTicket(null);
    setMessage('');
    
    try {
      const response = await axios.get(`${API_URL}/public/tickets/${ticketNumber}`);
      if (response.data.success) {
        setTicket(response.data.ticket);
      } else {
        setMessage(response.data.message);
      }
    } catch (error: any) {
      setMessage('Ticket no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: '#3b82f6',
      assigned: '#f59e0b',
      in_progress: '#8b5cf6',
      resolved: '#10b981',
      closed: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="portal-container">
      <div className="portal-header">
        <h1>🎫 Portal de Tickets</h1>
        <p>Soporte técnico - Seguimiento de solicitudes</p>
      </div>

      <div className="portal-tabs">
        <button
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          📝 Crear Ticket
        </button>
        <button
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 Buscar Ticket
        </button>
      </div>

      <div className="portal-content">
        {activeTab === 'create' ? (
          <form onSubmit={handleSubmit} className="portal-form">
            <h2>Nueva Solicitud</h2>
            
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={formData.requesterName}
                onChange={(e) => setFormData({...formData, requesterName: e.target.value})}
                required
                placeholder="Tu nombre"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.requesterEmail}
                onChange={(e) => setFormData({...formData, requesterEmail: e.target.value})}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label>Asunto</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                placeholder="Describe tu problema"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={4}
                placeholder="Detalles adicionales..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Redes">Redes</option>
                  <option value="Accesos">Accesos</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Prioridad</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Enviando...' : 'Enviar Ticket'}
            </button>

            {message && (
              <div className={`message ${message.includes('creado') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
          </form>
        ) : (
          <div className="portal-search">
            <h2>Buscar Ticket</h2>
            
            <form onSubmit={handleSearch} className="search-form">
              <div className="form-group">
                <label>Número de Ticket</label>
                <input
                  type="text"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  placeholder="TKT-2026-0001"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Tu Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </form>

            {message && <div className="message error">{message}</div>}

            {ticket && (
              <div className="ticket-result">
                <h3>📋 Ticket #{ticket.ticketNumber}</h3>
                <div className="ticket-info">
                  <div className="info-row">
                    <span className="label">Asunto:</span>
                    <span className="value">{ticket.title}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Estado:</span>
                    <span 
                      className="value status-badge"
                      style={{ backgroundColor: getStatusColor(ticket.status) }}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Prioridad:</span>
                    <span className="value">{ticket.priority}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Categoría:</span>
                    <span className="value">{ticket.category}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Creado:</span>
                    <span className="value">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="portal-footer">
        <p>© 2026 Service Desk - Todos los derechos reservados</p>
      </div>
    </div>
  );
}
