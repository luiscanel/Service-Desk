import { useEffect, useState } from 'react';
import { ticketsService } from '../../services/api';
import { Card, CardBody, Button, Input, Select, Modal } from '../../components/ui';
import { TicketAttachments } from '../../components/TicketAttachments';

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
}

const priorityOptions = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
];

const categoryOptions = [
  { value: 'Redes', label: 'Redes' },
  { value: 'Sistemas', label: 'Sistemas' },
  { value: 'Seguridad', label: 'Seguridad' },
  { value: 'Hardware', label: 'Hardware' },
  { value: 'Software', label: 'Software' },
];

const statusFilters = [
  { value: 'all', label: 'Todos', color: 'slate' },
  { value: 'new', label: 'Nuevo', color: 'blue' },
  { value: 'in_progress', label: 'En Progreso', color: 'amber' },
  { value: 'pending', label: 'Pendiente', color: 'red' },
  { value: 'resolved', label: 'Resuelto', color: 'green' },
  { value: 'closed', label: 'Cerrado', color: 'slate' },
];

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Software',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await ticketsService.getAll();
      setTickets(response.data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;
      await ticketsService.create({ ...formData, ticketNumber, status: 'new' });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', priority: 'medium', category: 'Software' });
      loadTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este ticket?')) {
      try {
        await ticketsService.delete(id);
        loadTickets();
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filter === 'all' || ticket.status === filter;
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      new: 'bg-blue-50 text-blue-700 border-blue-200',
      assigned: 'bg-blue-50 text-blue-700 border-blue-200',
      in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
      pending: 'bg-red-50 text-red-700 border-red-200',
      resolved: 'bg-green-50 text-green-700 border-green-200',
      closed: 'bg-slate-50 text-slate-700 border-slate-200',
    };
    const labels: Record<string, string> = {
      new: 'Nuevo',
      assigned: 'Asignado',
      in_progress: 'En Progreso',
      pending: 'Pendiente',
      resolved: 'Resuelto',
      closed: 'Cerrado',
    };
    return <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${variants[status] || variants.default}`}>{labels[status] || status}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      low: 'bg-slate-100 text-slate-600',
      medium: 'bg-amber-100 text-amber-600',
      high: 'bg-red-100 text-red-600',
      critical: 'bg-red-200 text-red-700 font-bold',
    };
    return <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${variants[priority] || variants.medium}`}>{priority}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Tickets</h1>
          <p className="text-slate-500 mt-1">Gestiona y da seguimiento a los tickets de soporte</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Ticket
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardBody>
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            
            {/* Status Filters */}
            <div className="flex gap-2 flex-wrap">
              {statusFilters.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFilter(status.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filter === status.value
                      ? status.color === 'blue' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' :
                        status.color === 'amber' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' :
                        status.color === 'red' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' :
                        status.color === 'green' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' :
                        'bg-slate-800 text-white shadow-lg shadow-slate-500/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tickets Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-blue-50">
                <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">ID</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Título</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Categoría</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Estado</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Prioridad</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Fecha</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">Cargando...</td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4">🎫</div>
                      <p className="text-slate-500">No se encontraron tickets</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">{ticket.ticketNumber}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{ticket.title}</div>
                      <div className="text-sm text-slate-500 truncate max-w-xs">{ticket.description}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">{ticket.category}</span>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(ticket.status)}</td>
                    <td className="py-4 px-6">{getPriorityBadge(ticket.priority)}</td>
                    <td className="py-4 px-6 text-sm text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Ticket"
        size="lg"
      >
        <form onSubmit={handleCreateTicket} className="space-y-6">
          <Input
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Título del ticket"
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el problema en detalle..."
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              rows={4}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Prioridad"
              options={priorityOptions}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            />
            <Select
              label="Categoría"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
